<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class BrandCatalogController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('public-section', [
            'section' => 'brands',
            'brands' => Cache::remember('public.brands', now()->addMinute(), fn () => Brand::query()
                ->active()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'description', 'logo_path', 'website_url'])
                ->toArray()),
        ]);
    }
}
