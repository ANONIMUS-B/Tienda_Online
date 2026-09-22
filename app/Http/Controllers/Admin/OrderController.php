<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmitOrderReceiptRequest;
use App\Http\Requests\StoreManualOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\CompanySetting;
use App\Models\Order;
use App\Models\Product;
use App\Models\Team;
use App\Notifications\ReceiptIssuedNotification;
use App\Services\Billing\ElectronicDocumentIssuer;
use App\Services\CulqiGateway;
use Illuminate\Http\RedirectResponse;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('admin/orders/create', [
            'products' => Product::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku', 'price', 'promotional_price', 'stock']),
            'identityLookupEnabled' => (bool) CompanySetting::query()->first()?->identity_lookup_enabled,
            'culqiEnabled' => app(CulqiGateway::class)->ready(CompanySetting::query()->first()),
        ]);
    }

    public function store(StoreManualOrderRequest $request, Team $currentTeam): RedirectResponse
    {
        $order = DB::transaction(function () use ($request): Order {
            $data = $request->validated();
            $items = $request->array('items');
            $totalCents = collect($items)->sum(fn (array $item): int => (int) round((float) $item['unit_price'] * 100) * (int) $item['quantity']);
            $order = Order::query()->create([
                ...$request->safe()->except(['items', 'document_type', 'requires_identification']),
                'customer_name' => ($data['customer_name'] ?? null) ?: 'CLIENTE VARIOS',
                'customer_email' => $data['customer_email'] ?? '',
                'customer_phone' => $data['customer_phone'] ?? '',
                'address' => $data['address'] ?? '',
                'district' => '', 'province' => '', 'department' => '',
                'number' => 'JB-'.now()->format('Ymd').'-'.Str::upper(Str::random(8)),
                'shipping_method' => 'pickup',
                'subtotal' => $totalCents / 100, 'shipping_total' => 0, 'total' => $totalCents / 100,
                'notes' => 'Venta directa / WhatsApp'.(filled($data['notes'] ?? null) ? "\n".$data['notes'] : ''),
            ]);
            foreach ($items as $index => $item) {
                $product = null;
                if (filled($item['product_id'] ?? null)) {
                    $product = Product::query()->where('is_active', true)->whereKey($item['product_id'])->lockForUpdate()->first();
                    if (! $product || $product->stock < $item['quantity']) {
                        throw ValidationException::withMessages(["items.{$index}.quantity" => 'Producto no disponible o stock insuficiente.']);
                    }
                    $product->decrement('stock', $item['quantity']);
                }
                $order->items()->create([
                    'product_id' => $product?->id,
                    'sku' => $product->sku ?? 'MANUAL-'.($index + 1),
                    'name' => $product->name ?? $item['name'],
                    'quantity' => $item['quantity'], 'unit_price' => $item['unit_price'],
                    'total' => ((int) round((float) $item['unit_price'] * 100) * (int) $item['quantity']) / 100,
                ]);
            }

            return $order;
        });

        return to_route('admin.orders.show', [$currentTeam, $order])->with('success', 'Venta registrada. Revisa los datos y emite el comprobante desde este pedido.');
    }

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
        if ($order->payment_method === 'gateway' && isset($attributes['payment_status']) && $attributes['payment_status'] !== $order->payment_status) {
            throw ValidationException::withMessages(['payment_status' => 'El estado de Culqi solo cambia al verificar el pago con la pasarela.']);
        }
        if ($order->payment_method === 'gateway') {
            unset($attributes['payment_status']);
        }
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
        abort_if($order->payment_method === 'gateway', 422, 'Verifica este pago desde Pagos Culqi.');
        $order->update([
            'payment_status' => 'paid',
            'status' => $order->status === 'pending' ? 'processing' : $order->status,
        ]);

        return back()->with('success', 'Pago de Yape aprobado correctamente.');
    }

    public function rejectPayment(Team $currentTeam, Order $order): RedirectResponse
    {
        abort_if($order->payment_method === 'gateway', 422, 'Verifica este pago desde Pagos Culqi.');
        $order->update([
            'payment_status' => 'rejected',
        ]);

        return back()->with('success', 'Pago rechazado.');
    }
}
