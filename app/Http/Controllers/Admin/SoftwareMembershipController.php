<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmitSoftwareMembershipReceiptRequest;
use App\Http\Requests\UpdateSoftwareMembershipRequest;
use App\Models\SoftwareMembership;
use App\Models\Team;
use App\Services\Billing\ElectronicDocumentIssuer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SoftwareMembershipController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/software-memberships/index', [
            'memberships' => SoftwareMembership::query()->with(['user:id,name,email,document_number,address', 'electronicDocuments' => fn ($query) => $query->latest()])->latest()->paginate(20),
        ]);
    }

    public function update(UpdateSoftwareMembershipRequest $request, Team $currentTeam, SoftwareMembership $softwareMembership): RedirectResponse
    {
        $status = $request->string('status')->toString();
        $startsAt = $status === 'active' ? now() : null;
        $expiresAt = match (true) {
            $status !== 'active', $softwareMembership->plan === 'permanent' => null,
            $softwareMembership->plan === 'annual' => now()->addYear(),
            default => now()->addMonth(),
        };

        $softwareMembership->update([
            'status' => $status,
            'approved_by' => $request->user()->id,
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
        ]);

        return back()->with('success', $status === 'active' ? 'Membresía activada.' : 'Solicitud rechazada.');
    }

    public function issue(EmitSoftwareMembershipReceiptRequest $request, Team $currentTeam, SoftwareMembership $softwareMembership, ElectronicDocumentIssuer $issuer): RedirectResponse
    {
        $document = $issuer->issueForSoftwareMembership($softwareMembership, $request->string('receipt_type')->toString());

        return back()->with('success', "Comprobante {$document->number} emitido para la membresía.");
    }
}
