<?php

use App\Enums\SystemRole;
use App\Models\CompanySetting;
use App\Models\Order;
use App\Models\PaymentAttempt;
use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;

beforeEach(function () {
    Http::preventStrayRequests();
    CompanySetting::query()->create(['company_name' => 'Tienda', 'payment_gateway_enabled' => true, 'payment_gateway' => 'culqi', 'payment_test_mode' => false, 'gateway_public_key' => 'pk_live_example', 'gateway_secret_key' => 'sk_live_example']);
});

function culqiCharge(PaymentAttempt $attempt, array $overrides = []): array
{
    return array_replace_recursive(['object' => 'charge', 'id' => 'chr_'.$attempt->environment.'_ExampleCharge', 'amount' => $attempt->amount, 'currency_code' => 'PEN', 'capture' => true, 'outcome' => ['type' => 'venta_exitosa'], 'paid' => false, 'amount_refunded' => 0, 'source' => ['id' => $attempt->source_id], 'metadata' => ['payment_reference' => $attempt->reference]], $overrides);
}

function culqiPayload(array $overrides = []): array
{
    return array_replace(['source_id' => 'tkn_live_ExampleSource', 'email' => 'cliente@example.com', 'device_id' => 'device-example'], $overrides);
}

test('a signed customer can pay the server amount and duplicate requests never create another charge', function () {
    $order = Order::factory()->create(['payment_method' => 'gateway']);
    Http::fake(fn () => Http::response(culqiCharge(PaymentAttempt::query()->sole()), 201));
    $url = URL::signedRoute('orders.culqi.store', ['number' => $order->number]);

    $this->postJson($url, culqiPayload(['amount' => 1, 'currency' => 'USD', 'payment_status' => 'paid']))->assertOk()->assertJsonPath('attempt.status', 'paid')->assertJsonMissingPath('attempt.secret_key')->assertJsonMissingPath('attempt.source_id');
    $this->postJson($url, culqiPayload())->assertUnprocessable();

    expect($order->fresh()->payment_status)->toBe('paid');
    Http::assertSentCount(2);
    Http::assertSent(fn (Request $request) => $request->method() === 'POST' && $request['amount'] === 11500 && $request['currency_code'] === 'PEN' && $request['capture'] === true);
    $this->assertDatabaseCount('payment_attempts', 1);
});

test('test charges never mark a real order paid', function () {
    CompanySetting::query()->first()->update(['payment_test_mode' => true, 'gateway_public_key' => 'pk_test_example', 'gateway_secret_key' => 'sk_test_example']);
    $order = Order::factory()->create(['payment_method' => 'gateway']);
    Http::fake(fn () => Http::response(culqiCharge(PaymentAttempt::query()->sole()), 200));

    $this->postJson(URL::signedRoute('orders.culqi.store', ['number' => $order->number]), culqiPayload(['source_id' => 'tkn_test_ExampleSource']))->assertOk()->assertJsonPath('attempt.status', 'test_paid');
    expect($order->fresh()->payment_status)->toBe('pending');
});

test('guests without a signature and other customers cannot pay or inspect an order', function () {
    $order = Order::factory()->create(['payment_method' => 'gateway', 'user_id' => User::factory()]);
    $this->postJson(route('orders.culqi.store', $order->number), culqiPayload())->assertForbidden();
    $this->actingAs(User::factory()->create())->getJson(route('orders.culqi.show', $order->number))->assertForbidden();
    Http::assertNothingSent();
});

test('expired payment links are rejected', function () {
    $order = Order::factory()->create(['payment_method' => 'gateway']);
    $this->postJson(URL::temporarySignedRoute('orders.culqi.store', now()->subMinute(), ['number' => $order->number]), culqiPayload())->assertForbidden();
    Http::assertNothingSent();
});

test('ambiguous charge results prevent a second charge', function (string $failure) {
    $order = Order::factory()->create(['payment_method' => 'gateway']);
    Http::fake(['*' => $failure === 'timeout' ? Http::failedConnection() : Http::response(['error' => 'unavailable'], 503)]);
    $url = URL::signedRoute('orders.culqi.store', ['number' => $order->number]);
    $this->postJson($url, culqiPayload())->assertOk()->assertJsonPath('attempt.status', 'unknown');
    $this->postJson($url, culqiPayload())->assertOk()->assertJsonPath('attempt.status', 'unknown');
    $this->postJson($url, culqiPayload(['source_id' => 'tkn_live_AnotherSource']))->assertUnprocessable();
    expect($order->fresh()->payment_status)->toBe('pending');
    $this->assertDatabaseCount('payment_attempts', 1);
})->with(['timeout', 'server error']);

