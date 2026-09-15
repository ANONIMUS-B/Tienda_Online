<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateElectronicBillingRequest;
use App\Models\CompanySetting;
use App\Models\ElectronicDocument;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ElectronicBillingController extends Controller
{
    public function edit(): Response
    {
        $settings = CompanySetting::query()->firstOrNew();

        return Inertia::render('admin/electronic-billing/edit', [
            'settings' => $settings->only(['billing_enabled', 'billing_mode', 'billing_environment', 'billing_provider', 'billing_ruc', 'billing_api_url']),
            'hasApiToken' => filled($settings->billing_api_token), 'hasCertificate' => filled($settings->billing_certificate_path),
            'documents' => ElectronicDocument::query()->with(['order:id,number', 'serviceRequest:id,number', 'softwareMembership:id,plan'])->latest()->paginate(25),
        ]);
    }

    public function update(UpdateElectronicBillingRequest $request, Team $currentTeam): RedirectResponse
    {
        $settings = CompanySetting::query()->firstOrCreate([], ['company_name' => 'JBTECHLINE']);
        $data = $request->safe()->except(['billing_certificate']);
        foreach (['billing_api_token', 'billing_certificate_password'] as $secret) {
            if (blank($data[$secret] ?? null)) {
                unset($data[$secret]);
            }
        }
        if ($request->hasFile('billing_certificate')) {
            $data['billing_certificate_path'] = $request->file('billing_certificate')->store('billing-certificates', 'local');
        }
        $settings->update($data);

        return back()->with('success', 'Configuración de facturación guardada.');
    }

    public function json(Team $currentTeam, ElectronicDocument $electronicDocument): StreamedResponse
    {
        return response()->streamDownload(function () use ($electronicDocument): void {
            echo json_encode([
                'document' => [
                    'number' => $electronicDocument->number,
                    'type' => $electronicDocument->type,
                    'status' => $electronicDocument->status,
                    'environment' => $electronicDocument->environment,
                    'provider' => $electronicDocument->provider,
                    'issued_at' => $electronicDocument->issued_at?->toIso8601String(),
                    'sent_at' => $electronicDocument->sent_at?->toIso8601String(),
                ],
                'estado' => $electronicDocument->status,
                'estado_proveedor' => data_get($electronicDocument->response_json, 'payload.estado'),
                'payload' => $electronicDocument->payload_json,
                'provider_response' => $electronicDocument->response_json,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }, $electronicDocument->number.'.json', ['Content-Type' => 'application/json']);
    }

    public function pdf(Team $currentTeam, ElectronicDocument $electronicDocument): RedirectResponse|StreamedResponse
    {
        $providerPdf = data_get($electronicDocument->response_json, 'payload.pdf.a4') ?: data_get($electronicDocument->response_json, 'payload.pdf.ticket');
        if (is_string($providerPdf) && filter_var($providerPdf, FILTER_VALIDATE_URL)) {
            return redirect()->away($providerPdf);
        }

        return response()->streamDownload(function () use ($electronicDocument): void {
            echo $this->simplePdf($electronicDocument);
        }, $electronicDocument->number.'.pdf', ['Content-Type' => 'application/pdf']);
    }

    public function html(Team $currentTeam, ElectronicDocument $electronicDocument): View
    {
        return view('admin.electronic-billing.document', ['document' => $electronicDocument]);
    }

    public function xml(Team $currentTeam, ElectronicDocument $electronicDocument): RedirectResponse|HttpResponse
    {
        if ($electronicDocument->xml_path && filter_var($electronicDocument->xml_path, FILTER_VALIDATE_URL)) {
            return redirect()->away($electronicDocument->xml_path);
        }

        $payload = $electronicDocument->payload_json;
        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><Comprobante/>');
        $xml->addChild('Numero', htmlspecialchars($electronicDocument->number));
        $xml->addChild('Estado', htmlspecialchars($electronicDocument->status));
        $xml->addChild('Cliente', htmlspecialchars((string) data_get($payload, 'cliente_denominacion')));
        $xml->addChild('Total', (string) data_get($payload, 'total'));

        return response($xml->asXML(), 200, ['Content-Type' => 'application/xml', 'Content-Disposition' => 'attachment; filename="'.$electronicDocument->number.'.xml"']);
    }

    public function cdr(Team $currentTeam, ElectronicDocument $electronicDocument): RedirectResponse|HttpResponse
    {
        if ($electronicDocument->cdr_path && filter_var($electronicDocument->cdr_path, FILTER_VALIDATE_URL)) {
            return redirect()->away($electronicDocument->cdr_path);
        }

        return response('El proveedor todavía no ha generado la CDR para este comprobante.', 404);
    }

    private function simplePdf(ElectronicDocument $document): string
    {
        $lines = ['JBTECHLINE', strtoupper(str_replace('_', ' ', $document->type)).' '.$document->number, 'Cliente: '.$document->customer_name, 'Documento: '.($document->customer_document ?: '-'), 'Subtotal: S/ '.$document->subtotal, 'IGV: S/ '.$document->tax, 'TOTAL: S/ '.$document->total, 'Estado: '.$document->status];
        $content = 'BT /F1 12 Tf 50 790 Td ';
        foreach ($lines as $index => $line) {
            $safe = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], iconv('UTF-8', 'Windows-1252//TRANSLIT', $line) ?: $line);
            $content .= ($index > 0 ? '0 -24 Td ' : '')."({$safe}) Tj ";
        }
        $content .= 'ET';
        $objects = ["1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n", "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n", "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >> endobj\n", '4 0 obj << /Length '.strlen($content)." >> stream\n{$content}\nendstream endobj\n", "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"];
        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $object) {
            $offsets[] = strlen($pdf);
            $pdf .= $object;
        }
        $xref = strlen($pdf);
        $pdf .= "xref\n0 6\n0000000000 65535 f \n";
        for ($i = 1; $i <= 5; $i++) {
            $pdf .= sprintf('%010d 00000 n ', $offsets[$i])."\n";
        }

        return $pdf."trailer << /Size 6 /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";
    }
}
