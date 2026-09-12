<?php

use App\Enums\SystemRole;
use App\Models\CompanySetting;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;

test('admin has full access and can create update roles and delete users', function () {
    $admin = User::factory()->create(['role' => SystemRole::Admin]);
    $team = $admin->currentTeam;

    $this->actingAs($admin)->get(route('admin.users.index', $team))->assertOk();
    $this->actingAs($admin)->post(route('admin.users.store', $team), [
        'name' => 'Nuevo Subadmin', 'email' => 'subadmin@example.com', 'password' => 'password',
        'password_confirmation' => 'password', 'role' => 'subadmin', 'is_active' => true,
    ])->assertRedirect(route('admin.users.index', $team));

    $subadmin = User::query()->where('email', 'subadmin@example.com')->firstOrFail();
    expect($subadmin->role)->toBe(SystemRole::Subadmin);

    $this->actingAs($admin)->put(route('admin.users.update', [$team, $subadmin]), [
        'name' => 'Cliente Actualizado', 'email' => 'subadmin@example.com', 'password' => '',
        'password_confirmation' => '', 'role' => 'user', 'is_active' => true,
    ])->assertRedirect(route('admin.users.index', $team));
    expect($subadmin->fresh()->role)->toBe(SystemRole::User);

    $this->actingAs($admin)->delete(route('admin.users.destroy', [$team, $subadmin]))->assertRedirect();
    $this->assertModelMissing($subadmin);
});

test('subadmin can use administration but cannot mutate users or roles', function () {
    $subadmin = User::factory()->create(['role' => SystemRole::Subadmin]);
    $target = User::factory()->create(['role' => SystemRole::User]);
    $team = $subadmin->currentTeam;

    $this->actingAs($subadmin)->get(route('dashboard', $team))->assertOk();
    $this->actingAs($subadmin)->get(route('admin.products.index', $team))->assertOk();
    $this->actingAs($subadmin)->get(route('admin.users.index', $team))->assertOk();
    $this->actingAs($subadmin)->get(route('admin.users.create', $team))->assertForbidden();
    $this->actingAs($subadmin)->post(route('admin.users.store', $team), [])->assertForbidden();
    $this->actingAs($subadmin)->put(route('admin.users.update', [$team, $target]), [])->assertForbidden();
    $this->actingAs($subadmin)->delete(route('admin.users.destroy', [$team, $target]))->assertForbidden();
    $this->assertModelExists($target);
});

test('normal user cannot access any administrative route', function () {
    $user = User::factory()->create(['role' => SystemRole::User]);
    $team = $user->currentTeam;

    $this->actingAs($user)->get(route('dashboard', $team))->assertRedirect(route('cart.index'));
    $this->actingAs($user)->get(route('admin.orders.index', $team))->assertRedirect(route('cart.index'));
    $this->actingAs($user)->get(route('admin.users.index', $team))->assertRedirect(route('cart.index'));
    $this->actingAs($user)->get(route('admin.company-settings.edit', $team))->assertRedirect(route('cart.index'));
    $this->actingAs($user)->delete(route('admin.users.destroy', [$team, User::factory()->create()]))->assertForbidden();
});

test('normal user is redirected to the customer cart after login even with an administrative intended url', function () {
    $user = User::factory()->create(['role' => SystemRole::User, 'email' => 'buyer@example.com', 'password' => Hash::make('password')]);

    $response = $this->withSession(['url.intended' => route('admin.users.index', $user->currentTeam)])
        ->post(route('login.store'), ['email' => 'buyer@example.com', 'password' => 'password']);

    $response->assertRedirect(route('cart.index'));
});

test('administrative roles are redirected to their administrative dashboard after login', function (SystemRole $role) {
    $user = User::factory()->create([
        'role' => $role,
        'email' => $role->value.'@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('dashboard', $user->currentTeam));
})->with([SystemRole::Admin, SystemRole::Subadmin]);

test('inactive users cannot log in', function () {
    User::factory()->create(['email' => 'inactive@example.com', 'password' => Hash::make('password'), 'is_active' => false]);

    $this->post(route('login.store'), ['email' => 'inactive@example.com', 'password' => 'password'])
        ->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('customer whatsapp request includes selected products and customer data', function () {
    $user = User::factory()->create(['role' => SystemRole::User, 'name' => 'María Pérez', 'email' => 'maria@example.com']);
    $product = Product::factory()->create(['name' => 'Laptop Pro', 'price' => 2500, 'stock' => 5, 'is_active' => true]);
    CompanySetting::query()->create(['whatsapp_number' => '51925523419', 'whatsapp_checkout_enabled' => true]);

    $response = $this->actingAs($user)->withSession(['cart' => [$product->id => 2]])->get(route('cart.whatsapp'));

    $response->assertRedirectContains('https://wa.me/51925523419');
    $location = rawurldecode((string) $response->headers->get('Location'));
    expect($location)->toContain('Laptop Pro')->toContain('Cantidad: 2')->toContain('María Pérez')->toContain('maria@example.com');
});

test('administrator seeder updates existing accounts without duplicates and hashes passwords', function () {
    User::factory()->create(['email' => 'johannr992@gmail.com', 'role' => SystemRole::User]);

    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class);

    expect(User::query()->whereIn('email', ['ayalaromerojordanbrandon@gmail.com', 'johannr992@gmail.com'])->count())->toBe(2);
    $administrator = User::query()->where('email', 'johannr992@gmail.com')->firstOrFail();
    expect($administrator->role)->toBe(SystemRole::Admin)
        ->and(Hash::check('johan123', $administrator->password))->toBeTrue();
});
