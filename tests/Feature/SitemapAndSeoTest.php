<?php

use App\Models\Product;
use App\Models\SoftwareProgram;

test('sitemap xml endpoint returns valid xml with public routes', function () {
    $product = Product::factory()->create(['is_active' => true, 'slug' => 'test-product-seo']);
    $program = SoftwareProgram::factory()->create(['is_active' => true, 'slug' => 'test-program-seo']);

    $response = $this->get('/sitemap.xml');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/xml; charset=utf-8');
    $response->assertSee(route('home'), false);
    $response->assertSee(route('software'), false);
    $response->assertSee(route('products'), false);
    $response->assertSee('test-product-seo');
    $response->assertSee('test-program-seo');
});

test('homepage includes seo meta tags and structured schema', function () {
    $response = $this->get('/');

    $response->assertOk();
    $response->assertSee('JBTECHLINE', false);
    $response->assertSee('name="description"', false);
    $response->assertSee('property="og:title"', false);
    $response->assertSee('application/ld+json', false);
});

