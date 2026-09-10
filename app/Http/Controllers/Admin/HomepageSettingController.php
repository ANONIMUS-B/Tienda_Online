<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateHomepageSettingRequest;
use App\Models\HomepageSetting;
use App\Services\ImageUploader;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class HomepageSettingController extends Controller
{
    public function __construct(private ImageUploader $images) {}

    public function edit(): Response
    {
        return Inertia::render('admin/homepage/edit', [
            'hero' => HomepageSetting::content(),
        ]);
    }

    public function update(UpdateHomepageSettingRequest $request): RedirectResponse
    {
        $setting = HomepageSetting::query()->firstOrNew([], HomepageSetting::defaults());
        $attributes = $request->safe()->except('hero_image');
        $attributes['hero_image_path'] = $this->images->replace(
            $request->file('hero_image'),
            'homepage',
            $setting->hero_image_path,
        );
        HomepageSetting::query()->updateOrCreate([], $attributes);

        return back()->with('success', 'La portada se actualizó correctamente.');
    }
}
