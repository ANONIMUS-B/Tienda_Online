<?php

use App\Enums\SystemRole;
use App\Models\MediaFile;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

test('customer can create an order with yape payment reference and receipt image', function () {
    $product = Product::factory()->create(['stock' => 5, 'price' => 100]);
    $user = User::factory()->create();

    $receipt = UploadedFile::fake()->image('yape_receipt.jpg');

    $payload = [
        'customer_name' => 'Juan Yapeador',
        'customer_email' => 'yape@example.com',
        'customer_phone' => '925523419',
        'address' => 'Av. Yape 123',
        'district' => 'Lima',
        'province' => 'Lima',
        'department' => 'Lima',
        'shipping_method' => 'delivery',
        'payment_method' => 'yape',
        'payment_reference' => '839201',
        'payment_receipt' => $receipt,
    ];

    $response = $this->actingAs($user)
        ->withSession(['cart' => [$product->id => 1]])
        ->post(route('checkout.store'), $payload);

    $order = Order::query()->firstOrFail();
    $response->assertRedirectContains('/pedido/');

    expect($order->payment_reference)->toBe('839201');
    expect($order->payment_receipt_path)->not->toBeNull();

    $mediaId = Str::after($order->payment_receipt_path, '/media/');
    expect(MediaFile::query()->whereKey($mediaId)->exists())->toBeTrue();
});

test('customer can submit payment proof after order creation via signed link', function () {
    $order = Order::factory()->create([
        'payment_method' => 'yape',
        'payment_status' => 'pending',
        'payment_reference' => null,
        'payment_receipt_path' => null,
    ]);

    $signedUrl = URL::signedRoute('orders.submit-payment', ['number' => $order->number]);

    $receipt = UploadedFile::fake()->image('proof.png');

    $response = $this->post($signedUrl, [
        'payment_reference' => '998877',
        'payment_receipt' => $receipt,
    ]);

    $response->assertRedirect();
    $order->refresh();

    expect($order->payment_reference)->toBe('998877');
    expect($order->payment_receipt_path)->not->toBeNull();

    $mediaId = Str::after($order->payment_receipt_path, '/media/');
    expect(MediaFile::query()->whereKey($mediaId)->exists())->toBeTrue();
});

test('admin can approve yape payment for an order', function () {
    $admin = User::factory()->create(['role' => SystemRole::Admin]);
    $team = $admin->currentTeam;

    $order = Order::factory()->create([
        'status' => 'pending',
        'payment_method' => 'yape',
        'payment_status' => 'pending',
        'payment_reference' => '123456',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.orders.approve-payment', ['current_team' => $team->slug, 'order' => $order->id]));

    $response->assertRedirect();
    $order->refresh();

    expect($order->payment_status)->toBe('paid');
    expect($order->status)->toBe('processing');
});

test('admin can reject yape payment for an order', function () {
    $admin = User::factory()->create(['role' => SystemRole::Admin]);
    $team = $admin->currentTeam;

    $order = Order::factory()->create([
        'payment_method' => 'yape',
        'payment_status' => 'pending',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.orders.reject-payment', ['current_team' => $team->slug, 'order' => $order->id]));

    $response->assertRedirect();
    $order->refresh();

    expect($order->payment_status)->toBe('rejected');
});

test('authenticated customer can view mis-pedidos list and their order without signed link', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'payment_method' => 'yape',
        'payment_status' => 'pending',
    ]);

    $this->actingAs($user)
        ->get(route('orders.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('orders/index')
            ->has('orders.data', 1)
            ->where('orders.data.0.number', $order->number)
            ->has('companySettings.whatsapp_number')
        );

    $this->actingAs($user)
        ->get(route('orders.show', $order->number))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('orders/show')
            ->where('order.number', $order->number)
            ->has('companySettings.whatsapp_number')
        );
});
