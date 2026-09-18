<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmitOrderReceiptRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Team;
use App\Notifications\ReceiptIssuedNotification;
use App\Services\Billing\ElectronicDocumentIssuer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/orders/index', ['orders' => Order::query()->withCount('items')->with(['electronicDocuments' => fn ($query) => $query->latest()])->latest()->paginate(20)]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Team $currentTeam, Order $order): Response
    {
        return Inertia::render('admin/orders/show', [
            'order' => $order->load(['items', 'electronicDocuments' => fn ($query) => $query->latest()]),
            'customerOrderUrl' => URL::signedRoute('orders.show', ['number' => $order->number]),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Team $currentTeam, Order $order): RedirectResponse
    {
        $attributes = $request->validated();
        if (($attributes['receipt_status'] ?? null) === 'issued' && ! $order->receipt_issued_at) {
            $attributes['receipt_issued_at'] = now();
        }
        $order->update($attributes);

        return back()->with('success', 'Pedido actualizado.');
    }

    public function issue(EmitOrderReceiptRequest $request, Team $currentTeam, Order $order, ElectronicDocumentIssuer $issuer): RedirectResponse
    {
        $order->update(['receipt_type' => $request->string('receipt_type')->toString()]);
        $document = $issuer->issueForOrder($order->fresh(), $request->string('receipt_type')->toString());

        return back()->with('success', "Comprobante {$document->number} emitido correctamente.");
    }

    public function share(EmitOrderReceiptRequest $request, Team $currentTeam, Order $order): RedirectResponse
    {
        $document = $order->electronicDocuments()->whereIn('type', ['boleta', 'factura', 'sales_note'])->latest()->firstOrFail();
        $customerUrl = URL::signedRoute('orders.show', ['number' => $order->number]);
        $channels = array_values(array_filter([
            $request->boolean('send_email') ? 'mail' : null,
            $request->boolean('send_system') && $order->user_id ? 'database' : null,
        ]));

        if ($channels !== []) {
            ($order->user ?? new class($order->customer_email) extends AnonymousNotifiable
            {
                public function __construct(string $email)
                {
                    $this->route('mail', $email);
                }
            })->notify(new ReceiptIssuedNotification($document, $customerUrl, $channels));
        }

        $message = rawurlencode("Hola {$order->customer_name}, tu comprobante {$document->number} del pedido {$order->number} está disponible: {$customerUrl}");
        $redirect = back()->with('success', "Comprobante {$document->number} compartido sin volver a emitirlo ante SUNAT.");

        return $request->boolean('open_whatsapp')
            ? $redirect->with('whatsapp_url', 'https://wa.me/'.preg_replace('/\D/', '', $order->customer_phone).'?text='.$message)
            : $redirect;
    }

    public function approvePayment(Team $currentTeam, Order $order): RedirectResponse
    {
        $order->update([
            'payment_status' => 'paid',
            'status' => $order->status === 'pending' ? 'processing' : $order->status,
        ]);

        return back()->with('success', 'Pago de Yape aprobado correctamente.');
    }

    public function rejectPayment(Team $currentTeam, Order $order): RedirectResponse
    {
        $order->update([
            'payment_status' => 'rejected',
        ]);

        return back()->with('success', 'Pago rechazado.');
    }
}
