<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Models\Product;
use App\Services\ShoppingCart;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(ShoppingCart $cart): Response
    {
        $items = $cart->items();

        return Inertia::render('cart/index', ['cart' => ['items' => $items, 'count' => $items->sum('quantity'), 'subtotal' => round($items->sum('total'), 2)]]);
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
}
