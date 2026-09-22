<?php

namespace App\Services;

use App\Models\CompanySetting;
use App\Models\Order;
use App\Models\PaymentAttempt;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CulqiGateway
{
    public function ready(?CompanySetting $settings): bool
    {
        $mode = $settings?->payment_test_mode ? 'test' : 'live';

        return ($settings?->culqi_enabled || ($settings?->payment_gateway_enabled && $settings->payment_gateway === 'culqi'))
            && Str::startsWith($settings->gateway_public_key ?? '', "pk_{$mode}_")
            && Str::startsWith($settings->gateway_secret_key ?? '', "sk_{$mode}_")
            && ($settings->culqi_cards_enabled || $settings->culqi_yape_enabled);
    }

    /** @return array<string, mixed> */
    public function configuration(Order $order): array
    {
        $settings = CompanySetting::query()->first();

        return [
            'enabled' => $this->ready($settings),
            'publicKey' => $this->ready($settings) ? $settings->gateway_public_key : null,
            'testMode' => (bool) $settings?->payment_test_mode,
            'cards' => (bool) $settings?->culqi_cards_enabled,
            'yape' => (bool) $settings?->culqi_yape_enabled && $this->amount($order) <= 200000,
            'rsaId' => $settings?->culqi_rsa_id,
            'rsaPublicKey' => $settings?->culqi_rsa_public_key,
            'amount' => $this->amount($order),
            'email' => $order->customer_email,
            'title' => $settings->company_name ?? 'Tienda',
            'attempt' => $order->paymentAttempts()->latest('id')->first(),
        ];
    }

    public function amount(Order $order): int
    {
        return (int) round((float) $order->total * 100);
    }

    public function maximumAmount(?CompanySetting $settings): int
    {
        return $settings?->culqi_cards_enabled ? 999900 : 200000;
    }

    /** @param array<string, mixed> $data */
    public function charge(Order $order, array $data): PaymentAttempt
    {
        $settings = CompanySetting::query()->first();
        if (! $this->ready($settings)) {
            throw ValidationException::withMessages(['payment' => 'Culqi no está disponible. Comunícate con la tienda.']);
        }
        $environment = $settings->payment_test_mode ? 'test' : 'live';
        $isYape = Str::startsWith($data['source_id'], 'ype_');
        if (! Str::startsWith($data['source_id'], ($isYape ? 'ype_' : 'tkn_').$environment.'_')) {
            throw ValidationException::withMessages(['payment' => 'El medio de pago no corresponde al ambiente configurado.']);
        }
        if (($isYape && ! $settings->culqi_yape_enabled) || (! $isYape && ! $settings->culqi_cards_enabled)) {
            throw ValidationException::withMessages(['payment' => 'Este medio de pago está deshabilitado.']);
        }
        $submit = false;
        try {
            $attempt = DB::transaction(function () use ($order, $data, $settings, $environment, $isYape, &$submit): PaymentAttempt {
                $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
                if ($locked->payment_method !== 'gateway' || in_array($locked->payment_status, ['paid', 'refunded'], true) || $locked->status === 'cancelled') {
                    throw ValidationException::withMessages(['payment' => 'Este pedido no admite nuevos cobros.']);
                }
                $amount = $this->amount($locked);
                if ($amount < 300 || $amount > ($isYape ? 200000 : 999900)) {
                    throw ValidationException::withMessages(['payment' => 'El importe está fuera del rango permitido para este medio de pago.']);
                }
                $hash = hash('sha256', $data['source_id']);
                $existing = PaymentAttempt::query()->where('source_hash', $hash)->first();
                if ($existing && $existing->order_id !== $locked->id) {
                    throw ValidationException::withMessages(['payment' => 'El token ya fue utilizado.']);
                }
                if ($existing) {
                    if ($existing->status === 'requires_action' && filled($data['authentication_3DS'] ?? null)) {
                        $existing->update(['status' => 'processing']);
                        $submit = true;
                    }

                    return $existing;
                }
                if ($locked->paymentAttempts()->whereNotIn('status', ['failed', 'test_paid'])
                    ->where(fn ($query) => $query->where('environment', 'live')->orWhere('status', '!=', 'refunded'))->exists()) {
                    throw ValidationException::withMessages(['payment' => 'Hay un pago pendiente de confirmación. Actualiza su estado antes de volver a pagar.']);
                }
                if (filled($data['authentication_3DS'] ?? null)) {
                    throw ValidationException::withMessages(['payment' => 'Primero inicia el pago.']);
                }
                $submit = true;

                return $locked->paymentAttempts()->create([
                    'reference' => (string) Str::uuid(), 'environment' => $environment,
                    'amount' => $amount, 'currency' => 'PEN', 'status' => 'processing',
                    'source_hash' => $hash, 'source_id' => $data['source_id'],
                    'secret_key' => $settings->gateway_secret_key,
                    'device_id' => $data['device_id'] ?? null, 'email' => $data['email'],
                ]);
            });
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['payment' => 'Este token ya tiene una operación registrada. Consulta el estado del pedido.']);
        }
        if (! $submit) {
            return $attempt;
        }

        $payload = [
            'amount' => $attempt->amount, 'currency_code' => 'PEN', 'email' => $attempt->email,
            'source_id' => $attempt->source_id, 'capture' => true, 'installments' => 0,
            'description' => Str::limit('Pedido '.$order->number, 80, ''),
            'metadata' => ['payment_reference' => $attempt->reference, 'order_number' => $order->number],
        ];
        if ($attempt->device_id) {
            $payload['antifraud_details'] = ['device_finger_print_id' => $attempt->device_id];
        }
        if (filled($data['authentication_3DS'] ?? null)) {
            $payload['authentication_3DS'] = $data['authentication_3DS'];
        }
        try {
            $response = $this->client($attempt)->post('/charges', $payload);
        } catch (ConnectionException) {
            return $this->uncertain($attempt);
        }
        $body = $response->json();
        if ($response->successful() && is_array($body) && ($body['object'] ?? null) === 'charge' && filled($body['id'] ?? null)) {
            $attempt->update(['charge_id' => $body['id']]);

            return $this->reconcile($attempt) ?? $this->uncertain($attempt);
        }
        if ($response->successful() && ($body['action_code'] ?? null) === 'REVIEW' && ! $isYape && empty($data['authentication_3DS'])) {
            $attempt->update(['status' => 'requires_action', 'message' => 'Confirma el pago con la verificación de tu banco.']);

            return $attempt->refresh();
        }
        if ($response->clientError() && ($body['object'] ?? null) === 'error' && ! in_array($response->status(), [408, 409, 429], true)) {
            $attempt->update(['status' => 'failed', 'message' => 'Culqi no aprobó el cobro. Revisa los datos o utiliza otro medio de pago.']);

            return $attempt->refresh();
        }

        return $this->uncertain($attempt);
    }

    public function reconcile(PaymentAttempt $attempt, ?string $chargeId = null): ?PaymentAttempt
    {
        $chargeId ??= $attempt->charge_id;
        if (! $chargeId || ! preg_match('/^chr_(test|live)_[a-zA-Z0-9]+$/', $chargeId)) {
            return null;
        }
        try {
            $response = $this->client($attempt)->get('/charges/'.$chargeId);
        } catch (ConnectionException) {
            return null;
        }
        if (! $response->successful() || ! is_array($response->json())) {
            return null;
        }
        $charge = $response->json();
        if (($charge['object'] ?? null) !== 'charge' || ($charge['id'] ?? null) !== $chargeId
            || ! Str::startsWith($chargeId, 'chr_'.$attempt->environment.'_')
            || ($charge['amount'] ?? null) !== $attempt->amount || ($charge['currency_code'] ?? null) !== $attempt->currency
            || ($charge['metadata']['payment_reference'] ?? null) !== $attempt->reference
            || ! hash_equals($attempt->source_hash, hash('sha256', $charge['source']['id'] ?? ''))) {
            return null;
        }

        if (($charge['outcome']['type'] ?? null) === 'operacion_denegada') {
            PaymentAttempt::query()->whereKey($attempt->id)->whereIn('status', ['processing', 'unknown', 'requires_action', 'failed'])->update([
                'status' => 'failed', 'charge_id' => $chargeId, 'verified_at' => now(), 'message' => 'Culqi confirmó que el cobro fue rechazado. Puedes intentar con otro medio.',
            ]);

            return $attempt->refresh();
        }
        if (($charge['capture'] ?? false) !== true || ! in_array($charge['outcome']['type'] ?? null, ['venta_exitosa', 'succesfull_request'], true)) {
            return null;
        }

        return DB::transaction(function () use ($attempt, $charge, $chargeId): PaymentAttempt {
            $order = Order::query()->lockForUpdate()->findOrFail($attempt->order_id);
            $locked = PaymentAttempt::query()->lockForUpdate()->findOrFail($attempt->id);
            $refunded = (int) ($charge['amount_refunded'] ?? 0) >= $locked->amount;
            $status = $refunded ? 'refunded' : ($locked->environment === 'test' ? 'test_paid' : 'paid');
            if ($locked->status === 'refund_pending' && ! $refunded) {
                return $locked;
            }
            if ($locked->status === 'refunded' && ! $refunded) {
                return $locked;
            }
            $locked->update(['charge_id' => $chargeId, 'status' => $status, 'verified_at' => now(),
                'message' => $refunded ? 'Pago devuelto por Culqi.' : ($status === 'test_paid' ? 'Simulación aprobada. No se cobró dinero real.' : 'Pago confirmado por Culqi.')]);
            if ($locked->environment === 'live') {
                $order->update(['payment_status' => $refunded ? 'refunded' : 'paid', 'payment_reference' => $chargeId]);
            }

            return $locked;
        });
    }

    /** @param array<string, mixed> $input */
    public function webhook(array $input): bool
    {
        $eventId = $input['id'] ?? '';
        if (! is_string($eventId) || ! preg_match('/^evt_(test|live)_[a-zA-Z0-9]+$/', $eventId)) {
            return true;
        }
        $data = $input['data'] ?? [];
        $data = is_string($data) ? json_decode($data, true) : $data;
        if (! is_array($data)) {
            return true;
        }
        $orderId = ($data['object'] ?? null) === 'order' ? ($data['id'] ?? null) : ($data['order_id'] ?? null);
        if (is_string($orderId) && PaymentAttempt::query()->where('provider_order_id', $orderId)->exists()) {
            return app(CulqiOrderGateway::class)->webhook($eventId, $orderId);
        }
        $reference = $data['metadata']['payment_reference'] ?? null;
        $chargeId = ($data['object'] ?? null) === 'charge' ? ($data['id'] ?? null) : ($data['charge_id'] ?? null);
        $attempt = is_string($reference) ? PaymentAttempt::query()->where('reference', $reference)->first() : null;
        if (! $attempt && is_string($chargeId)) {
            $attempt = PaymentAttempt::query()->where('charge_id', $chargeId)->first();
        }
        if (! $attempt) {
            return true;
        }
        try {
            $response = $this->client($attempt)->get('/events/'.$eventId);
        } catch (ConnectionException) {
            return false;
        }
        if (! $response->successful()) {
            return ! $response->serverError() && $response->status() !== 429;
        }
        $event = $response->json();
        if (($event['object'] ?? null) !== 'event' || ($event['id'] ?? null) !== $eventId) {
            return true;
        }
        $canonical = $event['data'] ?? [];
        $canonical = is_string($canonical) ? json_decode($canonical, true) : $canonical;
        if (! is_array($canonical)) {
            return true;
        }
        $canonicalId = ($canonical['object'] ?? null) === 'charge' ? ($canonical['id'] ?? null) : ($canonical['charge_id'] ?? null);
        if (is_string($canonicalId)) {
            $verified = $this->reconcile($attempt, $canonicalId);

            return $verified !== null;
        }

        return true;
    }

    public function refund(PaymentAttempt $attempt): PaymentAttempt
    {
        $attempt = DB::transaction(function () use ($attempt): PaymentAttempt {
            Order::query()->lockForUpdate()->findOrFail($attempt->order_id);
            $locked = PaymentAttempt::query()->lockForUpdate()->findOrFail($attempt->id);
            if (! in_array($locked->status, ['paid', 'test_paid'], true) || ! $locked->charge_id) {
                throw ValidationException::withMessages(['payment' => 'Solo se puede devolver un pago confirmado sin devolución pendiente.']);
            }
            $locked->update(['status' => 'refund_pending', 'message' => 'Devolución solicitada. Verifica su resultado antes de repetirla.']);

            return $locked;
        });
        try {
            $response = $this->client($attempt)->post('/refunds', ['charge_id' => $attempt->charge_id, 'amount' => $attempt->amount, 'reason' => 'solicitud_comprador']);
        } catch (ConnectionException) {
            return $attempt;
        }
        if ($response->clientError() && ($response->json('object') === 'error') && ! in_array($response->status(), [408, 409, 429], true)) {
            $attempt->update(['status' => $attempt->environment === 'test' ? 'test_paid' : 'paid', 'message' => 'Culqi rechazó la devolución. Revísala en CulqiPanel.']);

            return $attempt;
        }

        return $this->reconcile($attempt) ?? $attempt;
    }

    private function client(PaymentAttempt $attempt): PendingRequest
    {
        return Http::baseUrl('https://api.culqi.com/v2')->withToken($attempt->secret_key)
            ->acceptJson()->asJson()->connectTimeout(10)->timeout(30)->withoutRedirecting();
    }

    private function uncertain(PaymentAttempt $attempt): PaymentAttempt
    {
        PaymentAttempt::query()->whereKey($attempt->id)->where('status', 'processing')->update([
            'status' => 'unknown', 'message' => 'Estamos verificando el resultado. No vuelvas a pagar; consulta el estado o contacta a la tienda.',
        ]);

        return $attempt->refresh();
    }
}
