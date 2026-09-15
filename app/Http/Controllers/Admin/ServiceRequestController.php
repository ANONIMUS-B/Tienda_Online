<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmitServiceReceiptRequest;
use App\Http\Requests\UpdateServiceRequestRequest;
use App\Models\ServiceRequest;
use App\Models\Team;
use App\Services\Billing\ElectronicDocumentIssuer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServiceRequestController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/service-requests/index', [
            'requests' => ServiceRequest::query()
                ->with(['user:id,name,email,document_number,address', 'responder:id,name', 'electronicDocuments' => fn ($query) => $query->latest()])
                ->latest()
                ->paginate(20),
        ]);
    }

    public function update(UpdateServiceRequestRequest $request, Team $currentTeam, ServiceRequest $serviceRequest): RedirectResponse
    {
        $serviceRequest->update([
            ...$request->validated(),
            'responded_by' => $request->user()->id,
            'responded_at' => now(),
            'customer_read_at' => null,
        ]);

        return back()->with('success', 'Respuesta enviada al cliente.');
    }

    public function issue(EmitServiceReceiptRequest $request, Team $currentTeam, ServiceRequest $serviceRequest, ElectronicDocumentIssuer $issuer): RedirectResponse
    {
        $serviceRequest->update(['receipt_type' => $request->string('receipt_type')->toString()]);
        $document = $issuer->issueForService($serviceRequest->fresh());

        return back()->with('success', "Comprobante {$document->number} emitido para el servicio.");
    }
}
