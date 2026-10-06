<?php

use Inertia\Testing\AssertableInertia as Assert;

test('unmatched route returns custom 404 page', function () {
    $response = $this->get('/pagina-que-no-existe');

    $response->assertStatus(404);
    $response->assertInertia(fn (Assert $page) => $page->component('errors/404'));
});

test('model not found in route binding returns custom 404 page', function () {
    $response = $this->get('/productos/non-existent-product-id-123456');

    $response->assertStatus(404);
    $response->assertInertia(fn (Assert $page) => $page->component('errors/404'));
});

test('unmatched api route returns json 404', function () {
    $response = $this->getJson('/api/ruta-que-no-existe');

    $response->assertStatus(404);
});
