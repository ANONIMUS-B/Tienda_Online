<?php

use App\Enums\SystemRole;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

function manualOrderPayload(array $overrides = []): array
{
    return array_replace([
        'receipt_type' => 'boleta', 'document_type' => 'none', 'document_number' => null,
        'customer_name' => null, 'payment_method' => 'yape', 'payment_status' => 'pending',
        'requires_identification' => false,
        'items' => [['name' => 'Instalación', 'quantity' => 1, 'unit_price' => '700.00']],
    ], $overrides);
}

test('administrators register an anonymous whatsapp sale at the identification limit', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('admin.orders.store', $user->currentTeam), manualOrderPayload())
        ->assertSessionHasNoErrors()->assertRedirect();

    $order = Order::query()->sole();
    expect($order->customer_name)->toBe('CLIENTE VARIOS');
    expect($order->user_id)->toBeNull();
    expect($order->total)->toBe('700.00');
    expect($order->payment_status)->toBe('pending');
    expect($order->items()->sole()->total)->toBe('700.00');
    $this->assertDatabaseCount('electronic_documents', 0);
});

test('manual sales reject missing required identification and invalid documents', function (array $overrides, string $field) {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('admin.orders.store', $user->currentTeam), manualOrderPayload($overrides))
        ->assertSessionHasErrors($field);

    $this->assertDatabaseCount('orders', 0);
})->with([
    'above 700' => [['items' => [['name' => 'Servicio', 'quantity' => 1, 'unit_price' => '700.01']]], 'document_number'],
    'special case' => [['requires_identification' => true], 'document_number'],
    'invoice without RUC' => [['receipt_type' => 'factura', 'address' => 'Lima'], 'document_type'],
    'short DNI' => [['document_type' => 'dni', 'document_number' => '123', 'customer_name' => 'Cliente'], 'document_number'],
    'anonymous with document' => [['document_number' => '12345678'], 'document_number'],
    'missing lines' => [['items' => []], 'items'],
    'negative price' => [['items' => [['name' => 'Servicio', 'quantity' => 1, 'unit_price' => '-1']]], 'items.0.unit_price'],
    'fractional quantity' => [['items' => [['name' => 'Servicio', 'quantity' => 1.5, 'unit_price' => '10']]], 'items.0.quantity'],
]);

test('manual catalog sales calculate totals and decrement stock', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock' => 3, 'is_active' => true]);

    $this->actingAs($user)->post(route('admin.orders.store', $user->currentTeam), manualOrderPayload([
        'document_type' => 'dni', 'document_number' => '12345678', 'customer_name' => 'Cliente WhatsApp',
        'payment_status' => 'paid', 'total' => 1,
        'items' => [['product_id' => $product->id, 'name' => 'Nombre manipulado', 'quantity' => 2, 'unit_price' => '450.50']],
    ]))->assertSessionHasNoErrors()->assertRedirect();

    expect($product->fresh()->stock)->toBe(1);
    $order = Order::query()->sole();
    expect($order->total)->toBe('901.00');
    expect($order->items()->sole()->name)->toBe($product->name);
});

test('insufficient stock rolls back the entire manual sale including repeated products', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock' => 3, 'is_active' => true]);
    $item = ['product_id' => $product->id, 'name' => $product->name, 'quantity' => 2, 'unit_price' => '10'];

    $this->actingAs($user)->post(route('admin.orders.store', $user->currentTeam), manualOrderPayload(['items' => [$item, $item]]))
        ->assertSessionHasErrors('items.1.quantity');

    expect($product->fresh()->stock)->toBe(3);
    $this->assertDatabaseCount('orders', 0);
    $this->assertDatabaseCount('order_items', 0);
});

test('manual sale pages render for administrators and are forbidden to customers', function () {
    $admin = User::factory()->create();
    $this->actingAs($admin)->get(route('admin.orders.create', $admin->currentTeam))
        ->assertInertia(fn ($page) => $page->component('admin/orders/create')->where('identityLookupEnabled', false));

    $customer = User::factory()->create(['role' => SystemRole::User]);
    $this->actingAs($customer)->post(route('admin.orders.store', $customer->currentTeam), manualOrderPayload())->assertForbidden();
    $this->assertDatabaseCount('orders', 0);
});

test('existing orders cannot emit an anonymous boleta above 700', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create(['payment_status' => 'paid', 'total' => '700.01']);

    $this->actingAs($user)->post(route('admin.orders.issue', [$user->currentTeam, $order]), ['receipt_type' => 'boleta'])
        ->assertSessionHasErrors('receipt_type');

    $this->assertDatabaseCount('electronic_documents', 0);
});

test('a paid manual sale emits one boleta without customer registration', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('admin.orders.store', $user->currentTeam), manualOrderPayload(['payment_status' => 'paid']))->assertSessionHasNoErrors();
    $order = Order::query()->sole();

    $this->post(route('admin.orders.issue', [$user->currentTeam, $order]), ['receipt_type' => 'boleta'])->assertSessionHasNoErrors();
    $this->post(route('admin.orders.issue', [$user->currentTeam, $order]), ['receipt_type' => 'boleta'])->assertSessionHasNoErrors();

    $this->assertDatabaseCount('electronic_documents', 1);
    $document = $order->electronicDocuments()->sole();
    expect($document->customer_name)->toBe('CLIENTE VARIOS');
    expect($document->total)->toBe('700.00');
    expect($document->payload_json)->not->toHaveKey('cliente_numero_de_documento');
});

test('manual invoices store RUC legal name and address', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('admin.orders.store', $user->currentTeam), manualOrderPayload([
        'receipt_type' => 'factura', 'document_type' => 'ruc', 'document_number' => '20601030013',
        'customer_name' => 'EMPRESA SAC', 'address' => 'Av. Lima 123', 'payment_status' => 'paid',
    ]))->assertSessionHasNoErrors();

    $order = Order::query()->sole();
    $this->post(route('admin.orders.issue', [$user->currentTeam, $order]), ['receipt_type' => 'factura'])->assertSessionHasNoErrors();
    expect($order->electronicDocuments()->sole()->payload_json)->toMatchArray([
        'cliente_tipo_de_documento' => '6', 'cliente_numero_de_documento' => '20601030013', 'cliente_denominacion' => 'EMPRESA SAC',
    ]);
});

test('manual sales cannot be registered through another administrators team', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($user)->post(route('admin.orders.store', $other->currentTeam), manualOrderPayload())->assertForbidden();

    $this->assertDatabaseCount('orders', 0);
});

test('sharing fails clearly when a manual customer has no contact information', function (string $channel) {
    $user = User::factory()->create();
    $order = Order::factory()->create(['payment_status' => 'paid', 'customer_email' => '', 'customer_phone' => '']);

    $this->actingAs($user)->post(route('admin.orders.share', [$user->currentTeam, $order]), ['receipt_type' => 'boleta', $channel => true])
        ->assertSessionHasErrors('receipt_type');
})->with(['send_email', 'open_whatsapp']);
