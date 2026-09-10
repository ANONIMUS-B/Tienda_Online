<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Inertia\Inertia;
use Inertia\Response;

class BrandCatalogController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('public-section', [
            'section' => 'brands',
            'brands' => Brand::query()
                ->active()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'description', 'logo_path', 'website_url']),
        ]);
    }
}
