<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSoftwareMembershipRequest;
use App\Models\SoftwareMembership;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SoftwareMembershipController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/software-memberships/index', [
            'memberships' => SoftwareMembership::query()->with('user:id,name,email')->latest()->paginate(20),
        ]);
    }

    public function update(UpdateSoftwareMembershipRequest $request, Team $currentTeam, SoftwareMembership $softwareMembership): RedirectResponse
    {
        $status = $request->string('status')->toString();
        $startsAt = $status === 'active' ? now() : null;
        $expiresAt = $status === 'active'
            ? ($softwareMembership->plan === 'annual' ? now()->addYear() : now()->addMonth())
            : null;

        $softwareMembership->update([
            'status' => $status,
            'approved_by' => $request->user()->id,
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
        ]);

        return back()->with('success', $status === 'active' ? 'Membresía activada.' : 'Solicitud rechazada.');
    }
}
