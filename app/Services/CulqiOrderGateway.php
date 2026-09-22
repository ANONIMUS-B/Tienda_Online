<?php

namespace App\Services;

use App\Models\CompanySetting;
use App\Models\Order;
use App\Models\PaymentAttempt;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CulqiOrderGateway
{
    public function ready(?CompanySetting $settings): bool
    {
        $mode = $settings?->payment_test_mode ? 'test' : 'live';

        return (bool) $settings?->culqi_pagoefectivo_enabled
            && ($settings->culqi_enabled || $settings->payment_gateway_enabled)
            && Str::startsWith($settings->gateway_public_key ?? '', "pk_{$mode}_")
            && Str::startsWith($settings->gateway_secret_key ?? '', "sk_{$mode}_");
    }

    /** @return array<string, mixed> */
    public function configuration(Order $order): array
    {
        $settings = CompanySetting::query()->first();
        $attempt = $order->paymentAttempts()->where('provider', 'culqi')->where('payment_type', 'pagoefectivo')->latest('id')->first();

        return [
            'enabled' => $this->ready($settings),
            'publicKey' => $this->ready($settings) ? $settings->gateway_public_key : null,
            'testMode' => (bool) $settings?->payment_test_mode,
            'amount' => (int) round((float) $order->total * 100),
            'title' => $settings->company_name ?? 'Tienda',
            'attempt' => $attempt,
        ];
    }

    public function create(Order $order): PaymentAttempt
    {
        $settings = CompanySetting::query()->first();
        if (! $this->ready($settings)) {
            throw ValidationException::withMessages(['payment' => 'PagoEfectivo no está disponible para este pedido.']);
        }
        $environment = $settings->payment_test_mode ? 'test' : 'live';
        $reference = (string) Str::uuid();
        $expiresAt = now()->addHours((int) ($settings->culqi_cip_expiration_hours ?: 24));
        $submit = false;
        $attempt = DB::transaction(function () use ($order, $settings, $environment, $reference, $expiresAt, &$submit): PaymentAttempt {
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);
            if ($lockedOrder->payment_method !== 'pagoefectivo' || $lockedOrder->payment_status === 'paid' || $lockedOrder->status === 'cancelled') {
                throw ValidationException::withMessages(['payment' => 'Este pedido no admite un nuevo código de PagoEfectivo.']);
            }
            $existing = $lockedOrder->paymentAttempts()->where('payment_type', 'pagoefectivo')->whereIn('status', ['processing', 'pending', 'paid', 'test_paid'])->latest('id')->first();
            if ($existing && (! $existing->expires_at || Carbon::parse($existing->expires_at)->isFuture())) {
                return $existing;
            }
            $submit = true;

            return $lockedOrder->paymentAttempts()->create([
                'reference' => $reference,
                'provider' => 'culqi',
                'payment_type' => 'pagoefectivo',
                'environment' => $environment,
                'amount' => (int) round((float) $lockedOrder->total * 100),
                'status' => 'processing',
                'source_hash' => hash('sha256', $reference),
                'source_id' => $reference,
                'secret_key' => $settings->gateway_secret_key,
                'email' => $lockedOrder->customer_email,
                'expires_at' => $expiresAt,
            ]);
        }, 3);
        if (! $submit) {
            return $attempt;
        }

        $names = preg_split('/\s+/', trim($order->customer_name), 2) ?: [];
        try {
            $response = Http::baseUrl('https://api.culqi.com/v2')->withToken($settings->gateway_secret_key)->acceptJson()->timeout(20)->post('/orders', [
                'amount' => $attempt->amount,
                'currency_code' => 'PEN',
                'description' => 'Pedido '.$order->number,
                'order_number' => $order->number.'-'.$attempt->id,
                'client_details' => [
                    'first_name' => $names[0] ?? 'Cliente',
                    'last_name' => $names[1] ?? 'JBTECHLINE',
                    'email' => $order->customer_email,
                    'phone_number' => preg_replace('/\D/', '', $order->customer_phone),
                ],
                'expiration_date' => $expiresAt->timestamp,
                'confirm' => false,
                'metadata' => ['payment_reference' => $reference, 'order_number' => $order->number],
            ]);
        } catch (ConnectionException) {
            $attempt->update(['status' => 'failed', 'message' => 'No se pudo conectar con PagoEfectivo. Inténtalo nuevamente.']);

            return $attempt->fresh();
        }
        $body = $response->json();
        if (! $response->successful() || ! is_string($body['id'] ?? null)) {
            $attempt->update(['status' => 'failed', 'message' => $body['user_message'] ?? 'PagoEfectivo rechazó la creación del código CIP.']);

            return $attempt->fresh();
        }
        $attempt->update(['status' => 'pending', 'provider_order_id' => $body['id'], 'provider_data' => ['payment_code' => $body['payment_code'] ?? null]]);

        return $attempt->fresh();
    }

    public function reconcile(PaymentAttempt $attempt): PaymentAttempt
    {
        if (! $attempt->provider_order_id) {
            return $attempt;
        }
        try {
            $response = Http::baseUrl('https://api.culqi.com/v2')->withToken($attempt->secret_key)->acceptJson()->timeout(15)->get('/orders/'.$attempt->provider_order_id);
        } catch (ConnectionException) {
            return $attempt;
        }
        if (! $response->successful()) {
            return $attempt;
        }
        $data = $response->json();
        $state = strtolower((string) ($data['state'] ?? $data['status'] ?? ''));
        $paid = in_array($state, ['paid', 'completed', 'successful'], true);
        $expired = in_array($state, ['expired', 'cancelled', 'canceled'], true);
        $rawProviderData = $attempt->getRawOriginal('provider_data');
        $storedData = is_string($rawProviderData) ? json_decode($rawProviderData, true) : [];
        $storedPaymentCode = is_array($storedData) ? data_get($storedData, 'payment_code') : null;
        DB::transaction(function () use ($attempt, $data, $paid, $expired, $storedPaymentCode): void {
            $attempt->refresh()->update([
                'status' => $paid ? ($attempt->environment === 'test' ? 'test_paid' : 'paid') : ($expired ? 'failed' : 'pending'),
                'message' => $paid ? 'PagoEfectivo confirmó el pago.' : ($expired ? 'El código CIP venció.' : 'Código CIP pendiente de pago.'),
                'provider_data' => ['payment_code' => $data['payment_code'] ?? $storedPaymentCode],
                'verified_at' => now(),
            ]);
            if ($paid && $attempt->environment === 'live') {
                $attempt->order()->update(['payment_status' => 'paid', 'payment_reference' => $attempt->provider_order_id]);
            }
        });

        return $attempt->fresh();
    }

    public function webhook(string $eventId, string $orderId): bool
    {
        $attempt = PaymentAttempt::query()->where('provider_order_id', $orderId)->first();
        if (! $attempt) {
            return true;
        }
        try {
            $event = Http::baseUrl('https://api.culqi.com/v2')->withToken($attempt->secret_key)->acceptJson()->timeout(15)->get('/events/'.$eventId);
        } catch (ConnectionException) {
            return false;
        }
        if (! $event->successful() || ($event->json('id') !== $eventId)) {
            return ! $event->serverError();
        }

        $this->reconcile($attempt);

        return true;
    }
}
