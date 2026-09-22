<?php

use App\Models\CompanySetting;
use App\Models\Order;
use App\Models\PaymentAttempt;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;

beforeEach(function () {
    $this->withoutVite();
});

function culqiSettingsPayload(array $overrides = []): array
{
    return array_replace(['company_name' => 'Tienda', 'payment_yape_enabled' => true, 'payment_transfer_enabled' => true, 'payment_cash_enabled' => false, 'payment_gateway_enabled' => true, 'payment_gateway' => 'culqi', 'payment_test_mode' => true, 'gateway_public_key' => 'pk_test_example', 'gateway_secret_key' => 'sk_test_example', 'whatsapp_checkout_enabled' => true, 'culqi_cards_enabled' => true, 'culqi_yape_enabled' => true], $overrides);
}

test('settings validate environment keys enabled methods and supported provider', function (array $overrides, string $field) {
    $admin = User::factory()->create();
    $this->actingAs($admin)->put(route('admin.company-settings.update', $admin->currentTeam), culqiSettingsPayload($overrides))->assertSessionHasErrors($field);
})->with([
    'wrong public environment' => [['gateway_public_key' => 'pk_live_example'], 'gateway_public_key'],
    'wrong private environment' => [['gateway_secret_key' => 'sk_live_example'], 'gateway_secret_key'],
    'missing keys' => [['gateway_secret_key' => null], 'gateway_secret_key'],
    'no methods' => [['culqi_cards_enabled' => false, 'culqi_yape_enabled' => false], 'culqi_cards_enabled'],
    'unsupported provider' => [['payment_gateway' => 'niubiz'], 'payment_gateway'],
    'incomplete RSA' => [['culqi_rsa_id' => 'example'], 'culqi_rsa_public_key'],
]);

test('administrators can preserve stored secrets or disable online payments', function () {
    $admin = User::factory()->create();
    $url = route('admin.company-settings.update', $admin->currentTeam);
    $this->actingAs($admin)->put($url, culqiSettingsPayload())->assertSessionHasNoErrors();
    $this->put($url, culqiSettingsPayload(['gateway_public_key' => '', 'gateway_secret_key' => '']))->assertSessionHasNoErrors();
    expect(CompanySetting::query()->sole()->gateway_secret_key)->toBe('sk_test_example');
    expect(DB::table('company_settings')->value('gateway_secret_key'))->not->toBe('sk_test_example');
    $this->put($url, culqiSettingsPayload(['payment_test_mode' => false, 'gateway_public_key' => '', 'gateway_secret_key' => '']))->assertSessionHasErrors(['gateway_public_key', 'gateway_secret_key']);
    $this->put($url, culqiSettingsPayload(['payment_gateway_enabled' => false, 'gateway_public_key' => '', 'gateway_secret_key' => '']))->assertSessionHasNoErrors();
});

test('customer checkout configuration exposes public credentials only', function () {
    CompanySetting::query()->create(culqiSettingsPayload());
    $attempt = PaymentAttempt::factory()->create();
    $this->get(URL::signedRoute('orders.show', ['number' => $attempt->order->number]))->assertInertia(fn ($page) => $page
        ->component('orders/show')->where('culqi.publicKey', 'pk_test_example')->where('culqi.testMode', true)
        ->missing('culqi.secretKey')->missing('culqi.attempt.secret_key')->missing('culqi.attempt.source_id')->missing('culqi.attempt.device_id'));
});

test('administrators can inspect history without exposing credentials', function () {
    $admin = User::factory()->create();
    PaymentAttempt::factory()->create();
    $this->actingAs($admin)->get(route('admin.culqi.index', $admin->currentTeam))->assertOk()->assertInertia(fn ($page) => $page
        ->component('admin/culqi/index')->has('payments.data', 1)->missing('payments.data.0.secret_key')->missing('payments.data.0.source_id'));
});

test('disabled culqi rejects new charges even with a valid signed link', function () {
    Http::preventStrayRequests();
    CompanySetting::query()->create(culqiSettingsPayload(['payment_gateway_enabled' => false]));
    $order = Order::factory()->create(['payment_method' => 'gateway']);
    $this->postJson(URL::signedRoute('orders.culqi.store', ['number' => $order->number]), ['source_id' => 'ype_test_Example', 'email' => 'cliente@example.com'])->assertUnprocessable();
    Http::assertNothingSent();
    $this->assertDatabaseCount('payment_attempts', 0);
});

test('checkout hides culqi until credentials are ready', function () {
    $settings = CompanySetting::query()->create(culqiSettingsPayload(['gateway_secret_key' => null, 'payment_yape_enabled' => false, 'payment_transfer_enabled' => false]));
    $product = Product::factory()->create(['stock' => 1]);
    $this->actingAs(User::factory()->create())->withSession(['cart' => [$product->id => 1]])->get(route('checkout.create'))->assertInertia(fn ($page) => $page->has('paymentMethods', 0));
    $settings->update(['gateway_secret_key' => 'sk_test_example']);
    $this->get(route('checkout.create'))->assertInertia(fn ($page) => $page->has('paymentMethods', 1)->where('paymentMethods.0.value', 'gateway'));
});

test('manual culqi sales require pending status and a customer email', function () {
    CompanySetting::query()->create(culqiSettingsPayload());
    $admin = User::factory()->create();
    $payload = ['receipt_type' => 'boleta', 'document_type' => 'none', 'payment_method' => 'gateway', 'payment_status' => 'paid', 'requires_identification' => false, 'items' => [['name' => 'Servicio', 'quantity' => 1, 'unit_price' => 50]]];
    $url = route('admin.orders.store', $admin->currentTeam);
    $this->actingAs($admin)->post($url, $payload)->assertSessionHasErrors(['payment_status', 'customer_email']);
    $this->post($url, [...$payload, 'payment_status' => 'pending', 'customer_email' => 'cliente@example.com'])->assertSessionHasNoErrors();
    expect(Order::query()->sole()->payment_status)->toBe('pending');
});

test('checkout rejects amounts outside the enabled culqi limits without reserving stock', function (float $price, bool $cards) {
    CompanySetting::query()->create(culqiSettingsPayload(['culqi_cards_enabled' => $cards]));
    $product = Product::factory()->create(['price' => $price, 'promotional_price' => null, 'stock' => 1]);
    $this->actingAs(User::factory()->create())->withSession(['cart' => [$product->id => 1]])->post(route('checkout.store'), [
        'customer_name' => 'Cliente', 'customer_email' => 'cliente@example.com', 'customer_phone' => '999999999',
        'address' => 'Lima', 'district' => 'Lima', 'province' => 'Lima', 'department' => 'Lima',
        'shipping_method' => 'store_pickup', 'payment_method' => 'gateway',
    ])->assertSessionHasErrors('payment_method');
    $this->assertDatabaseCount('orders', 0);
    expect($product->fresh()->stock)->toBe(1);
})->with(['minimum' => [2.99, true], 'card maximum' => [10000.0, true], 'only yape maximum' => [2000.01, false]]);
