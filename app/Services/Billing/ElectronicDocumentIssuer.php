<?php

namespace App\Services\Billing;

use App\Models\CompanySetting;
use App\Models\DocumentSeries;
use App\Models\ElectronicDocument;
use App\Models\Order;
use App\Models\ServiceRequest;
use App\Models\SoftwareMembership;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Throwable;

class ElectronicDocumentIssuer
{
    public function issueForOrder(Order $order, ?string $requestedType = null): ElectronicDocument
    {
        return Cache::lock("billing:order:{$order->getKey()}", 45)->block(
            40,
            fn (): ElectronicDocument => $this->issueForOrderOnce($order->fresh(), $requestedType),
        );
    }

    private function issueForOrderOnce(Order $order, ?string $requestedType = null): ElectronicDocument
    {
        $existingDocument = $order->electronicDocuments()->whereIn('type', ['boleta', 'factura', 'sales_note'])->first();

        if ($existingDocument) {
            return $this->shouldRetry($existingDocument)
                ? $this->sendToApiSunat($existingDocument)
                : $existingDocument;
        }

        $order->loadMissing('items');
        $type = in_array($requestedType, ['boleta', 'factura', 'sales_note'], true) ? $requestedType : ($order->receipt_type === 'factura' ? 'factura' : 'boleta');
        $items = $order->items->map(fn ($item): array => [
            'sku' => $item->sku,
            'description' => $item->name,
            'quantity' => $item->quantity,
            'unit_price' => (float) $item->unit_price,
            'total' => (float) $item->total,
        ])->values()->all();

        if ((float) $order->shipping_total > 0) {
            $items[] = ['sku' => 'ENVIO', 'description' => 'Servicio de envío', 'quantity' => 1, 'unit_price' => (float) $order->shipping_total, 'total' => (float) $order->shipping_total];
        }

        return $this->issue(
            source: $order,
            type: $type,
            customerName: $order->customer_name,
            customerDocument: $order->document_number,
            customerEmail: $order->customer_email,
            total: (float) $order->total,
            items: $items,
        );
    }

    public function issueForService(ServiceRequest $serviceRequest): ElectronicDocument
    {
        return Cache::lock("billing:service:{$serviceRequest->getKey()}", 45)->block(
            40,
            fn (): ElectronicDocument => $this->issueForServiceOnce($serviceRequest->fresh()),
        );
    }

    private function issueForServiceOnce(ServiceRequest $serviceRequest): ElectronicDocument
    {
        $existingDocument = $serviceRequest->electronicDocuments()->whereIn('type', ['boleta', 'factura'])->first();

        if ($existingDocument) {
            return $this->shouldRetry($existingDocument)
                ? $this->sendToApiSunat($existingDocument)
                : $existingDocument;
        }

        $serviceRequest->loadMissing('user');
        $total = (float) $serviceRequest->quoted_amount;

        return $this->issue(
            source: $serviceRequest,
            type: $serviceRequest->receipt_type === 'factura' ? 'factura' : 'boleta',
            customerName: $serviceRequest->user->name,
            customerDocument: $serviceRequest->user->document_number,
            customerEmail: $serviceRequest->user->email,
            total: $total,
            items: [['sku' => $serviceRequest->number, 'description' => $serviceRequest->service_type, 'quantity' => 1, 'unit_price' => $total, 'total' => $total]],
        );
    }

    public function issueForSoftwareMembership(SoftwareMembership $softwareMembership, string $type = 'boleta'): ElectronicDocument
    {
        return Cache::lock("billing:membership:{$softwareMembership->getKey()}", 45)->block(40, function () use ($softwareMembership, $type): ElectronicDocument {
            $softwareMembership = $softwareMembership->fresh(['user']);
            $existingDocument = $softwareMembership->electronicDocuments()->whereIn('type', ['boleta', 'factura'])->first();

            if ($existingDocument) {
                return $this->shouldRetry($existingDocument) ? $this->sendToApiSunat($existingDocument) : $existingDocument;
            }

            return $this->issue(
                source: $softwareMembership,
                type: $type === 'factura' ? 'factura' : 'boleta',
                customerName: $softwareMembership->user->name,
                customerDocument: $softwareMembership->user->document_number,
                customerEmail: $softwareMembership->user->email,
                total: (float) $softwareMembership->amount,
                items: [[
                    'sku' => 'MEMBRESIA-'.strtoupper($softwareMembership->plan),
                    'description' => 'Membresía de software '.strtoupper($softwareMembership->plan),
                    'quantity' => 1,
                    'unit_price' => (float) $softwareMembership->amount,
                    'total' => (float) $softwareMembership->amount,
                ]],
            );
        });
    }

