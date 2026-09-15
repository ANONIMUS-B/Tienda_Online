<?php

use App\Enums\SystemRole;
use App\Models\ElectronicDocument;
use App\Models\Order;
use App\Models\User;
use App\Notifications\ReceiptIssuedNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;

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

test('sharing an accepted receipt never calls the sunat provider', function () {
    Http::preventStrayRequests();
    Notification::fake();
    $admin = User::factory()->create(['role' => SystemRole::Admin]);
    $customer = User::factory()->create(['role' => SystemRole::User]);
    $order = Order::factory()->for($customer)->create(['payment_status' => 'paid', 'receipt_type' => 'boleta']);
    ElectronicDocument::query()->create([
        'order_id' => $order->id, 'type' => 'boleta', 'series' => 'B001', 'correlative' => 20,
        'number' => 'B001-00000020', 'status' => 'accepted', 'environment' => 'demo',
        'customer_name' => $order->customer_name, 'customer_document' => $order->document_number,
        'customer_email' => $order->customer_email, 'subtotal' => 55, 'tax' => 9.90,
        'total' => 64.90, 'payload_json' => ['documento' => 'boleta'],
    ]);

    $this->actingAs($admin)->post(route('admin.orders.share', [$admin->currentTeam, $order]), [
        'receipt_type' => 'boleta',
        'send_email' => true,
    ])->assertRedirect()->assertSessionHas('success');

    Http::assertNothingSent();
    Notification::assertSentTo($customer, ReceiptIssuedNotification::class);
});
