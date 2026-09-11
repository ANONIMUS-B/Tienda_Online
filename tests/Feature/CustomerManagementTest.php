<?php

use App\Enums\TeamRole;
use App\Models\Order;
use App\Models\Team;
use App\Models\User;

test('administrators can search customers and inspect their order history', function () {
    $admin = User::factory()->create();
    $customer = User::factory()->create(['name' => 'Cliente Tecnológico', 'email' => 'cliente@example.com']);
    Order::factory()->for($customer)->create(['total' => 450]);

    $this->actingAs($admin)->get(route('admin.customers.index', [$admin->currentTeam, 'q' => 'cliente@example.com']))->assertInertia(fn ($page) => $page->component('admin/customers/index')->has('customers.data', 1)->where('customers.data.0.email', 'cliente@example.com')->where('customers.data.0.orders_count', 1));
    $this->actingAs($admin)->get(route('admin.customers.show', [$admin->currentTeam, $customer]))->assertInertia(fn ($page) => $page->component('admin/customers/show')->has('orders', 1));
});

test('regular members cannot access customer administration', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)->get(route('admin.customers.index', $team))->assertForbidden();
});