    /** @param array<int, array<string, mixed>> $items */
    private function issue(Model $source, string $type, string $customerName, ?string $customerDocument, ?string $customerEmail, float $total, array $items): ElectronicDocument
    {
        $document = DB::transaction(function () use ($source, $type, $customerName, $customerDocument, $customerEmail, $total, $items): ElectronicDocument {
            $series = DocumentSeries::query()->where('document_type', $type)->where('is_active', true)->lockForUpdate()->firstOrFail();
            $correlative = $series->next_number;
            $series->increment('next_number');
            $settings = CompanySetting::query()->firstOrNew();
            $subtotal = round($total / 1.18, 2);
            $tax = round($total - $subtotal, 2);
            $shouldSendToApi = $settings->billing_enabled && $settings->billing_mode === 'api' && $type !== 'sales_note';
            $status = $shouldSendToApi ? 'pending' : 'issued';
            $number = $series->series.'-'.str_pad((string) $correlative, 8, '0', STR_PAD_LEFT);
            $payload = $this->apiSunatPayload($type, $series->series, $correlative, $customerName, $customerDocument, $source, $total, $items);

            $document = ElectronicDocument::query()->create([
                'order_id' => $source instanceof Order ? $source->getKey() : null,
                'service_request_id' => $source instanceof ServiceRequest ? $source->getKey() : null,
                'software_membership_id' => $source instanceof SoftwareMembership ? $source->getKey() : null,
                'type' => $type, 'series' => $series->series, 'correlative' => $correlative, 'number' => $number,
                'status' => $status, 'environment' => $settings->billing_environment ?: 'demo', 'provider' => $settings->billing_provider,
                'customer_name' => $customerName, 'customer_document' => $customerDocument, 'customer_email' => $customerEmail,
                'subtotal' => $subtotal, 'tax' => $tax, 'total' => $total, 'payload_json' => $payload,
                'issued_at' => now(),
            ]);

            if ($source instanceof Order) {
                $source->update(['receipt_series' => $series->series, 'receipt_number' => (string) $correlative, 'receipt_status' => $status, 'receipt_issued_at' => now()]);
            }

            return $document;
        });

        return $this->sendToApiSunat($document);
    }

    /** @param array<int, array<string, mixed>> $items */
    private function apiSunatPayload(string $type, string $series, int $correlative, string $customerName, ?string $customerDocument, Model $source, float $total, array $items): array
    {
        $documentNumber = preg_replace('/\D/', '', (string) $customerDocument);
        $emissionDate = now('America/Lima');
        $payload = [
            'documento' => $type,
            'serie' => $series,
            'numero' => $correlative,
            'fecha_de_emision' => $emissionDate->format('Y-m-d'),
            'hora_de_emision' => $emissionDate->format('H:i:s'),
            'moneda' => 'PEN',
            'tipo_operacion' => '0101',
            'cliente_tipo_de_documento' => strlen($documentNumber) === 11 ? '6' : '1',
            'cliente_numero_de_documento' => $documentNumber,
            'cliente_denominacion' => $customerName,
            'cliente_direccion' => $source instanceof Order ? $source->address.', '.$source->district.', '.$source->province : ($source->user->address ?? ''),
            'items' => collect($items)->map(fn (array $item): array => [
                'unidad_de_medida' => 'NIU',
                'codigo_interno' => $item['sku'],
                'descripcion' => $item['description'],
                'cantidad' => (string) $item['quantity'],
                'valor_unitario' => number_format(((float) $item['unit_price']) / 1.18, 6, '.', ''),
                'porcentaje_igv' => '18',
                'codigo_tipo_afectacion_igv' => '10',
                'nombre_tributo' => 'IGV',
            ])->values()->all(),
            'total' => number_format($total, 2, '.', ''),
        ];

        if ($type === 'boleta' && $documentNumber === '') {
            unset($payload['cliente_tipo_de_documento'], $payload['cliente_numero_de_documento']);
        }

        return $payload;
    }

