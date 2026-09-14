<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceRequestRequest;
use App\Models\ServiceRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ServiceRequestController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();

        ServiceRequest::query()
            ->where('user_id', $user->id)
            ->whereNotNull('responded_at')
            ->whereNull('customer_read_at')
            ->update(['customer_read_at' => now()]);

        return Inertia::render('service-requests/index', [
            'requests' => ServiceRequest::query()
                ->where('user_id', $user->id)
                ->latest()
                ->get(),
        ]);
    }

    public function store(StoreServiceRequestRequest $request): RedirectResponse
    {
        $request->user()->serviceRequests()->create([
            ...$request->validated(),
            'number' => 'SR-'.now()->format('ymd').'-'.Str::upper(Str::random(6)),
        ]);

        return to_route('service-requests.index')->with('success', 'Solicitud registrada. Te avisaremos cuando el administrador responda.');
    }
}