test('a declined payment allows a new token', function () {
    $order = Order::factory()->create(['payment_method' => 'gateway']);
    Http::fake(['*' => Http::response(['object' => 'error', 'type' => 'card_error'], 402)]);
    $url = URL::signedRoute('orders.culqi.store', ['number' => $order->number]);
    $this->postJson($url, culqiPayload())->assertOk()->assertJsonPath('attempt.status', 'failed');
    $this->postJson($url, culqiPayload(['source_id' => 'tkn_live_AnotherSource']))->assertOk()->assertJsonPath('attempt.status', 'failed');
    Http::assertSentCount(2);
});

test('three ds continues with the original device and source only once', function () {
    $order = Order::factory()->create(['payment_method' => 'gateway']);
    $posts = 0;
    Http::fake(function (Request $request) use (&$posts) {
        if ($request->method() === 'POST' && ++$posts === 1) {
            return Http::response(['action_code' => 'REVIEW', 'user_message' => 'El usuario necesita autenticarse']);
        }

        return Http::response(culqiCharge(PaymentAttempt::query()->sole()), 201);
    });
    $url = URL::signedRoute('orders.culqi.store', ['number' => $order->number]);
    $this->postJson($url, culqiPayload())->assertOk()->assertJsonPath('attempt.status', 'requires_action');
    $this->postJson($url, culqiPayload())->assertOk()->assertJsonPath('attempt.status', 'requires_action');
    $this->postJson($url, culqiPayload(['device_id' => 'changed', 'authentication_3DS' => ['eci' => '05', 'xid' => 'xid', 'cavv' => 'cavv', 'protocolVersion' => '2.1.0', 'directoryServerTransactionId' => 'transaction']]))->assertOk()->assertJsonPath('attempt.status', 'paid');
    Http::assertSentCount(3);
    Http::assertSent(fn (Request $request) => isset($request['authentication_3DS']) && $request['antifraud_details']['device_finger_print_id'] === 'device-example');
});

test('cancelled bank verification cannot later submit a charge with the same token', function () {
    $attempt = PaymentAttempt::factory()->create(['status' => 'requires_action']);
    $this->deleteJson(URL::signedRoute('orders.culqi.cancel', ['number' => $attempt->order->number]))->assertOk()->assertJsonPath('attempt.status', 'failed');
    $this->postJson(URL::signedRoute('orders.culqi.store', ['number' => $attempt->order->number]), culqiPayload(['source_id' => $attempt->source_id]))->assertOk()->assertJsonPath('attempt.status', 'failed');
    Http::assertNothingSent();
});

test('reconciliation rejects a mismatched provider charge', function (array $overrides) {
    $attempt = PaymentAttempt::factory()->create(['charge_id' => 'chr_live_ExampleCharge']);
    Http::fake(['*' => Http::response(culqiCharge($attempt, $overrides))]);
    $this->getJson(URL::signedRoute('orders.culqi.show', ['number' => $attempt->order->number]))->assertOk()->assertJsonPath('attempt.status', 'unknown');
    expect($attempt->order->fresh()->payment_status)->toBe('pending');
})->with([
    'amount' => [['amount' => 100]], 'currency' => [['currency_code' => 'USD']],
    'source' => [['source' => ['id' => 'tkn_live_Other']]],
    'reference' => [['metadata' => ['payment_reference' => 'other']]],
    'uncaptured' => [['capture' => false]], 'unknown outcome' => [['outcome' => ['type' => 'unknown']]], 'environment' => [['id' => 'chr_test_ExampleCharge']],
]);

test('a verified webhook recovers an interrupted charge and is replay safe', function () {
    $attempt = PaymentAttempt::factory()->create();
    $charge = culqiCharge($attempt);
    $event = ['object' => 'event', 'id' => 'evt_live_ExampleEvent', 'type' => 'charge.creation.succeeded', 'data' => json_encode($charge)];
    Http::fake(['*/events/*' => Http::response($event), '*/charges/*' => Http::response($charge)]);
    $this->postJson(route('culqi.webhook'), $event)->assertOk();
    $this->postJson(route('culqi.webhook'), $event)->assertOk();
    expect($attempt->order->fresh()->payment_status)->toBe('paid');
    expect($attempt->fresh()->charge_id)->toBe('chr_live_ExampleCharge');
    $this->assertDatabaseCount('payment_attempts', 1);
});

