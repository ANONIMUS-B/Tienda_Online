<?php

use App\Models\CompanySetting;
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

test('authenticated customers create an order and receive a private confirmation link', function () {
    $product = Product::factory()->create(['name' => 'Laptop empresarial', 'stock' => 5, 'price' => 100, 'promotional_price' => 75]);
    $user = User::factory()->create();
    $this->actingAs($user)->withSession(['cart' => [$product->id => 2]]);

    $response = $this->post(route('checkout.store'), checkoutPayload());

    $order = Order::query()->firstOrFail();
    $response->assertRedirectContains('/pedido/');
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'user_id' => $user->id, 'subtotal' => 150, 'shipping_total' => 15, 'total' => 165]);
    $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'product_id' => $product->id, 'quantity' => 2, 'unit_price' => 75, 'total' => 150]);
    expect($product->fresh()->stock)->toBe(3);
    expect(session('cart'))->toBeNull();
    expect($response->headers->get('Location'))->toContain($order->number)->toContain('signature=');
});

test('checkout requires customers to log in before creating an order', function () {
    $product = Product::factory()->create(['stock' => 1]);
    $this->withSession(['cart' => [$product->id => 1]])->get(route('checkout.create'))->assertRedirect(route('login'));
    $this->withSession(['cart' => [$product->id => 1]])->post(route('checkout.store'), checkoutPayload())->assertRedirect(route('login'));
    $this->assertDatabaseCount('orders', 0);
});

test('checkout requires customer delivery and payment information', function () {
    $product = Product::factory()->create(['stock' => 1]);
    $user = User::factory()->create();

    $this->actingAs($user)->withSession(['cart' => [$product->id => 1]])->post(route('checkout.store'), [])->assertSessionHasErrors(['customer_name', 'customer_email', 'customer_phone', 'address', 'district', 'province', 'department', 'shipping_method', 'payment_method']);

    $this->assertDatabaseCount('orders', 0);
});

test('checkout works when optional WhatsApp contact is not configured', function () {
    $product = Product::factory()->create(['stock' => 1]);
    $user = User::factory()->create();

    $this->actingAs($user)->withSession(['cart' => [$product->id => 1]])
        ->post(route('checkout.store'), checkoutPayload())
        ->assertRedirectContains('/pedido/');

    $this->assertDatabaseCount('orders', 1);
});

test('order confirmation page requires a valid signed url', function () {
    $order = Order::factory()->create();

    $this->get(route('orders.show', $order->number))->assertForbidden();
});

test('checkout only exposes enabled payment methods and whatsapp contact', function () {
    $product = Product::factory()->create(['stock' => 1]);
    CompanySetting::query()->create(['company_name' => 'JBTECHLINE', 'whatsapp_number' => '51999888777', 'payment_yape_enabled' => true, 'payment_transfer_enabled' => false, 'payment_cash_enabled' => false, 'payment_gateway_enabled' => false, 'whatsapp_checkout_enabled' => true]);

    $this->actingAs(User::factory()->create())->withSession(['cart' => [$product->id => 1]])->get(route('checkout.create'))->assertInertia(fn ($page) => $page->component('checkout/create')->has('paymentMethods', 1)->where('paymentMethods.0.value', 'yape')->where('whatsappUrl', fn ($url) => str_starts_with($url, 'https://wa.me/51999888777')));
});

/** @return array<string, string> */
function checkoutPayload(): array
{
    return ['customer_name' => 'María Pérez', 'customer_email' => 'maria@example.com', 'customer_phone' => '999888777', 'document_number' => '12345678', 'address' => 'Av. Tecnología 123', 'district' => 'Miraflores', 'province' => 'Lima', 'department' => 'Lima', 'shipping_method' => 'delivery', 'payment_method' => 'yape', 'notes' => 'Tocar el timbre'];
}
