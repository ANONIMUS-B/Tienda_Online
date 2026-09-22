<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use App\Models\Order;
use App\Services\Billing\ReceiptPdf;
use App\Services\CulqiGateway;
use App\Services\CulqiOrderGateway;
use App\Services\ImageUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerOrderController extends Controller
{
    public function __construct(private ImageUploader $images) {}

    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->with('items')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        $settings = CompanySetting::query()->firstOrNew([]);

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'companySettings' => [
                'yape_number' => $settings->yape_number ?: '925523419',
                'yape_qr_path' => $settings->yape_qr_path,
                'bank_name' => $settings->bank_name,
                'bank_account' => $settings->bank_account,
                'whatsapp_number' => $settings->whatsapp_number ?: ($settings->phone ?: '925523419'),
            ],
        ]);
    }

    public function show(Request $request, string $number): Response
    {
        $order = Order::query()->with(['items', 'electronicDocuments' => fn ($query) => $query->latest()])->where('number', $number)->firstOrFail();

        if (! $request->hasValidSignature()) {
            if (! auth()->check() || $order->user_id !== auth()->id()) {
                abort(403);
            }
        }

        $settings = CompanySetting::query()->firstOrNew([]);
        $document = $order->electronicDocuments->first();

        return Inertia::render('orders/show', [
            'order' => $order,
            'receiptUrls' => $document ? [
                'a4' => URL::temporarySignedRoute('orders.receipt', now()->addDay(), ['number' => $order->number, 'format' => 'a4']),
                'ticket' => URL::temporarySignedRoute('orders.receipt', now()->addDay(), ['number' => $order->number, 'format' => 'ticket']),
            ] : null,
            'culqi' => $order->payment_method === 'gateway' ? [
                ...app(CulqiGateway::class)->configuration($order),
                'chargeUrl' => URL::temporarySignedRoute('orders.culqi.store', now()->addHour(), ['number' => $order->number]),
                'statusUrl' => URL::temporarySignedRoute('orders.culqi.show', now()->addHour(), ['number' => $order->number]),
                'cancelUrl' => URL::temporarySignedRoute('orders.culqi.cancel', now()->addHour(), ['number' => $order->number]),
            ] : null,
            'pagoEfectivo' => $order->payment_method === 'pagoefectivo' ? [
                ...app(CulqiOrderGateway::class)->configuration($order),
                'createUrl' => URL::temporarySignedRoute('orders.pagoefectivo.store', now()->addHour(), ['number' => $order->number]),
                'statusUrl' => URL::temporarySignedRoute('orders.pagoefectivo.show', now()->addHour(), ['number' => $order->number]),
            ] : null,
            'companySettings' => [
                'yape_number' => $settings->yape_number ?: '925523419',
                'yape_qr_path' => $settings->yape_qr_path,
                'bank_name' => $settings->bank_name,
                'bank_account' => $settings->bank_account,
                'whatsapp_number' => $settings->whatsapp_number ?: ($settings->phone ?: '925523419'),
            ],
        ]);
    }

    public function receipt(Request $request, string $number, string $format, ReceiptPdf $receiptPdf): StreamedResponse
    {
        $order = Order::query()->where('number', $number)->firstOrFail();
        if (! $request->hasValidSignature()) {
            abort_unless($request->user() && $order->user_id === $request->user()->id, 403);
        }

        abort_unless(in_array($format, ['a4', 'ticket'], true), 404);
        $document = $order->electronicDocuments()->latest()->firstOrFail();

        return response()->streamDownload(function () use ($document, $receiptPdf, $format): void {
            echo $receiptPdf->render($document, $format);
        }, $document->number.'-'.$format.'.pdf', ['Content-Type' => 'application/pdf']);
    }

    public function submitPaymentProof(Request $request, string $number): RedirectResponse
    {
        $order = Order::query()->where('number', $number)->firstOrFail();

        if (! $request->hasValidSignature()) {
            if (! auth()->check() || $order->user_id !== auth()->id()) {
                abort(403);
            }
        }

        abort_if(in_array($order->payment_method, ['gateway', 'pagoefectivo', 'izipay'], true) || $order->payment_status === 'paid', 422, 'El pago se verifica automáticamente con la pasarela seleccionada.');
        $validated = $request->validate([
            'payment_reference' => ['nullable', 'string', 'max:50'],
            'payment_receipt' => [$order->payment_method === 'bank_transfer' ? 'nullable' : 'prohibited', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
        ]);

        if (blank($validated['payment_reference'] ?? null) && ! $request->hasFile('payment_receipt')) {
            return back()->withErrors(['payment_reference' => 'Ingresa el N° de operación o adjunta el comprobante.']);
        }

        if ($request->hasFile('payment_receipt')) {
            $path = $this->images->replace($request->file('payment_receipt'), 'receipts', $order->payment_receipt_path);
            $order->payment_receipt_path = $path;
        }

        if (filled($validated['payment_reference'] ?? null)) {
            $order->payment_reference = $validated['payment_reference'];
        }

        $order->save();

        return back()->with('success', 'Información de pago registrada correctamente. Verificaremos tu pago a la brevedad.');
    }
}