test('forged webhook data cannot mark a payment paid', function () {
    $attempt = PaymentAttempt::factory()->create();
    Http::fake(['*/events/*' => Http::response(['object' => 'error'], 404)]);
    $this->postJson(route('culqi.webhook'), ['id' => 'evt_live_Forged', 'data' => culqiCharge($attempt)])->assertOk();
    expect($attempt->order->fresh()->payment_status)->toBe('pending');
    Http::assertSentCount(1);
});

test('administrators cannot bypass gateway confirmation using manual payment actions', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create(['payment_method' => 'gateway']);
    $this->actingAs($user)->post(route('admin.orders.approve-payment', [$user->currentTeam, $order]))->assertUnprocessable();
    $this->post(route('admin.orders.reject-payment', [$user->currentTeam, $order]))->assertUnprocessable();
    $this->put(route('admin.orders.update', [$user->currentTeam, $order]), ['status' => 'pending', 'payment_status' => 'paid'])->assertSessionHasErrors('payment_status');
    $this->put(route('admin.orders.update', [$user->currentTeam, $order]), ['status' => 'confirmed'])->assertSessionHasNoErrors();
    expect($order->fresh()->payment_status)->toBe('pending');
});

test('gateway orders reject manual proof uploads', function () {
    $order = Order::factory()->create(['payment_method' => 'gateway']);
    $this->postJson(URL::signedRoute('orders.submit-payment', ['number' => $order->number]), ['payment_reference' => 'fake'])->assertUnprocessable();
});

test('customers cannot access gateway administration', function () {
    $admin = User::factory()->create();
    $customer = User::factory()->create(['role' => SystemRole::User]);
    $attempt = PaymentAttempt::factory()->create();
    $this->actingAs($customer)->post(route('admin.culqi.update', [$admin->currentTeam, $attempt]), ['charge_id' => 'chr_live_Example'])->assertForbidden();
    Http::assertNothingSent();
});

test('refunds remain pending until confirmed and cannot be submitted twice', function () {
    $user = User::factory()->create();
    $attempt = PaymentAttempt::factory()->create(['status' => 'paid', 'charge_id' => 'chr_live_ExampleCharge']);
    $attempt->order->update(['payment_status' => 'paid']);
    Http::fake(['*/refunds' => Http::response(['object' => 'refund', 'status' => 'Pendiente']), '*/charges/*' => Http::sequence()->push(culqiCharge($attempt))->push(culqiCharge($attempt, ['amount_refunded' => 11500]))]);
    $url = route('admin.culqi.refund', [$user->currentTeam, $attempt]);
    $this->actingAs($user)->post($url, ['confirm' => true])->assertRedirect()->assertSessionHasNoErrors();
    expect($attempt->fresh()->status)->toBe('refund_pending');
    $this->post($url, ['confirm' => true])->assertSessionHasErrors('payment');
    Http::assertSentCount(2);
    $this->post(route('admin.culqi.update', [$user->currentTeam, $attempt]))->assertRedirect();
    expect($attempt->fresh()->status)->toBe('refunded');
    expect($attempt->order->fresh()->payment_status)->toBe('refunded');
});

test('refund actions require explicit confirmation', function () {
    $user = User::factory()->create();
    $attempt = PaymentAttempt::factory()->create(['status' => 'paid', 'charge_id' => 'chr_live_ExampleCharge']);
    $this->actingAs($user)->post(route('admin.culqi.refund', [$user->currentTeam, $attempt]))->assertSessionHasErrors('confirm');
    Http::assertNothingSent();
});

test('yape tokens can pay without a card fingerprint', function () {
    $order = Order::factory()->create(['payment_method' => 'gateway']);
    Http::fake(fn () => Http::response(culqiCharge(PaymentAttempt::query()->sole()), 201));
    $this->postJson(URL::signedRoute('orders.culqi.store', ['number' => $order->number]), culqiPayload(['source_id' => 'ype_live_ExampleSource', 'device_id' => null]))->assertOk()->assertJsonPath('attempt.status', 'paid');
    Http::assertSent(fn (Request $request) => $request->url() === 'https://api.culqi.com/v2/charges' && $request['source_id'] === 'ype_live_ExampleSource' && ! isset($request['antifraud_details']));
});

