<?php

test('registration route always renders the HTML registration page', function () {
    $this->get('/register')->assertOk()->assertHeader('Content-Type', 'text/html; charset=utf-8')->assertInertia(fn ($page) => $page->component('auth/register'));
});
