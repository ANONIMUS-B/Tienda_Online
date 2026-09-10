<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;

class ShoppingCart
{
    /** @return array<int, int> */
    public function quantities(): array
    {
        return session()->get('cart', []);
    }

    public function put(Product $product, int $quantity): void
    {
        $cart = $this->quantities();
        $cart[$product->id] = min($product->stock, ($cart[$product->id] ?? 0) + $quantity);
        session()->put('cart', $cart);
    }

    public function update(Product $product, int $quantity): void
    {
        $cart = $this->quantities();
        $cart[$product->id] = min($product->stock, $quantity);
        session()->put('cart', $cart);
    }

    public function remove(Product $product): void
    {
        $cart = $this->quantities();
        unset($cart[$product->id]);
        session()->put('cart', $cart);
    }

    public function clear(): void
    {
        session()->forget('cart');
    }

    /** @return Collection<int, array{product: Product, quantity: int, unit_price: float, total: float}> */
    public function items(bool $lock = false): Collection
    {
        $quantities = $this->quantities();
        $query = Product::query()->active()->with('images')->whereIn('id', array_keys($quantities));
        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->get()->map(function (Product $product) use ($quantities): array {
            $quantity = (int) ($quantities[$product->id] ?? 0);
            $unitPrice = (float) ($product->promotional_price ?? $product->price);

            return ['product' => $product, 'quantity' => $quantity, 'unit_price' => $unitPrice, 'total' => round($unitPrice * $quantity, 2)];
        })->values();
    }
}
