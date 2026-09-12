<?php

use Inertia\Testing\AssertableInertia as Assert;

test('public sections render on their own pages', function (string $routeName, string $section) {
    $response = $this->get(route($routeName));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('public-section')
        ->where('section', $section)
    );
})->with([
    'categories' => ['categories', 'categories'],
    'services' => ['services', 'services'],
    'apps' => ['apps', 'apps'],
    'brands' => ['brands', 'brands'],
    'about' => ['about', 'about'],
    'blog' => ['blog', 'blog'],
    'contact' => ['contact', 'contact'],
]);

test('global search renders its optimized results page', function () {
    $this->get(route('search'))->assertInertia(fn (Assert $page) => $page
        ->component('search/index')
    );
});
