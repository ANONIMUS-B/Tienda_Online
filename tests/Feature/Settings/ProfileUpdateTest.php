<?php

use App\Enums\SystemRole;
use App\Models\User;

test('customers can edit their own phone name and email without changing privileges', function () {
    $user = User::factory()->create(['role' => SystemRole::User]);
    $other = User::factory()->create();
    $this->actingAs($user)->patch(route('profile.update'), [
        'name' => 'Cliente actualizado', 'email' => 'cliente@example.com', 'phone' => '+51 999 888 777',
        'id' => $other->id, 'role' => 'admin',
    ])->assertSessionHasNoErrors()->assertRedirect(route('profile.edit'));
    expect($user->fresh()->phone)->toBe('+51 999 888 777');
    expect($user->fresh()->role)->toBe(SystemRole::User);
    expect($other->fresh()->email)->toBe($other->email);
    $this->get(route('profile.edit'))->assertInertia(fn ($page) => $page->where('auth.user.phone', '+51 999 888 777')->where('auth.user.email', 'cliente@example.com'));
});

test('invalid phone values do not change the profile', function (string $phone) {
    $user = User::factory()->create(['phone' => '999888777']);
    $this->actingAs($user)->patch(route('profile.update'), ['name' => $user->name, 'email' => $user->email, 'phone' => $phone])->assertSessionHasErrors('phone');
    expect($user->fresh()->phone)->toBe('999888777');
})->with(['abc', '123', '-------', str_repeat('9', 31)]);

test('customers can clear their optional phone', function () {
    $user = User::factory()->create(['phone' => '999888777']);
    $this->actingAs($user)->patch(route('profile.update'), ['name' => $user->name, 'email' => $user->email, 'phone' => ''])->assertSessionHasNoErrors();
    expect($user->fresh()->phone)->toBeNull();
});

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});
