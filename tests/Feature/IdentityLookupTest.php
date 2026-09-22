<?php

use App\Enums\SystemRole;
use App\Models\CompanySetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

test('identity lookup credentials are encrypted hidden and preserved on blank updates', function () {
    $user = User::factory()->create();
    $data = ['identity_lookup_enabled' => true, 'identity_lookup_provider' => 'decolecta', 'identity_lookup_token' => 'test-secret'];

    $this->actingAs($user)->put(route('admin.identity-lookup.update', $user->currentTeam), $data)->assertSessionHasNoErrors();

    expect(DB::table('company_settings')->value('identity_lookup_token'))->not->toBe('test-secret');
    expect(CompanySetting::query()->sole()->toArray())->not->toHaveKey('identity_lookup_token');
    $this->get(route('admin.electronic-billing.edit', $user->currentTeam))->assertInertia(fn ($page) => $page
        ->where('hasIdentityToken', true)->missing('identitySettings.identity_lookup_token'));
    $this->put(route('admin.identity-lookup.update', $user->currentTeam), [...$data, 'identity_lookup_token' => ''])->assertSessionHasNoErrors();
    expect(CompanySetting::query()->sole()->identity_lookup_token)->toBe('test-secret');
});

test('identity lookup cannot be enabled without credentials', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->put(route('admin.identity-lookup.update', $user->currentTeam), ['identity_lookup_enabled' => true, 'identity_lookup_provider' => 'decolecta'])
        ->assertSessionHasErrors('identity_lookup_token');

    $this->assertDatabaseCount('company_settings', 0);
});

test('identity lookup can be disabled and its token removed', function () {
    $user = User::factory()->create();
    CompanySetting::query()->create(['company_name' => 'Tienda', 'identity_lookup_token' => 'test-secret', 'identity_lookup_enabled' => true]);

    $this->actingAs($user)->put(route('admin.identity-lookup.update', $user->currentTeam), ['identity_lookup_enabled' => false, 'identity_lookup_provider' => 'decolecta', 'forget_token' => true])
        ->assertSessionHasNoErrors();

    expect(CompanySetting::query()->sole()->identity_lookup_token)->toBeNull();
    expect(CompanySetting::query()->sole()->identity_lookup_enabled)->toBeFalse();
});

test('configured lookup returns normalized customer data without exposing secrets', function (string $type, string $number, string $path, array $body, string $name) {
    $user = User::factory()->create();
    CompanySetting::query()->create(['company_name' => 'Tienda', 'identity_lookup_enabled' => true, 'identity_lookup_provider' => 'decolecta', 'identity_lookup_token' => 'test-secret']);
    Http::preventStrayRequests();
    Http::fake(['https://api.decolecta.com/v1/'.$path.'*' => Http::response($body)]);

    $this->actingAs($user)->getJson(route('admin.identity-lookup.show', [$user->currentTeam, 'document_type' => $type, 'document_number' => $number]))
        ->assertOk()->assertJsonPath('customer_name', $name)->assertJsonPath('document_number', $number)->assertJsonMissingPath('token');

    Http::assertSent(fn ($request) => $request->hasHeader('Authorization', 'Bearer test-secret') && $request['numero'] === $number);
})->with([
    'DNI' => ['dni', '12345678', 'reniec/dni', ['full_name' => 'ANA PEREZ', 'document_number' => '12345678'], 'ANA PEREZ'],
    'RUC' => ['ruc', '20601030013', 'sunat/ruc', ['razon_social' => 'EMPRESA SAC', 'numero_documento' => '20601030013', 'direccion' => 'Lima', 'estado' => 'ACTIVO', 'condicion' => 'HABIDO'], 'EMPRESA SAC'],
]);

test('lookup failures allow manual entry without exposing provider responses', function (string $failure) {
    $user = User::factory()->create();
    CompanySetting::query()->create(['company_name' => 'Tienda', 'identity_lookup_enabled' => true, 'identity_lookup_provider' => 'decolecta', 'identity_lookup_token' => 'test-secret']);
    Http::preventStrayRequests();
    Http::fake(['https://api.decolecta.com/v1/reniec/dni*' => match ($failure) {
        'connection' => Http::failedConnection(),
        'unauthorized' => Http::response(['error' => 'test-secret'], 401),
        'mismatch' => Http::response(['full_name' => 'OTRA PERSONA', 'document_number' => '87654321']),
        default => Http::response('not json'),
    }]);

    $this->actingAs($user)->getJson(route('admin.identity-lookup.show', [$user->currentTeam, 'document_type' => 'dni', 'document_number' => '12345678']))
        ->assertUnprocessable()->assertJsonValidationErrors('document_number')->assertDontSee('test-secret');

    Http::assertSentCount(1);
})->with(['connection', 'unauthorized', 'mismatch', 'malformed']);

test('disabled lookup makes no external requests', function () {
    $user = User::factory()->create();
    Http::preventStrayRequests();

    $this->actingAs($user)->getJson(route('admin.identity-lookup.show', [$user->currentTeam, 'document_type' => 'dni', 'document_number' => '12345678']))
        ->assertUnprocessable()->assertJsonValidationErrors('document_number');

    Http::assertNothingSent();
});

test('customers cannot consult documents or change credentials', function () {
    $customer = User::factory()->create(['role' => SystemRole::User]);
    Http::preventStrayRequests();

    $this->actingAs($customer)->getJson(route('admin.identity-lookup.show', [$customer->currentTeam, 'document_type' => 'dni', 'document_number' => '12345678']))->assertRedirect(route('cart.index'));
    $this->put(route('admin.identity-lookup.update', $customer->currentTeam), ['identity_lookup_enabled' => false, 'identity_lookup_provider' => 'decolecta'])->assertForbidden();

    Http::assertNothingSent();
    $this->assertDatabaseCount('company_settings', 0);
});
