<?php

use App\Enums\SystemRole;
use App\Models\CompanySetting;
use App\Models\User;

test('administrators configure electronic billing without exposing secrets', function () {
    $admin = User::factory()->create(['role' => SystemRole::Admin]);

    $this->actingAs($admin)->put(route('admin.electronic-billing.update', $admin->currentTeam), [
        'billing_enabled' => true, 'billing_mode' => 'api', 'billing_environment' => 'demo',
        'billing_provider' => 'Proveedor autorizado', 'billing_ruc' => '20123456789',
        'billing_api_url' => 'https://api.example.com', 'billing_api_token' => 'secret-token',
    ])->assertRedirect();

    $settings = CompanySetting::query()->firstOrFail();
    expect($settings->billing_enabled)->toBeTrue()->and($settings->billing_api_token)->toBe('secret-token');
});
