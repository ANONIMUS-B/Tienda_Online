<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use App\Models\SoftwareProgram;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgramCatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $base = SoftwareProgram::query()->where('is_active', true)->where('is_own', false);
        $programs = (clone $base)->with('image:id')->when($request->filled('q'), fn ($q) => $q->where(fn ($x) => $x->where('name', 'like', '%'.$request->string('q').'%')->orWhere('short_description', 'like', '%'.$request->string('q').'%')))->when($request->filled('category'), fn ($q) => $q->where('category', $request->string('category')))->when($request->filled('platform'), fn ($q) => $q->where('platform', $request->string('platform')))->latest()->paginate(12)->withQueryString();
        $programs->through(fn (SoftwareProgram $program) => $this->item($program));

        $catalog = [
            'programs' => $programs->toArray(),
            'categories' => (clone $base)->distinct()->orderBy('category')->pluck('category')->all(),
            'platforms' => (clone $base)->whereNotNull('platform')->distinct()->orderBy('platform')->pluck('platform')->all(),
        ];

        return Inertia::render('software/index', ['catalogType' => 'programs', ...$catalog, 'filters' => $request->only(['q', 'category', 'platform']), 'membership' => $this->membership($request)]);
    }

    public function show(SoftwareProgram $softwareProgram): Response
    {
        abort_unless($softwareProgram->is_active && ! $softwareProgram->is_own, 404);

        return Inertia::render('software/show', ['catalogType' => 'programs', 'program' => $this->item($softwareProgram)]);
    }

    /** @return array<string,mixed> */
    private function item(SoftwareProgram $program): array
    {
        $user = request()->user();
        $hasMembership = $user?->hasActiveSoftwareMembership() ?? false;

        return [...$program->toArray(), 'image_url' => $program->image_id ? route('media.show', $program->image_id, false) : null, 'can_download' => ($program->download_url || $program->file_id) && (($program->license_type === 'free' && $program->download_enabled) || $hasMembership)];
    }

    /** @return array<string, mixed> */
    private function membership(Request $request): array
    {
        $settings = CompanySetting::query()->first();

        return [
            'enabled' => (bool) ($settings?->software_membership_enabled ?? true),
            'price' => (float) ($settings?->software_membership_price ?? 29.90),
            'period' => $settings?->software_membership_period ?? 'monthly',
            'yape_enabled' => (bool) ($settings?->payment_yape_enabled ?? true),
            'transfer_enabled' => (bool) ($settings?->payment_transfer_enabled ?? true),
            'yape_number' => $settings?->yape_number,
            'bank_name' => $settings?->bank_name,
            'bank_account' => $settings?->bank_account,
            'active' => $request->user()?->hasActiveSoftwareMembership() ?? false,
        ];
    }
}
