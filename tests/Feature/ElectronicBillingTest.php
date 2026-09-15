<?php

use App\Models\CompanySetting;
use App\Models\DocumentSeries;
use App\Models\ElectronicDocument;
use App\Models\Order;
use App\Models\ServiceRequest;
use App\Models\SoftwareMembership;
use App\Services\Billing\ElectronicDocumentIssuer;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;

test('it assigns consecutive boleta numbers to product orders', function () {
    CompanySetting::query()->create(['company_name' => 'JBTECHLINE', 'billing_enabled' => false]);
    $first = Order::factory()->create(['receipt_type' => 'boleta']);
    $second = Order::factory()->create(['receipt_type' => 'boleta']);
    $issuer = app(ElectronicDocumentIssuer::class);

    $firstDocument = $issuer->issueForOrder($first);
    $secondDocument = $issuer->issueForOrder($second);

    expect($firstDocument->number)->toBe('B001-00000001')
        ->and($secondDocument->number)->toBe('B001-00000002')
        ->and(DocumentSeries::where('document_type', 'boleta')->value('next_number'))->toBe(3)
        ->and($issuer->issueForOrder($first)->id)->toBe($firstDocument->id);
});

test('it issues a receipt for a paid quoted service', function () {
    Http::preventStrayRequests();
    Http::fake([
        'https://sandbox.apisunat.pe/api/v3/status' => Http::response(['success' => false, 'message' => 'No existe'], 404),
        'https://sandbox.apisunat.pe/api/v3/documents' => Http::response(['success' => true, 'message' => 'Aceptado', 'payload' => ['estado' => 'ACEPTADO', 'xml' => 'https://sandbox.apisunat.pe/document.xml', 'cdr' => 'https://sandbox.apisunat.pe/cdr.xml', 'pdf' => ['a4' => 'https://sandbox.apisunat.pe/document.pdf']]]),
    ]);
    CompanySetting::query()->create(['company_name' => 'JBTECHLINE', 'billing_enabled' => true, 'billing_mode' => 'api', 'billing_environment' => 'demo', 'billing_provider' => 'apisunat', 'billing_api_url' => 'https://sandbox.apisunat.pe', 'billing_api_token' => 'test-token']);
    $serviceRequest = ServiceRequest::factory()->create(['quoted_amount' => 118, 'payment_status' => 'paid', 'receipt_type' => 'boleta']);

    $document = app(ElectronicDocumentIssuer::class)->issueForService($serviceRequest);

    expect($document->number)->toBe('B001-00000001')
        ->and($document->status)->toBe('accepted')
        ->and((float) $document->subtotal)->toBe(100.0)
        ->and((float) $document->tax)->toBe(18.0);
    Http::assertSent(fn ($request): bool => $request->url() === 'https://sandbox.apisunat.pe/api/v3/documents'
        && $request->hasHeader('Authorization', 'Bearer test-token')
        && $request['documento'] === 'boleta');
});

test('it issues one general membership receipt without assigning prices to programs', function () {
    CompanySetting::query()->create(['company_name' => 'JBTECHLINE', 'billing_enabled' => false]);
    $membership = SoftwareMembership::factory()->create(['plan' => 'annual', 'amount' => 299, 'status' => 'active']);
    $issuer = app(ElectronicDocumentIssuer::class);

    $document = $issuer->issueForSoftwareMembership($membership, 'boleta');
    $sameDocument = $issuer->issueForSoftwareMembership($membership->fresh(), 'boleta');

    expect($document->software_membership_id)->toBe($membership->id)
        ->and($document->total)->toBe('299.00')
        ->and($document->payload_json['items'][0]['codigo_interno'])->toBe('MEMBRESIA-ANNUAL')
        ->and($sameDocument->id)->toBe($document->id);
});

test('it never sends an accepted order receipt to the provider twice', function () {
    Http::preventStrayRequests();
    Http::fake([
        'https://sandbox.apisunat.pe/api/v3/status' => Http::response(['success' => false, 'message' => 'No existe'], 404),
        'https://sandbox.apisunat.pe/api/v3/documents' => Http::response(['success' => true, 'payload' => ['estado' => 'ACEPTADO']]),
    ]);
    CompanySetting::query()->create(['company_name' => 'JBTECHLINE', 'billing_enabled' => true, 'billing_mode' => 'api', 'billing_environment' => 'demo', 'billing_provider' => 'apisunat', 'billing_api_url' => 'https://sandbox.apisunat.pe', 'billing_api_token' => 'test-token']);
    $order = Order::factory()->create(['payment_status' => 'paid', 'receipt_type' => 'boleta']);
    $issuer = app(ElectronicDocumentIssuer::class);

    $firstDocument = $issuer->issueForOrder($order);
    $secondDocument = $issuer->issueForOrder($order->fresh());

    expect($secondDocument->id)->toBe($firstDocument->id)
        ->and($secondDocument->status)->toBe('accepted');
    Http::assertSentCount(2);
});

