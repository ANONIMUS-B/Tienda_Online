<?php

use App\Models\CompanySetting;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;

beforeEach(function () {
    $this->withoutVite();
});

function multipleGatewaySettings(array $overrides = []): array
{
    return array_replace([
        'company_name' => 'JBTECHLINE',
        'payment_gateway_enabled' => true,
        'payment_gateway' => 'culqi',
        'payment_test_mode' => true,
        'gateway_public_key' => 'pk_test_example',
        'gateway_secret_key' => 'sk_test_example',
        'culqi_cards_enabled' => true,
        'culqi_yape_enabled' => true,
        'culqi_pagoefectivo_enabled' => true,
        'culqi_cip_expiration_hours' => 24,
        'payment_transfer_enabled' => false,
        'payment_cash_enabled' => false,
        'payment_yape_enabled' => false,
    ], $overrides);
}

test('checkout offers culqi and pago efectivo independently', function () {
    CompanySetting::query()->create(multipleGatewaySettings());
    $product = Product::factory()->create(['price' => 10, 'promotional_price' => null, 'stock' => 1]);

    $this->actingAs(User::factory()->create())->withSession(['cart' => [$product->id => 1]])
        ->get(route('checkout.create'))
        ->assertInertia(fn ($page) => $page
            ->where('paymentMethods.0.value', 'gateway')
            ->where('paymentMethods.1.value', 'pagoefectivo')
            ->has('paymentMethods', 2));
});

test('pago efectivo creates a culqi order without exposing the secret', function () {
    CompanySetting::query()->create(multipleGatewaySettings());
    $order = Order::factory()->create([
        'payment_method' => 'pagoefectivo',
        'payment_status' => 'pending',
        'total' => 3.90,
    ]);
    Http::fake(['https://api.culqi.com/v2/orders' => Http::response([
        'id' => 'ord_test_123456789',
        'payment_code' => '123456789',
        'state' => 'pending',
    ], 201)]);

    $this->postJson(URL::signedRoute('orders.pagoefectivo.store', ['number' => $order->number]))
        ->assertOk()
        ->assertJsonPath('attempt.payment_type', 'pagoefectivo')
        ->assertJsonPath('attempt.provider_order_id', 'ord_test_123456789')
        ->assertJsonMissingPath('attempt.secret_key');

    Http::assertSent(fn (Request $request) => $request->url() === 'https://api.culqi.com/v2/orders'
        && $request['amount'] === 390
        && $request['confirm'] === false);
});

test('repeated pago efectivo requests reuse the active provider order', function () {
    CompanySetting::query()->create(multipleGatewaySettings());
    $order = Order::factory()->create(['payment_method' => 'pagoefectivo', 'payment_status' => 'pending', 'total' => 3.90]);
    Http::fake(['https://api.culqi.com/v2/orders' => Http::response(['id' => 'ord_test_once', 'payment_code' => '123456789'], 201)]);
    $url = URL::signedRoute('orders.pagoefectivo.store', ['number' => $order->number]);

    $this->postJson($url)->assertOk()->assertJsonPath('attempt.provider_order_id', 'ord_test_once');
    $this->postJson($url)->assertOk()->assertJsonPath('attempt.provider_order_id', 'ord_test_once');

    Http::assertSentCount(1);
    $this->assertDatabaseCount('payment_attempts', 1);
});

test('pago efectivo reconciliation updates a live order only after provider confirmation', function () {
    CompanySetting::query()->create(multipleGatewaySettings(['payment_test_mode' => false, 'gateway_public_key' => 'pk_live_example', 'gateway_secret_key' => 'sk_live_example']));
    $order = Order::factory()->create(['payment_method' => 'pagoefectivo', 'payment_status' => 'pending', 'total' => 3.90]);
    $attempt = $order->paymentAttempts()->create([
        'reference' => fake()->uuid(), 'provider' => 'culqi', 'payment_type' => 'pagoefectivo',
        'environment' => 'live', 'amount' => 390, 'status' => 'pending',
        'source_hash' => hash('sha256', fake()->uuid()), 'source_id' => 'internal',
        'secret_key' => 'sk_live_example', 'email' => 'cliente@example.com',
        'provider_order_id' => 'ord_live_123456789',
    ]);
    Http::fake(['https://api.culqi.com/v2/orders/*' => Http::response(['id' => $attempt->provider_order_id, 'state' => 'paid', 'payment_code' => '987654321'])]);

    $this->getJson(URL::signedRoute('orders.pagoefectivo.show', ['number' => $order->number]))
        ->assertOk()
        ->assertJsonPath('attempt.status', 'paid');

    expect($order->fresh()->payment_status)->toBe('paid');
});

test('izipay cannot be enabled before all contract credentials are configured', function () {
    $admin = User::factory()->create();
    $payload = multipleGatewaySettings([
        'izipay_enabled' => true,
        'izipay_merchant_code' => '',
        'izipay_public_key' => '',
        'izipay_api_username' => '',
        'izipay_api_password' => '',
        'izipay_hash_key' => '',
        'whatsapp_checkout_enabled' => true,
    ]);

    $this->actingAs($admin)->put(route('admin.company-settings.update', $admin->currentTeam), $payload)
        ->assertSessionHasErrors(['izipay_merchant_code', 'izipay_public_key', 'izipay_api_username', 'izipay_api_password', 'izipay_hash_key']);
});
