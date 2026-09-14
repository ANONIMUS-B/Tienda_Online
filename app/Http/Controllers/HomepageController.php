<?php

namespace App\Http\Controllers;

use App\Models\HomepageSetting;
use App\Models\Product;
use App\Models\SoftwareProgram;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomepageController extends Controller
{
    public function __invoke(): Response
    {
        $featuredProducts = Cache::remember('public.home.featured-products', now()->addSeconds(30), fn (): array => Product::query()
            ->active()
            ->where('stock', '>', 0)
            ->where('is_featured', true)
            ->with(['brand:id,name,slug', 'category:id,name,slug', 'images'])
            ->orderByDesc('is_bestseller')
            ->orderByDesc('is_new')
            ->latest()
            ->get()
            ->toArray());

        $programs = Cache::remember('public.home.programs', now()->addSeconds(30), fn (): array => SoftwareProgram::query()
            ->where('is_active', true)
            ->where('is_own', false)
            ->with('image:id')
            ->latest()
            ->take(4)
            ->get()
            ->map(fn (SoftwareProgram $program): array => [
                ...$program->toArray(),
                'image_url' => $program->image_id ? route('media.show', $program->image_id, false) : null,
            ])
            ->all());

        return Inertia::render('welcome', [
            'hero' => HomepageSetting::content(),
            'featuredProducts' => $featuredProducts,
            'heroProduct' => $featuredProducts[0] ?? null,
            'programs' => $programs,
        ]);
    }
}
