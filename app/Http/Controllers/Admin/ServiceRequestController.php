<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateServiceRequestRequest;
use App\Models\ServiceRequest;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServiceRequestController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/service-requests/index', [
            'requests' => ServiceRequest::query()
                ->with(['user:id,name,email', 'responder:id,name'])
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
}