test('it skips correlatives that already exist in the provider before sending', function () {
    Http::preventStrayRequests();
    Http::fake(function ($request) {
        if ($request->url() === 'https://sandbox.apisunat.pe/api/v3/status') {
            return Http::response($request['numero'] === 1
                ? ['success' => true, 'payload' => ['estado' => 'ACEPTADO']]
                : ['success' => false, 'message' => 'No existe'], $request['numero'] === 1 ? 200 : 404);
        }

        return Http::response(['success' => true, 'payload' => ['estado' => 'ACEPTADO']]);
    });
    CompanySetting::query()->create(['company_name' => 'JBTECHLINE', 'billing_enabled' => true, 'billing_mode' => 'api', 'billing_environment' => 'demo', 'billing_provider' => 'apisunat', 'billing_api_url' => 'https://sandbox.apisunat.pe', 'billing_api_token' => 'test-token']);
    $order = Order::factory()->create(['payment_status' => 'paid', 'receipt_type' => 'boleta']);

    $document = app(ElectronicDocumentIssuer::class)->issueForOrder($order);

    expect($document->number)->toBe('B001-00000002')
        ->and($document->status)->toBe('accepted')
        ->and($document->payload_json['numero'])->toBe(2);
    Http::assertSent(fn ($request): bool => $request->url() === 'https://sandbox.apisunat.pe/api/v3/documents'
        && $request['numero'] === 2);
});

test('it assigns an independent automatic series to sales notes', function () {
    CompanySetting::query()->create(['company_name' => 'JBTECHLINE', 'billing_enabled' => false]);
    $order = Order::factory()->create(['payment_status' => 'paid']);

    $document = app(ElectronicDocumentIssuer::class)->issueForOrder($order, 'sales_note');

    expect($document->type)->toBe('sales_note')
        ->and($document->number)->toBe('NV01-00000001')
        ->and($order->fresh()->receipt_series)->toBe('NV01');
});

test('it upgrades and retries a rejected legacy payload without changing its correlative', function () {
    $this->travelTo(Carbon::parse('2026-09-15 02:01:39', 'UTC'));
    Http::preventStrayRequests();
    Http::fake([
        'https://sandbox.apisunat.pe/api/v3/documents' => Http::response(['success' => false, 'message' => 'ERROR: La boleta B001-1 fue emitido anteriormente.'], 400),
        'https://sandbox.apisunat.pe/api/v3/status' => Http::response(['success' => true, 'message' => 'Boleta registrada.', 'payload' => ['xml' => 'https://sandbox.apisunat.pe/B001-1.xml', 'cdr' => 'https://sandbox.apisunat.pe/R-B001-1.xml']]),
    ]);
    CompanySetting::query()->create(['company_name' => 'JBTECHLINE', 'billing_enabled' => true, 'billing_mode' => 'api', 'billing_environment' => 'demo', 'billing_provider' => 'apisunat', 'billing_api_url' => 'https://sandbox.apisunat.pe', 'billing_api_token' => 'test-token']);
    $order = Order::factory()->create(['document_number' => '74815498', 'shipping_total' => 15, 'total' => 64.90]);
    $order->items()->create(['sku' => 'ESET-001', 'name' => 'ESET NOD32', 'quantity' => 1, 'unit_price' => 49.90, 'total' => 49.90]);
    ElectronicDocument::query()->create(['order_id' => $order->id, 'type' => 'boleta', 'series' => 'B001', 'correlative' => 1, 'number' => 'B001-00000001', 'status' => 'rejected', 'environment' => 'demo', 'currency' => 'PEN', 'customer_name' => 'Johan', 'customer_document' => '74815498', 'customer_email' => 'johan@example.com', 'subtotal' => 55, 'tax' => 9.90, 'total' => 64.90, 'payload_json' => ['document' => ['type' => 'boleta']], 'response_json' => ['success' => false, 'message' => 'El campo documento es requerido']]);

    $document = app(ElectronicDocumentIssuer::class)->issueForOrder($order);

    expect($document->number)->toBe('B001-00000001')
        ->and($document->status)->toBe('accepted')
        ->and($document->provider)->toBe('apisunat')
        ->and($document->response_json['reconciled'])->toBeTrue()
        ->and($document->payload_json['documento'])->toBe('boleta')
        ->and($document->payload_json['fecha_de_emision'])->toBe('2026-09-14')
        ->and($document->payload_json['items'])->toHaveCount(2);
});
