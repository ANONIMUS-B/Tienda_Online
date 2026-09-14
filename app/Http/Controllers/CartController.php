<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Models\CompanySetting;
use App\Models\Product;
use App\Services\ShoppingCart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(ShoppingCart $cart): Response
    {
        $items = $cart->items();

        return Inertia::render('cart/index', ['cart' => [
            'items' => $items->map(function (array $item): array {
                $product = $item['product'];
                $image = $product->images->firstWhere('is_primary', true) ?? $product->images->first();

                return [
                    'id' => $product->id,
                    'slug' => $product->slug,
                    'sku' => $product->sku,
                    'name' => $product->name,
                    'short_description' => $product->short_description,
                    'brand' => $product->brand?->name,
                    'category' => $product->category?->name,
                    'image' => $image?->path,
                    'stock' => $product->stock,
                    'quantity' => $item['quantity'],
                    'price' => $item['unit_price'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['total'],
                ];
            })->values()->all(),
            'count' => $items->sum('quantity'),
            'subtotal' => round($items->sum('total'), 2),
        ]]);
    }

    public function store(StoreCartItemRequest $request, ShoppingCart $cart): RedirectResponse
    {
        $product = Product::query()->active()->findOrFail($request->integer('product_id'));
        if ($product->stock < $request->integer('quantity')) {
            return back()->withErrors(['quantity' => 'No hay stock suficiente para esa cantidad.']);
        }
        $cart->put($product, $request->integer('quantity'));

        return back()->with('success', 'Producto agregado al carrito.');
    }

    public function update(UpdateCartItemRequest $request, Product $product, ShoppingCart $cart): RedirectResponse
    {
        if ($product->stock < $request->integer('quantity')) {
            return back()->withErrors(['quantity' => 'No hay stock suficiente para esa cantidad.']);
        }
        $cart->update($product, $request->integer('quantity'));

        return back();
    }

    public function destroy(Product $product, ShoppingCart $cart): RedirectResponse
    {
        $cart->remove($product);

        return back();
    }

    public function whatsapp(Request $request, ShoppingCart $cart): RedirectResponse
    {
        $items = $cart->items();
        abort_if($items->isEmpty(), 422, 'El carrito está vacío.');

        $settings = CompanySetting::query()->first();
        $number = preg_replace('/\D/', '', (string) ($settings?->whatsapp_number ?: config('services.whatsapp.number')));
        abort_if(blank($number), 422, 'El número de WhatsApp no está configurado.');

        $details = $items->map(fn (array $item): string => "Producto: {$item['product']->name}\nCantidad: {$item['quantity']}\nPrecio: S/ ".number_format($item['unit_price'], 2))->implode("\n\n");
        $user = $request->user();
        $message = "Hola, estoy interesado en realizar el siguiente pedido:\n\n{$details}\n\nDatos del cliente:\nNombre: {$user->name}\nCorreo: {$user->email}\n\nQuisiera recibir información para continuar con el pedido.";

        return redirect()->away('https://wa.me/'.$number.'?text='.rawurlencode($message));
    }
}
