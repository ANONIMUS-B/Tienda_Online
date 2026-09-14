<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSoftwareMembershipRequest;
use App\Models\CompanySetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class SoftwareMembershipController extends Controller
{
    public function store(StoreSoftwareMembershipRequest $request): RedirectResponse
    {
        $settings = CompanySetting::query()->first();
        throw_if(! $settings?->software_membership_enabled, ValidationException::withMessages(['plan' => 'Las membresías no están disponibles.']));

        $paymentMethod = $request->string('payment_method')->toString();
        $paymentEnabled = ($paymentMethod === 'yape' && $settings->payment_yape_enabled)
            || ($paymentMethod === 'bank_transfer' && $settings->payment_transfer_enabled);
        throw_unless($paymentEnabled, ValidationException::withMessages(['payment_method' => 'Este método de pago no está disponible.']));
        throw_if(
            $request->user()->softwareMemberships()->whereIn('status', ['pending', 'active'])->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))->exists(),
            ValidationException::withMessages(['plan' => 'Ya tienes una membresía activa o pendiente de revisión.']),
        );

        $plan = $request->string('plan')->toString();
        $amount = $plan === 'annual' ? $settings->software_annual_price : $settings->software_monthly_price;

        $request->user()->softwareMemberships()->create([
            ...$request->validated(),
            'amount' => $amount,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Pago registrado. El administrador verificará la membresía.');
    }
}
