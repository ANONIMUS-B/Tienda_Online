<?php

use Inertia\Testing\AssertableInertia as Assert;

test('public sections render on their own pages', function (string $routeName, string $section) {
    $response = $this->get(route($routeName));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('public-section')
        ->where('section', $section)
    );
})->with([
    'products' => ['products', 'products'],
    'categories' => ['categories', 'categories'],
    'services' => ['services', 'services'],
    'software' => ['software', 'software'],
    'apps' => ['apps', 'apps'],
    'brands' => ['brands', 'brands'],
    'about' => ['about', 'about'],
    'blog' => ['blog', 'blog'],
    'contact' => ['contact', 'contact'],
    'search' => ['search', 'search'],
    'cart' => ['cart', 'cart'],
]);
