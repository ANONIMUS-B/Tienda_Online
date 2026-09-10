<?php

namespace App\Http\Controllers;

use App\Models\HomepageSetting;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomepageController extends Controller
{
    public function __invoke(): Response
    {
        $featuredProducts = Product::query()
            ->active()
            ->where('stock', '>', 0)
            ->with(['brand:id,name,slug', 'category:id,name,slug', 'images'])
            ->orderByDesc('is_featured')
            ->orderByDesc('is_bestseller')
            ->orderByDesc('is_new')
            ->latest()
            ->take(3)
            ->get();

        return Inertia::render('welcome', [
            'hero' => HomepageSetting::content(),
            'featuredProducts' => $featuredProducts,
            'heroProduct' => $featuredProducts->first(),
        ]);
    }
}
