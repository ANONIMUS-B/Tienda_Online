<?php

use App\Enums\SystemRole;
use App\Models\Order;
use App\Models\User;

test('administrators record an issued customer receipt', function () {
    $admin = User::factory()->create(['role' => SystemRole::Admin]);
    $order = Order::factory()->create();

    $this->actingAs($admin)->put(route('admin.orders.update', [$admin->currentTeam, $order]), [
        'status' => 'confirmed',
        'payment_status' => 'paid',
        'receipt_type' => 'boleta',
        'receipt_status' => 'issued',
        'receipt_series' => 'B001',
        'receipt_number' => '123',
        'receipt_url' => 'https://example.com/comprobantes/B001-123.pdf',
    ])->assertRedirect();

    $order->refresh();
    expect($order->receipt_status)->toBe('issued')
        ->and($order->receipt_series)->toBe('B001')
        ->and($order->receipt_issued_at)->not->toBeNull();
});
