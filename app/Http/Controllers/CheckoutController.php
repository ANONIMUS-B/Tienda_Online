<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCheckoutRequest;
use App\Models\Order;
use App\Services\ShoppingCart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function create(ShoppingCart $cart): Response|RedirectResponse
    {
        $items = $cart->items();
        if ($items->isEmpty()) {
            return redirect()->route('cart.index');
        }

        return Inertia::render('checkout/create', ['items' => $items, 'subtotal' => round($items->sum('total'), 2)]);
    }

    public function store(StoreCheckoutRequest $request, ShoppingCart $cart): RedirectResponse
    {
        $whatsappNumber = (string) config('services.whatsapp.number');
        if ($whatsappNumber === '') {
            throw ValidationException::withMessages([
                'cart' => 'La atención por WhatsApp aún no está configurada.',
            ]);
        }

        $order = DB::transaction(function () use ($request, $cart): Order {
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
            $order = Order::query()->create([...$request->validated(), 'user_id' => $request->user()?->id, 'number' => 'JB-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)), 'subtotal' => $subtotal, 'shipping_total' => $shipping, 'total' => $subtotal + $shipping]);
            foreach ($items as $item) {
                $product = $item['product'];
                $order->items()->create(['product_id' => $product->id, 'sku' => $product->sku, 'name' => $product->name, 'quantity' => $item['quantity'], 'unit_price' => $item['unit_price'], 'total' => $item['total']]);
            }

            return $order;
        });
        $cart->clear();

        return redirect()->away($this->whatsappUrl($order->load('items'), $whatsappNumber));
    }

    private function whatsappUrl(Order $order, string $whatsappNumber): string
    {
        $items = $order->items
            ->map(fn ($item): string => "- {$item->name} x{$item->quantity}: S/ {$item->total}")
            ->implode("\n");

        $message = "Hola, deseo registrar la solicitud {$order->number}.\n\n"
            ."Cliente: {$order->customer_name}\n"
            ."Teléfono: {$order->customer_phone}\n\n"
            ."Productos:\n{$items}\n\n"
            ."Total estimado: S/ {$order->total}";

        return 'https://wa.me/'.preg_replace('/\D/', '', $whatsappNumber).'?text='.rawurlencode($message);
    }
}
