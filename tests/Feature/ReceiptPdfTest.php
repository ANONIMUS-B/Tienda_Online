<?php

use App\Models\CompanySetting;
use App\Models\ElectronicDocument;
use App\Models\Order;
use App\Models\User;
use App\Services\Billing\ReceiptPdf;
use Illuminate\Support\Facades\URL;

function receiptDocument(?User $user = null): ElectronicDocument
{
    CompanySetting::query()->create([
        'company_name' => 'JBTECHLINE',
        'billing_ruc' => '10748154987',
        'address' => 'Lima, Perú',
        'email' => 'ventas@example.com',
    ]);
    $order = Order::factory()->create([
        'user_id' => $user?->id,
        'receipt_status' => 'accepted',
        'receipt_type' => 'boleta',
    ]);

    return ElectronicDocument::query()->create([
        'order_id' => $order->id,
        'type' => 'boleta',
        'series' => 'B001',
        'correlative' => 12,
        'number' => 'B001-00000012',
        'status' => 'accepted',
        'environment' => 'demo',
        'customer_name' => 'Cliente de prueba',
        'customer_document' => '12345678',
        'customer_email' => 'cliente@example.com',
        'subtotal' => 100,
        'tax' => 18,
        'total' => 118,
        'payload_json' => ['items' => [[
            'codigo_interno' => 'SERV-01',
            'descripcion' => 'Servicio técnico profesional',
            'cantidad' => '1',
            'valor_unitario' => '100.00',
        ]], 'total' => '118.00'],
        'issued_at' => now(),
    ]);
}

test('professional receipts render as valid a4 and ticket pdf files', function () {
    $document = receiptDocument();
    $renderer = app(ReceiptPdf::class);

    expect($renderer->render($document, 'a4'))->toStartWith('%PDF-')
        ->and($renderer->render($document, 'ticket'))->toStartWith('%PDF-');
});

test('a customer can download both signed receipt formats', function (string $format) {
    $user = User::factory()->create();
    $document = receiptDocument($user);
    $url = URL::signedRoute('orders.receipt', [
        'number' => $document->order->number,
        'format' => $format,
    ]);

    $this->get($url)
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
})->with(['a4', 'ticket']);

test('a receipt cannot be downloaded by another customer without a valid signature', function () {
    $document = receiptDocument(User::factory()->create());

    $this->actingAs(User::factory()->create())
        ->get(route('orders.receipt', [$document->order->number, 'a4']))
        ->assertForbidden();
});
