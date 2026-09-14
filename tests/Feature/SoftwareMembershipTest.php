<?php

use App\Enums\SystemRole;
use App\Models\CompanySetting;
use App\Models\MediaFile;
use App\Models\SoftwareMembership;
use App\Models\SoftwareProgram;
use App\Models\User;

test('customers request a configured software membership', function () {
    $customer = User::factory()->create(['role' => SystemRole::User]);
    CompanySetting::query()->create(['company_name' => 'JBTECHLINE', 'software_membership_enabled' => true, 'software_membership_price' => 350, 'software_membership_period' => 'annual', 'payment_yape_enabled' => true, 'payment_transfer_enabled' => false]);

    $this->actingAs($customer)->post(route('software-memberships.store'), ['payment_method' => 'yape', 'payment_reference' => 'OP-12345'])->assertRedirect();

    $this->assertDatabaseHas('software_memberships', ['user_id' => $customer->id, 'plan' => 'annual', 'amount' => 350, 'status' => 'pending']);
});

test('permanent memberships remain active without an expiration date', function () {
    $customer = User::factory()->create(['role' => SystemRole::User]);
    SoftwareMembership::factory()->for($customer)->create(['plan' => 'permanent', 'status' => 'active', 'starts_at' => now(), 'expires_at' => null]);

    expect($customer->hasActiveSoftwareMembership())->toBeTrue();
});

test('administrators activate memberships using the selected billing period', function () {
    $admin = User::factory()->create(['role' => SystemRole::Admin]);
    $membership = SoftwareMembership::factory()->create(['plan' => 'monthly']);

    $this->actingAs($admin)->put(route('admin.software-memberships.update', [$admin->currentTeam, $membership]), ['status' => 'active'])->assertRedirect();

    $membership->refresh();
    expect($membership->status)->toBe('active')->and($membership->approved_by)->toBe($admin->id)->and($membership->expires_at)->not->toBeNull();
});

test('paid programs require an active membership to download', function () {
    $file = MediaFile::query()->create(['id' => (string) str()->uuid(), 'mime_type' => 'application/zip', 'size' => 4, 'original_name' => 'premium.zip', 'contents' => base64_encode('demo')]);
    $program = SoftwareProgram::factory()->create(['file_id' => $file->id, 'license_type' => 'paid', 'download_enabled' => false]);
    $customer = User::factory()->create(['role' => SystemRole::User]);

    $this->actingAs($customer)->get(route('programs.download', $program))->assertForbidden();
    SoftwareMembership::factory()->for($customer)->create(['status' => 'active', 'starts_at' => now(), 'expires_at' => now()->addMonth()]);
    $this->actingAs($customer)->get(route('programs.download', $program))->assertOk()->assertDownload('premium.zip');
});
