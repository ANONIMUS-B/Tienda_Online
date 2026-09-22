<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCompanySettingRequest;
use App\Models\CompanySetting;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CompanySettingController extends Controller
{
    public function edit(): Response
    {
        $settings = CompanySetting::query()->firstOrNew(['company_name' => 'JBTECHLINE']);

        return Inertia::render('admin/company-settings/edit', [
            'settings' => $settings,
            'hasSecretKey' => filled($settings->gateway_secret_key),
            'hasIzipayCredentials' => filled($settings->izipay_api_username) && filled($settings->izipay_api_password) && filled($settings->izipay_hash_key),
            'culqiWebhookUrl' => route('culqi.webhook'),
        ]);
    }

    public function update(UpdateCompanySettingRequest $request, Team $currentTeam): RedirectResponse
    {
        $attributes = $request->validated();
        if (blank($attributes['gateway_public_key'] ?? null)) {
            unset($attributes['gateway_public_key']);
        }
        if (blank($attributes['gateway_secret_key'] ?? null)) {
            unset($attributes['gateway_secret_key']);
        }
        foreach (['izipay_api_username', 'izipay_api_password', 'izipay_hash_key'] as $secret) {
            if (blank($attributes[$secret] ?? null)) {
                unset($attributes[$secret]);
            }
        }
        CompanySetting::query()->updateOrCreate([], $attributes);

        return back()->with('success', 'Datos de empresa actualizados.');
    }
}
