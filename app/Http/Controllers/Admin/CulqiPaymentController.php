<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentAttempt;
use App\Models\Team;
use App\Services\CulqiGateway;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CulqiPaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate(['status' => ['nullable', 'in:processing,unknown,requires_action,paid,test_paid,failed,refund_pending,refunded'], 'search' => ['nullable', 'string', 'max:100']]);

        return Inertia::render('admin/culqi/index', [
            'payments' => PaymentAttempt::query()->with('order:id,number,customer_name,payment_status')
                ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
                ->when($filters['search'] ?? null, fn ($query, $search) => $query->whereHas('order', fn ($orders) => $orders->where('number', 'like', '%'.$search.'%')))
                ->latest('id')->paginate(20)->withQueryString(),
            'filters' => $filters,
        ]);
    }

    public function update(Request $request, Team $currentTeam, PaymentAttempt $paymentAttempt, CulqiGateway $gateway): RedirectResponse
    {
        $data = $request->validate(['charge_id' => ['nullable', 'string', 'regex:/^chr_(test|live)_[a-zA-Z0-9]+$/', 'max:100']]);
        $attempt = $gateway->reconcile($paymentAttempt, $data['charge_id'] ?? null);

        if (! $attempt) {
            return back()->withErrors(['payment' => 'No se pudo verificar este cargo. Revisa su ID en CulqiPanel y que corresponda al intento; no repitas el cobro.']);
        }

        return back()->with('success', $attempt->message);
    }

    public function refund(Request $request, Team $currentTeam, PaymentAttempt $paymentAttempt, CulqiGateway $gateway): RedirectResponse
    {
        $request->validate(['confirm' => ['accepted']]);
        $attempt = $gateway->refund($paymentAttempt);

        return back()->with('success', $attempt->message);
    }
}
