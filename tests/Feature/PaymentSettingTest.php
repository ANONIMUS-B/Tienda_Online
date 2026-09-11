<?php

use App\Models\CompanySetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

test('administrators configure enabled payments whatsapp and encrypted gateway credentials', function () {
    $user = User::factory()->create();
    $payload = ['company_name' => 'JBTECHLINE', 'phone' => null, 'whatsapp_number' => '51999888777', 'email' => 'ventas@example.com', 'address' => null, 'facebook_url' => null, 'instagram_url' => null, 'tiktok_url' => null, 'payment_yape_enabled' => true, 'payment_transfer_enabled' => false, 'payment_cash_enabled' => true, 'payment_gateway_enabled' => true, 'payment_gateway' => 'culqi', 'payment_test_mode' => true, 'gateway_public_key' => 'pk_test_demo', 'gateway_secret_key' => 'sk_test_secret', 'yape_number' => '999888777', 'bank_name' => null, 'bank_account' => null, 'whatsapp_checkout_enabled' => true];

    $this->actingAs($user)->put(route('admin.company-settings.update', $user->currentTeam), $payload)->assertRedirect();

    $settings = CompanySetting::query()->firstOrFail();
    expect($settings->gateway_secret_key)->toBe('sk_test_secret');
    expect(DB::table('company_settings')->value('gateway_secret_key'))->not->toBe('sk_test_secret');
    $this->actingAs($user)->get(route('admin.company-settings.edit', $user->currentTeam))->assertInertia(fn ($page) => $page->component('admin/company-settings/edit')->where('hasSecretKey', true)->missing('settings.gateway_secret_key'));
});