    private function sendToApiSunat(ElectronicDocument $document): ElectronicDocument
    {
        $settings = CompanySetting::query()->first();
        if (! $settings?->billing_enabled || $settings->billing_mode !== 'api' || $document->type === 'sales_note') {
            return $document;
        }

        $isFirstSendAttempt = $document->sent_at === null && $document->response_json === null;
        $this->upgradeLegacyPayload($document, $settings);

        if ($isFirstSendAttempt) {
            $document = $this->moveToUnusedApiSunatNumber($document, $settings);
        }

        $payload = $document->payload_json;
        $emissionDate = now('America/Lima');
        $payload['fecha_de_emision'] = $emissionDate->format('Y-m-d');
        $payload['hora_de_emision'] = $emissionDate->format('H:i:s');
        $document->update(['payload_json' => $payload]);

        try {
            $response = Http::acceptJson()
                ->asJson()
                ->withToken((string) $settings->billing_api_token)
                ->timeout(30)
                ->post(rtrim((string) $settings->billing_api_url, '/').'/api/v3/documents', $payload);
            $body = $response->json() ?: ['success' => false, 'message' => $response->body()];
            if (! $response->successful() && str_contains(mb_strtolower((string) data_get($body, 'message')), 'emitido anteriormente')) {
                return $this->reconcileWithApiSunat($document, $settings, $body, $response->status());
            }
            $providerStatus = strtoupper((string) data_get($body, 'payload.estado', ''));
            $status = match ($providerStatus) {
                'ACEPTADO' => 'accepted',
                'RECHAZADO' => 'rejected',
                default => $response->successful() ? 'pending' : 'rejected',
            };
            $document->update([
                'status' => $status,
                'response_json' => ['http_status' => $response->status(), ...$body],
                'xml_path' => data_get($body, 'payload.xml'),
                'cdr_path' => data_get($body, 'payload.cdr'),
                'sent_at' => now(),
            ]);
        } catch (Throwable $exception) {
            $document->update(['status' => 'pending', 'response_json' => ['success' => false, 'estado' => 'ERROR_CONEXION', 'message' => $exception->getMessage()], 'sent_at' => now()]);
        }

        if ($document->order) {
            $pdfUrl = data_get($document->response_json, 'payload.pdf.a4') ?: data_get($document->response_json, 'payload.pdf.ticket');
            $document->order->update(['receipt_status' => $document->status, 'receipt_url' => $pdfUrl]);
        }

        return $document->fresh();
    }

    private function moveToUnusedApiSunatNumber(ElectronicDocument $document, CompanySetting $settings): ElectronicDocument
    {
        for ($attempt = 0; $attempt < 50; $attempt++) {
            $statusResponse = Http::acceptJson()
                ->asJson()
                ->withToken((string) $settings->billing_api_token)
                ->timeout(30)
                ->post(rtrim((string) $settings->billing_api_url, '/').'/api/v3/status', [
                    'documento' => $document->type,
                    'serie' => $document->series,
                    'numero' => $document->correlative,
                ]);
            $statusBody = $statusResponse->json() ?: [];

            if (! $statusResponse->successful() || data_get($statusBody, 'success') !== true) {
                return $document;
            }

            $document = DB::transaction(function () use ($document): ElectronicDocument {
                $series = DocumentSeries::query()
                    ->where('document_type', $document->type)
                    ->where('is_active', true)
                    ->lockForUpdate()
                    ->firstOrFail();
                $correlative = $series->next_number;
                $series->increment('next_number');
                $payload = $document->payload_json;
                $payload['serie'] = $series->series;
                $payload['numero'] = $correlative;

                $document->update([
                    'series' => $series->series,
                    'correlative' => $correlative,
                    'number' => $series->series.'-'.str_pad((string) $correlative, 8, '0', STR_PAD_LEFT),
                    'payload_json' => $payload,
                ]);

                if ($document->order) {
                    $document->order->update([
                        'receipt_series' => $series->series,
                        'receipt_number' => (string) $correlative,
                    ]);
                }

                return $document->fresh();
            });
        }

        throw new \RuntimeException('No se encontró un correlativo disponible después de 50 intentos.');
    }

