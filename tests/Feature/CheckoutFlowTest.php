<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;

test('customers can add update and remove available products from the cart', function () {
    $product = Product::factory()->create(['stock' => 5, 'price' => 100, 'promotional_price' => 80]);

    $this->post(route('cart.store'), ['product_id' => $product->id, 'quantity' => 2])->assertRedirect();
    $this->get(route('cart.index'))->assertOk()->assertInertia(fn ($page) => $page->component('cart/index')->where('cart.count', 2)->where('cart.subtotal', 160));
    $this->patch(route('cart.update', $product), ['quantity' => 3])->assertRedirect()->assertSessionHas('cart', [$product->id => 3]);
    $this->delete(route('cart.destroy', $product))->assertRedirect()->assertSessionHas('cart', []);
});

test('cart rejects quantities greater than current stock', function () {
    $product = Product::factory()->create(['stock' => 1]);

    $this->post(route('cart.store'), ['product_id' => $product->id, 'quantity' => 2])
        ->assertSessionHasErrors('quantity');

    expect(session('cart'))->toBeNull();
});

test('authenticated customers create a request and are redirected to WhatsApp', function () {
    config()->set('services.whatsapp.number', '51999888777');
    $product = Product::factory()->create(['name' => 'Laptop empresarial', 'stock' => 5, 'price' => 100, 'promotional_price' => 75]);
    $user = User::factory()->create();
    $this->actingAs($user)->withSession(['cart' => [$product->id => 2]]);

    $response = $this->post(route('checkout.store'), checkoutPayload());

    $order = Order::query()->firstOrFail();
    $response->assertRedirectContains('https://wa.me/51999888777?text=');
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'user_id' => $user->id, 'subtotal' => 150, 'shipping_total' => 15, 'total' => 165]);
    $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'product_id' => $product->id, 'quantity' => 2, 'unit_price' => 75, 'total' => 150]);
    expect($product->fresh()->stock)->toBe(5);
    expect(session('cart'))->toBeNull();
    expect(urldecode((string) parse_url($response->headers->get('Location'), PHP_URL_QUERY)))->toContain($order->number)->toContain('Laptop');
});

test('checkout requires an authenticated customer', function () {
    $this->get(route('checkout.create'))->assertRedirect(route('login'));
});

test('checkout requires customer delivery and payment information', function () {
    $product = Product::factory()->create(['stock' => 1]);
    $user = User::factory()->create();

    $this->actingAs($user)->withSession(['cart' => [$product->id => 1]])->post(route('checkout.store'), [])->assertSessionHasErrors(['customer_name', 'customer_email', 'customer_phone', 'address', 'district', 'province', 'department', 'shipping_method', 'payment_method']);

    $this->assertDatabaseCount('orders', 0);
});

test('checkout does not create a request when WhatsApp is not configured', function () {
    config()->set('services.whatsapp.number', '');
    $product = Product::factory()->create(['stock' => 1]);
    $user = User::factory()->create();

    $this->actingAs($user)->withSession(['cart' => [$product->id => 1]])
        ->post(route('checkout.store'), checkoutPayload())
        ->assertSessionHasErrors('cart');

    $this->assertDatabaseCount('orders', 0);
});

test('order confirmation page requires a valid signed url', function () {
    $order = Order::factory()->create();

    $this->get(route('orders.show', $order->number))->assertForbidden();
});

/** @return array<string, string> */
function checkoutPayload(): array
{
    return ['customer_name' => 'María Pérez', 'customer_email' => 'maria@example.com', 'customer_phone' => '999888777', 'document_number' => '12345678', 'address' => 'Av. Tecnología 123', 'district' => 'Miraflores', 'province' => 'Lima', 'department' => 'Lima', 'shipping_method' => 'delivery', 'payment_method' => 'yape', 'notes' => 'Tocar el timbre'];
}
