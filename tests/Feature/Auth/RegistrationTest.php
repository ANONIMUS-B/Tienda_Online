<?php

use App\Enums\SystemRole;
use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('registration screen includes team invitation context', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create(['name' => 'Laravel Team']);
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $invitation = TeamInvitation::factory()->create([
        'team_id' => $team->id,
        'email' => 'invited@example.com',
        'invited_by' => $owner->id,
    ]);

    $response = $this->get(route('register', ['invitation' => $invitation->code]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/register')
        ->where('teamInvitation.code', $invitation->code)
        ->where('teamInvitation.teamName', 'Laravel Team'),
    );
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'document_type' => 'dni',
        'document_number' => '12345678',
        'address' => 'Av. Principal 123',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();

    $user = User::where('email', 'test@example.com')->first();
    expect($user->role)->toBe(SystemRole::User);
    expect($user->document_type)->toBe('dni');
    expect($user->document_number)->toBe('12345678');
    expect($user->teamRole($user->currentTeam))->toBe(TeamRole::Customer);
    $response->assertRedirect(route('cart.index'));
});

test('customers registered from the storefront cannot access administration', function () {
    $this->post(route('register.store'), [
        'name' => 'Store Customer',
        'email' => 'customer@example.com',
        'document_type' => 'ruc',
        'document_number' => '20123456789',
        'address' => 'Jr. Comercio 456',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $customer = User::where('email', 'customer@example.com')->firstOrFail();

    $this->get(route('admin.customers.index', $customer->currentTeam))->assertForbidden();
});
