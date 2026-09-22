<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateElectronicBillingRequest;
use App\Models\CompanySetting;
use App\Models\ElectronicDocument;
use App\Models\Team;
use App\Services\Billing\ReceiptPdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Carbon;
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
            'identitySettings' => $settings->only(['identity_lookup_enabled', 'identity_lookup_provider']),
            'hasIdentityToken' => filled($settings->identity_lookup_token),
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
                    'issued_at' => $electronicDocument->issued_at ? Carbon::parse($electronicDocument->issued_at)->toIso8601String() : null,
                    'sent_at' => $electronicDocument->sent_at ? Carbon::parse($electronicDocument->sent_at)->toIso8601String() : null,
                ],
                'estado' => $electronicDocument->status,
                'estado_proveedor' => data_get($electronicDocument->response_json, 'payload.estado'),
                'payload' => $electronicDocument->payload_json,
                'provider_response' => $electronicDocument->response_json,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }, $electronicDocument->number.'.json', ['Content-Type' => 'application/json']);
    }

    public function pdf(Request $request, Team $currentTeam, ElectronicDocument $electronicDocument, ReceiptPdf $receiptPdf): StreamedResponse
    {
        $format = $request->string('format')->toString() === 'ticket' ? 'ticket' : 'a4';

        return response()->streamDownload(function () use ($electronicDocument, $receiptPdf, $format): void {
            echo $receiptPdf->render($electronicDocument, $format);
        }, $electronicDocument->number.'-'.$format.'.pdf', ['Content-Type' => 'application/pdf']);
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

        $content = $xml->asXML();
        abort_if($content === false, 500, 'No se pudo generar el XML del comprobante.');

        return response($content, 200, ['Content-Type' => 'application/xml', 'Content-Disposition' => 'attachment; filename="'.$electronicDocument->number.'.xml"']);
    }

    public function cdr(Team $currentTeam, ElectronicDocument $electronicDocument): RedirectResponse|HttpResponse
    {
        if ($electronicDocument->cdr_path && filter_var($electronicDocument->cdr_path, FILTER_VALIDATE_URL)) {
            return redirect()->away($electronicDocument->cdr_path);
        }

        return response('El proveedor todavía no ha generado la CDR para este comprobante.', 404);
    }
}
