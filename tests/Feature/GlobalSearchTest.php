<?php

use App\Models\CompanySetting;
use App\Models\Product;
use App\Models\SoftwareProgram;
use Inertia\Testing\AssertableInertia as Assert;

test('global search returns products own software and downloadable programs', function () {
    Product::factory()->create(['name' => 'Control profesional Nova']);
    SoftwareProgram::factory()->create(['name' => 'Nova ERP', 'is_own' => true]);
    SoftwareProgram::factory()->create(['name' => 'Nova Editor', 'is_own' => false]);

    $this->get(route('search', ['q' => 'Nova', 'type' => 'all']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('search/index')
            ->has('results', 3)
            ->where('filters.q', 'Nova')
            ->where('filters.type', 'all'));
});

test('global search can filter only downloadable programs', function () {
    SoftwareProgram::factory()->create(['name' => 'Herramienta Técnica', 'is_own' => true]);
    SoftwareProgram::factory()->create(['name' => 'Programa Técnico', 'is_own' => false]);

    $this->get(route('search', ['q' => 'Técnic', 'type' => 'programs']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('results', 1)
            ->where('results.0.type', 'programs'));
});

test('service page uses the configured whatsapp number', function () {
    CompanySetting::query()->create(['company_name' => 'JBTECHLINE', 'whatsapp_number' => '+51 999 888 777']);

    $this->get(route('services'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public-section')
            ->where('section', 'services')
            ->where('whatsappUrl', fn (string $url): bool => str_starts_with($url, 'https://wa.me/51999888777?text=')));
});

test('global search rejects an unknown filter', function () {
    $this->get(route('search', ['q' => 'laptop', 'type' => 'private']))
        ->assertSessionHasErrors('type');
});
