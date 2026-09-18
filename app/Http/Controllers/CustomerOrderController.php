<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use App\Models\Order;
use App\Services\ImageUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
        $order = Order::query()->with('items')->where('number', $number)->firstOrFail();

        if (! $request->hasValidSignature()) {
            if (! auth()->check() || $order->user_id !== auth()->id()) {
                abort(403);
            }
        }

        $settings = CompanySetting::query()->firstOrNew([]);

        return Inertia::render('orders/show', [
            'order' => $order,
            'companySettings' => [
                'yape_number' => $settings->yape_number ?: '925523419',
                'yape_qr_path' => $settings->yape_qr_path,
                'bank_name' => $settings->bank_name,
                'bank_account' => $settings->bank_account,
                'whatsapp_number' => $settings->whatsapp_number ?: ($settings->phone ?: '925523419'),
            ],
        ]);
    }

    public function submitPaymentProof(Request $request, string $number): RedirectResponse
    {
        $order = Order::query()->where('number', $number)->firstOrFail();

        if (! $request->hasValidSignature()) {
            if (! auth()->check() || $order->user_id !== auth()->id()) {
                abort(403);
            }
        }

        $validated = $request->validate([
            'payment_reference' => ['nullable', 'string', 'max:50'],
            'payment_receipt' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
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