    /** @param array<string, mixed> $duplicateResponse */
    private function reconcileWithApiSunat(ElectronicDocument $document, CompanySetting $settings, array $duplicateResponse, int $duplicateHttpStatus): ElectronicDocument
    {
        $statusResponse = Http::acceptJson()
            ->asJson()
            ->withToken((string) $settings->billing_api_token)
            ->timeout(30)
            ->post(rtrim((string) $settings->billing_api_url, '/').'/api/v3/status', [
                'documento' => $document->type,
                'serie' => $document->series,
                'numero' => $document->correlative,
            ]);
        $statusBody = $statusResponse->json() ?: ['success' => false, 'message' => $statusResponse->body()];
        $wasFound = $statusResponse->successful() && data_get($statusBody, 'success') === true;
        $providerStatus = strtoupper((string) data_get($statusBody, 'payload.estado', $wasFound ? 'ACEPTADO' : ''));
        $status = match ($providerStatus) {
            'ACEPTADO' => 'accepted',
            'RECHAZADO' => 'rejected',
            default => $wasFound ? 'accepted' : 'rejected',
        };
        $document->update([
            'status' => $status,
            'response_json' => [
                'reconciled' => true,
                'duplicate_response' => ['http_status' => $duplicateHttpStatus, ...$duplicateResponse],
                'http_status' => $statusResponse->status(),
                ...$statusBody,
            ],
            'xml_path' => data_get($statusBody, 'payload.xml'),
            'cdr_path' => data_get($statusBody, 'payload.cdr'),
            'sent_at' => now(),
        ]);
        if ($document->order) {
            $document->order->update(['receipt_status' => $status]);
        }

        return $document->fresh();
    }

    private function shouldRetry(ElectronicDocument $document): bool
    {
        return $document->response_json === null
            || $document->status === 'rejected'
            || data_get($document->response_json, 'estado') === 'ERROR_CONEXION';
    }

    private function upgradeLegacyPayload(ElectronicDocument $document, CompanySetting $settings): void
    {
        if (array_key_exists('documento', $document->payload_json)) {
            $document->update(['provider' => 'apisunat', 'environment' => $settings->billing_environment]);

            return;
        }

        if ($document->order_id) {
            $order = $document->order()->with('items')->firstOrFail();
            $items = $order->items->map(fn ($item): array => [
                'sku' => $item->sku,
                'description' => $item->name,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total' => (float) $item->total,
            ])->values()->all();
            if ((float) $order->shipping_total > 0) {
                $items[] = ['sku' => 'ENVIO', 'description' => 'Servicio de envío', 'quantity' => 1, 'unit_price' => (float) $order->shipping_total, 'total' => (float) $order->shipping_total];
            }
            $payload = $this->apiSunatPayload($document->type, $document->series, $document->correlative, $document->customer_name, $document->customer_document, $order, (float) $document->total, $items);
        } else {
            $serviceRequest = $document->serviceRequest()->with('user')->firstOrFail();
            $payload = $this->apiSunatPayload(
                $document->type,
                $document->series,
                $document->correlative,
                $document->customer_name,
                $document->customer_document,
                $serviceRequest,
                (float) $document->total,
                [['sku' => $serviceRequest->number, 'description' => $serviceRequest->service_type, 'quantity' => 1, 'unit_price' => (float) $document->total, 'total' => (float) $document->total]],
            );
        }

        $document->update([
            'payload_json' => $payload,
            'provider' => 'apisunat',
            'environment' => $settings->billing_environment,
            'response_json' => null,
            'status' => 'pending',
        ]);
        $document->refresh();
    }
}
