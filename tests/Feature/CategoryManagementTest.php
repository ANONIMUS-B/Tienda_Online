<?php

use App\Enums\TeamRole;
use App\Models\Category;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('administrators can create principal categories', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $image = UploadedFile::fake()->image('laptops.webp');

    $this->actingAs($user)
        ->post(route('admin.categories.store', $user->currentTeam), categoryPayload(['image' => $image]))
        ->assertRedirect(route('admin.categories.index', $user->currentTeam));

    $this->assertDatabaseHas('categories', [
        'name' => 'Laptops y computadoras',
        'slug' => 'laptops-y-computadoras',
        'is_active' => true,
    ]);
    $category = Category::query()->where('slug', 'laptops-y-computadoras')->firstOrFail();
    expect($category->image_path)->toStartWith('/storage/categories/');
    Storage::disk('public')->assertExists(substr($category->image_path, strlen('/storage/')));
});

test('administrators can create subcategories below principal categories', function () {
    $user = User::factory()->create();
    $parent = Category::factory()->create(['name' => 'Cómputo']);

    $this->actingAs($user)
        ->post(route('admin.categories.store', $user->currentTeam), categoryPayload([
            'parent_id' => $parent->id,
            'name' => 'Laptops',
            'slug' => 'laptops',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('categories', ['name' => 'Laptops', 'parent_id' => $parent->id]);
});

test('category data is validated', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.categories.store', $user->currentTeam), categoryPayload([
            'name' => '',
            'image' => UploadedFile::fake()->create('invalid.svg', 10, 'image/svg+xml'),
        ]))
        ->assertSessionHasErrors(['name', 'image']);

    $this->assertDatabaseCount('categories', 0);
});

test('regular members cannot manage categories', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->get(route('admin.categories.index', $team))
        ->assertForbidden();
});

test('administrators can update and remove categories', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();

    $this->actingAs($user)
        ->put(route('admin.categories.update', [$user->currentTeam, $category]), categoryPayload([
            'name' => 'Equipos actualizados',
            'slug' => 'equipos-actualizados',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'Equipos actualizados']);

    $this->actingAs($user)
        ->delete(route('admin.categories.destroy', [$user->currentTeam, $category->fresh()]))
        ->assertRedirect();

    $this->assertSoftDeleted($category);
});

test('public catalog only displays active categories and active children', function () {
    $visible = Category::factory()->create(['name' => 'Cómputo', 'sort_order' => 1]);
    Category::factory()->for($visible, 'parent')->create(['name' => 'Laptops']);
    Category::factory()->for($visible, 'parent')->inactive()->create(['name' => 'Oculta']);
    Category::factory()->inactive()->create(['name' => 'No publicada']);

    $this->get(route('categories'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public-section')
            ->has('categories', 1)
            ->where('categories.0.name', 'Cómputo')
            ->has('categories.0.children', 1)
            ->where('categories.0.children.0.name', 'Laptops'),
        );
});

/** @return array<string, mixed> */
function categoryPayload(array $overrides = []): array
{
    return array_merge([
        'parent_id' => null,
        'name' => 'Laptops y computadoras',
        'slug' => 'laptops-y-computadoras',
        'description' => 'Equipos para trabajo y estudio.',
        'is_active' => true,
        'sort_order' => 1,
    ], $overrides);
}
