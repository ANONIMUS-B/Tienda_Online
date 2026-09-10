<?php

use Inertia\Testing\AssertableInertia as Assert;

test('the public home page is available', function () {
    $response = $this->get(route('home'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
        );
});
