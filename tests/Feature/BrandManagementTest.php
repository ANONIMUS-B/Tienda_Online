<?php

use App\Enums\TeamRole;
use App\Models\Brand;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('administrators can create brands', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.brands.store', $user->currentTeam), brandPayload())
        ->assertRedirect(route('admin.brands.index', $user->currentTeam));

    $this->assertDatabaseHas('brands', [
        'name' => 'Lenovo',
        'slug' => 'lenovo',
        'is_active' => true,
    ]);
});

test('brand data and external links are validated', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.brands.store', $user->currentTeam), brandPayload([
            'name' => '',
            'logo_path' => 'javascript:alert(1)',
            'website_url' => 'javascript:alert(1)',
        ]))
        ->assertSessionHasErrors(['name', 'logo_path', 'website_url']);

    $this->assertDatabaseCount('brands', 0);
});

test('regular members cannot manage brands', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->get(route('admin.brands.index', $team))
        ->assertForbidden();
});

test('administrators can update and remove brands', function () {
    $user = User::factory()->create();
    $brand = Brand::factory()->create();

    $this->actingAs($user)
        ->put(route('admin.brands.update', [$user->currentTeam, $brand]), brandPayload([
            'name' => 'HP Enterprise',
            'slug' => 'hp-enterprise',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('brands', ['id' => $brand->id, 'name' => 'HP Enterprise']);

    $this->actingAs($user)
        ->delete(route('admin.brands.destroy', [$user->currentTeam, $brand->fresh()]))
        ->assertRedirect();

    $this->assertSoftDeleted($brand);
});

test('public page only displays active brands in configured order', function () {
    Brand::factory()->create(['name' => 'Lenovo', 'sort_order' => 2]);
    Brand::factory()->create(['name' => 'HP', 'sort_order' => 1]);
    Brand::factory()->inactive()->create(['name' => 'Oculta']);

    $this->get(route('brands'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public-section')
            ->has('brands', 2)
            ->where('brands.0.name', 'HP')
            ->where('brands.1.name', 'Lenovo'),
        );
});

/** @return array<string, mixed> */
function brandPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Lenovo',
        'slug' => 'lenovo',
        'description' => 'Tecnología para personas y empresas.',
        'logo_path' => '/images/marcas/lenovo.webp',
        'website_url' => 'https://www.lenovo.com',
        'is_active' => true,
        'sort_order' => 1,
    ], $overrides);
}
