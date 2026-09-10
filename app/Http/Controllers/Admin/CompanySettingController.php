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
        return Inertia::render('admin/company-settings/edit', [
            'settings' => CompanySetting::query()->firstOrNew(['company_name' => 'JBTECHLINE']),
        ]);
    }

    public function update(UpdateCompanySettingRequest $request, Team $currentTeam): RedirectResponse
    {
        CompanySetting::query()->updateOrCreate([], $request->validated());

        return back()->with('success', 'Datos de empresa actualizados.');
    }
}