test('invalid amounts environments and disabled methods cannot create charges', function (array $orderData, array $settings, array $payload) {
    $order = Order::factory()->create(['payment_method' => 'gateway', ...$orderData]);
    CompanySetting::query()->first()->update($settings);
    $this->postJson(URL::signedRoute('orders.culqi.store', ['number' => $order->number]), culqiPayload($payload))->assertUnprocessable();
    Http::assertNothingSent();
    $this->assertDatabaseCount('payment_attempts', 0);
})->with([
    'yape limit' => [['total' => 2000.01], [], ['source_id' => 'ype_live_Example']],
    'card limit' => [['total' => 10000], [], []],
    'minimum' => [['total' => 2.99], [], []],
    'cancelled' => [['status' => 'cancelled'], [], []],
    'already paid' => [['payment_status' => 'paid'], [], []],
    'manual method' => [['payment_method' => 'yape'], [], []],
    'environment mismatch' => [[], [], ['source_id' => 'tkn_test_Example']],
    'disabled cards' => [[], ['culqi_cards_enabled' => false], []],
    'disabled yape' => [[], ['culqi_yape_enabled' => false], ['source_id' => 'ype_live_Example']],
]);

test('an in flight attempt blocks another token before calling the provider', function () {
    $attempt = PaymentAttempt::factory()->create(['status' => 'processing']);
    $url = URL::signedRoute('orders.culqi.store', ['number' => $attempt->order->number]);
    $this->postJson($url, culqiPayload(['source_id' => $attempt->source_id]))->assertOk()->assertJsonPath('attempt.status', 'processing');
    $this->postJson($url, culqiPayload())->assertUnprocessable();
    Http::assertNothingSent();
});

test('confirmed provider denials release an interrupted attempt', function () {
    $attempt = PaymentAttempt::factory()->create(['charge_id' => 'chr_live_ExampleCharge']);
    Http::fake(['*' => Http::response(culqiCharge($attempt, ['capture' => false, 'outcome' => ['type' => 'operacion_denegada']]))]);
    $this->getJson(URL::signedRoute('orders.culqi.show', ['number' => $attempt->order->number]))->assertOk()->assertJsonPath('attempt.status', 'failed');
    expect($attempt->order->fresh()->payment_status)->toBe('pending');
});

test('refund timeout does not permit another refund submission', function () {
    $admin = User::factory()->create();
    $attempt = PaymentAttempt::factory()->create(['status' => 'paid', 'charge_id' => 'chr_live_ExampleCharge']);
    Http::fake(['*' => Http::failedConnection()]);
    $url = route('admin.culqi.refund', [$admin->currentTeam, $attempt]);
    $this->actingAs($admin)->post($url, ['confirm' => true])->assertSessionHasNoErrors();
    $this->post($url, ['confirm' => true])->assertSessionHasErrors('payment');
    expect($attempt->fresh()->status)->toBe('refund_pending');
});

test('a source token cannot be reused on another order', function () {
    $attempt = PaymentAttempt::factory()->create(['status' => 'failed']);
    $otherOrder = Order::factory()->create(['payment_method' => 'gateway']);
    $this->postJson(URL::signedRoute('orders.culqi.store', ['number' => $otherOrder->number]), culqiPayload(['source_id' => $attempt->source_id]))->assertUnprocessable();
    Http::assertNothingSent();
    $this->assertDatabaseCount('payment_attempts', 1);
});

test('webhooks request a retry when canonical charge verification is unavailable even for previously verified payments', function () {
    $attempt = PaymentAttempt::factory()->create(['status' => 'paid', 'charge_id' => 'chr_live_ExampleCharge', 'verified_at' => now()->subDay()]);
    $event = ['object' => 'event', 'id' => 'evt_live_RefundEvent', 'type' => 'refund.creation.succeeded', 'data' => ['object' => 'refund', 'charge_id' => $attempt->charge_id]];
    Http::fake(['*/events/*' => Http::response($event), '*/charges/*' => Http::response([], 503)]);
    $this->postJson(route('culqi.webhook'), $event)->assertStatus(503);
    expect($attempt->fresh()->status)->toBe('paid');
});
