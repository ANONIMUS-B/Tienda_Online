<?php

namespace App\Http\Controllers;

use App\Models\SoftwareProgram;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class SoftwareCatalogController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->catalog($request);
    }

    public function show(SoftwareProgram $softwareProgram): Response
    {
        abort_unless($softwareProgram->is_active && $softwareProgram->is_own, 404);

        return Inertia::render('software/show', ['catalogType' => 'software', 'program' => $this->item($softwareProgram)]);
    }

    private function catalog(Request $request): Response
    {
        $catalog = Cache::remember('public.software.safe.'.sha1($request->getQueryString() ?? 'index'), now()->addMinutes(5), function () use ($request): array {
            $base = SoftwareProgram::query()->where('is_active', true)->where('is_own', true);
            $programs = (clone $base)->with('image:id')->when($request->filled('q'), fn ($q) => $q->where(fn ($x) => $x->where('name', 'like', '%'.$request->string('q').'%')->orWhere('short_description', 'like', '%'.$request->string('q').'%')))->when($request->filled('category'), fn ($q) => $q->where('category', $request->string('category')))->when($request->filled('platform'), fn ($q) => $q->where('platform', $request->string('platform')))->latest()->paginate(12)->withQueryString();
            $programs->through(fn (SoftwareProgram $p) => $this->item($p));

            return ['programs' => $programs->toArray(), 'categories' => (clone $base)->distinct()->orderBy('category')->pluck('category')->all(), 'platforms' => (clone $base)->whereNotNull('platform')->distinct()->orderBy('platform')->pluck('platform')->all()];
        });

        return Inertia::render('software/index', ['catalogType' => 'software', ...$catalog, 'filters' => $request->only(['q', 'category', 'platform'])]);
    }

    /** @return array<string,mixed> */
    private function item(SoftwareProgram $program): array
    {
        return [...$program->toArray(), 'image_url' => $program->image_id ? route('media.show', $program->image_id, false) : null];
    }
}
