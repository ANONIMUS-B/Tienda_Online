<?php

use App\Enums\SystemRole;
use App\Models\ServiceRequest;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated customers can submit and review their service requests', function () {
    $customer = User::factory()->create(['role' => SystemRole::User]);

    $this->actingAs($customer)->post(route('service-requests.store'), [
        'service_type' => 'Diagnóstico y reparación',
        'device' => 'Laptop HP 15',
        'phone' => '999888777',
        'priority' => 'urgent',
        'description' => 'El equipo se apaga después de algunos minutos de uso.',
    ])->assertRedirect(route('service-requests.index'));

    $this->assertDatabaseHas('service_requests', [
        'user_id' => $customer->id,
        'service_type' => 'Diagnóstico y reparación',
        'priority' => 'urgent',
        'status' => 'pending',
    ]);

    $this->actingAs($customer)->get(route('service-requests.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('service-requests/index')
            ->has('requests', 1)
            ->where('requests.0.user_id', $customer->id));
});

test('customers only see their own service requests', function () {
    $customer = User::factory()->create(['role' => SystemRole::User]);
    ServiceRequest::factory()->for($customer)->create();
    ServiceRequest::factory()->create();

    $this->actingAs($customer)->get(route('service-requests.index'))
        ->assertInertia(fn (Assert $page) => $page->has('requests', 1));
});

test('administrators can answer service requests and customers receive an unread notification', function () {
    $admin = User::factory()->create(['role' => SystemRole::Admin]);
    $customer = User::factory()->create(['role' => SystemRole::User]);
    $serviceRequest = ServiceRequest::factory()->for($customer)->create();

    $this->actingAs($admin)->put(route('admin.service-requests.update', [$admin->currentTeam, $serviceRequest]), [
        'status' => 'in_review',
        'admin_response' => 'Recibimos tu solicitud. Lleva el equipo para realizar el diagnóstico.',
    ])->assertRedirect();

    $this->assertDatabaseHas('service_requests', [
        'id' => $serviceRequest->id,
        'responded_by' => $admin->id,
        'status' => 'in_review',
        'customer_read_at' => null,
    ]);

    $this->actingAs($customer)->get(route('services'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('serviceNotifications.unread', 1)
            ->where('serviceNotifications.latest.0.number', $serviceRequest->number));
});

test('guests cannot submit service requests', function () {
    $this->post(route('service-requests.store'), [])->assertRedirect(route('login'));
    $this->assertDatabaseCount('service_requests', 0);
});
