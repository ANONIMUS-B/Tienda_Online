<?php

use App\Enums\TeamRole;
use App\Models\HomepageSetting;
use App\Models\Product;
use App\Models\SoftwareProgram;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;

test('homepage renders the configured 3d hero content', function () {
    HomepageSetting::factory()->create([
        'hero_title' => 'Tecnología configurable',
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('hero.hero_title', 'Tecnología configurable')
            ->where('hero.hero_image_path', '/images/brand/jbtechline-hero-3d.png'),
        );
});

test('homepage displays available products with the highlighted products first', function () {
    $featured = Product::factory()->create(['name' => 'Laptop destacada', 'is_featured' => true, 'stock' => 3]);
    $secondFeatured = Product::factory()->create(['name' => 'PC destacada', 'is_featured' => true, 'stock' => 2]);
    Product::factory()->create(['name' => 'Producto no destacado', 'is_featured' => false, 'stock' => 4]);
    Product::factory()->create(['name' => 'Producto sin stock', 'stock' => 0]);
    Cache::forget('public.home.featured-products');

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('featuredProducts', 2)
            ->where('featuredProducts', fn ($products) => collect($products)->pluck('id')->sort()->values()->all() === collect([$featured->id, $secondFeatured->id])->sort()->values()->all())
            ->where('heroProduct.is_featured', true),
        );
});

test('homepage displays only active public programs', function () {
    $availableProgram = SoftwareProgram::factory()->create([
        'name' => 'Programa disponible',
        'is_active' => true,
        'is_own' => false,
    ]);
    SoftwareProgram::factory()->create(['is_active' => false, 'is_own' => false]);
    SoftwareProgram::factory()->create(['is_active' => true, 'is_own' => true]);
    Cache::forget('public.home.programs');

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('programs', 1)
            ->where('programs.0.id', $availableProgram->id)
            ->where('programs.0.name', 'Programa disponible'),
        );
});

test('team administrators can update the homepage hero', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $payload = HomepageSetting::defaults();
    $payload['hero_title'] = 'Innovación administrable';
    $payload['hero_image'] = UploadedFile::fake()->image('hero.jpg', 1600, 900);

    $this->actingAs($user)
        ->put(route('admin.homepage.update', $team), $payload)
        ->assertRedirect();

    $this->assertDatabaseHas('homepage_settings', [
        'hero_title' => 'Innovación administrable',
    ]);
    $setting = HomepageSetting::query()->firstOrFail();
    expect($setting->hero_image_path)->toStartWith('/media/');
    $this->assertDatabaseHas('media_files', ['id' => str($setting->hero_image_path)->after('/media/')->toString()]);
});

test('regular team members cannot administer the homepage', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->get(route('admin.homepage.edit', $team))
        ->assertForbidden();
});

test('homepage content must contain valid links', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $payload = HomepageSetting::defaults();
    $payload['hero_primary_url'] = 'javascript:alert(1)';

    $this->actingAs($user)
        ->put(route('admin.homepage.update', $team), $payload)
        ->assertSessionHasErrors('hero_primary_url');

    $this->assertDatabaseCount('homepage_settings', 0);
});
