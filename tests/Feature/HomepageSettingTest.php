<?php

use App\Enums\TeamRole;
use App\Models\HomepageSetting;
use App\Models\Team;
use App\Models\User;
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

test('team administrators can update the homepage hero', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $payload = HomepageSetting::defaults();
    $payload['hero_title'] = 'Innovación administrable';

    $this->actingAs($user)
        ->put(route('admin.homepage.update', $team), $payload)
        ->assertRedirect();

    $this->assertDatabaseHas('homepage_settings', [
        'hero_title' => 'Innovación administrable',
    ]);
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
