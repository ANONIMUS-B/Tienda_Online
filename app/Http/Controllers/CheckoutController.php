<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCheckoutRequest;
use App\Mail\OrderConfirmation;
use App\Models\CompanySetting;
use App\Models\Order;
use App\Services\ImageUploader;
use App\Services\ShoppingCart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(private ImageUploader $images) {}

    public function create(ShoppingCart $cart): Response|RedirectResponse
    {
        $items = $cart->items();
        if ($items->isEmpty()) {
            return redirect()->route('cart.index');
        }
        $settings = CompanySetting::query()->firstOrNew([], ['payment_yape_enabled' => true, 'payment_transfer_enabled' => true, 'payment_cash_enabled' => true, 'payment_gateway_enabled' => false, 'whatsapp_checkout_enabled' => true]);
        $methods = collect([
            ['value' => 'yape', 'label' => 'Yape / Plin', 'enabled' => $settings->payment_yape_enabled],
            ['value' => 'bank_transfer', 'label' => 'Transferencia bancaria', 'enabled' => $settings->payment_transfer_enabled],
            ['value' => 'cash_on_delivery', 'label' => 'Pago contra entrega', 'enabled' => $settings->payment_cash_enabled],
            ['value' => 'gateway', 'label' => 'Tarjeta en línea', 'enabled' => $settings->payment_gateway_enabled],
        ])->where('enabled', true)->values();
        $whatsappUrl = null;
        if ($settings->whatsapp_checkout_enabled && filled($settings->whatsapp_number)) {
            $details = $items->map(fn (array $item): string => "- {$item['product']->name} × {$item['quantity']}: S/ ".number_format($item['total'], 2))->implode("\n");
            $message = "Hola, deseo comprar los siguientes productos:\n\n{$details}\n\nSubtotal: S/ ".number_format((float) $items->sum('total'), 2);
            $whatsappUrl = 'https://wa.me/'.preg_replace('/\D/', '', (string) $settings->whatsapp_number).'?text='.rawurlencode($message);
        }

        return Inertia::render('checkout/create', [
            'items' => $items,
            'subtotal' => round($items->sum('total'), 2),
            'paymentMethods' => $methods,
            'whatsappUrl' => $whatsappUrl,
            'companySettings' => [
                'yape_number' => $settings->yape_number ?: '925523419',
                'yape_qr_path' => $settings->yape_qr_path,
                'bank_name' => $settings->bank_name,
                'bank_account' => $settings->bank_account,
            ],
        ]);
    }

    public function store(StoreCheckoutRequest $request, ShoppingCart $cart): RedirectResponse
    {
        $settings = CompanySetting::query()->firstOrNew([], ['payment_yape_enabled' => true, 'payment_transfer_enabled' => true, 'payment_cash_enabled' => true, 'payment_gateway_enabled' => false]);
        $enabledMethods = array_filter(['yape' => $settings->payment_yape_enabled, 'bank_transfer' => $settings->payment_transfer_enabled, 'cash_on_delivery' => $settings->payment_cash_enabled, 'gateway' => $settings->payment_gateway_enabled]);
        if (! array_key_exists($request->string('payment_method')->toString(), $enabledMethods)) {
            throw ValidationException::withMessages(['payment_method' => 'Este método de pago no está habilitado.']);
        }

        $receiptPath = null;
        if ($request->hasFile('payment_receipt')) {
            $receiptPath = $this->images->replace($request->file('payment_receipt'), 'receipts');
        }

        $order = DB::transaction(function () use ($request, $cart, $receiptPath): Order {
            $items = $cart->items(lock: true);
            if ($items->isEmpty()) {
                throw ValidationException::withMessages(['cart' => 'El carrito está vacío.']);
            }
            foreach ($items as $item) {
                if ($item['quantity'] > $item['product']->stock) {
                    throw ValidationException::withMessages(['cart' => "Stock insuficiente para {$item['product']->name}."]);
                }
            }
            $subtotal = round($items->sum('total'), 2);
            $shipping = $request->string('shipping_method')->toString() === 'delivery' ? 15.0 : 0.0;

            $data = $request->safe()->except(['payment_receipt']);
            if ($receiptPath) {
                $data['payment_receipt_path'] = $receiptPath;
            }

            $order = Order::query()->create([
                ...$data,
                'user_id' => $request->user()?->id,
                'number' => 'JB-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
                'subtotal' => $subtotal,
                'shipping_total' => $shipping,
                'total' => $subtotal + $shipping,
            ]);

            foreach ($items as $item) {
                $product = $item['product'];
                $order->items()->create(['product_id' => $product->id, 'sku' => $product->sku, 'name' => $product->name, 'quantity' => $item['quantity'], 'unit_price' => $item['unit_price'], 'total' => $item['total']]);
                $product->decrement('stock', $item['quantity']);
            }

            return $order;
        });
        $cart->clear();
        Mail::to($order->customer_email)->send(new OrderConfirmation($order->load('items')));

        return redirect()->to(URL::temporarySignedRoute('orders.show', now()->addDays(7), ['number' => $order->number]));
    }
}
