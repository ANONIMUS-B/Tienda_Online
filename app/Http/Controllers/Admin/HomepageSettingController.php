<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateHomepageSettingRequest;
use App\Models\HomepageSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class HomepageSettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/homepage/edit', [
            'hero' => HomepageSetting::content(),
        ]);
    }

    public function update(UpdateHomepageSettingRequest $request): RedirectResponse
    {
        HomepageSetting::query()->updateOrCreate([], $request->validated());

        return back()->with('success', 'La portada se actualizó correctamente.');
    }
}
