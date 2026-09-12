<?php

namespace App\Http\Controllers;

use App\Models\HomepageSetting;
use App\Models\Product;
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
            ->with(['brand:id,name,slug', 'category:id,name,slug', 'images'])
            ->orderByDesc('is_featured')
            ->orderByDesc('is_bestseller')
            ->orderByDesc('is_new')
            ->latest()
            ->take(3)
            ->get()
            ->toArray());

        return Inertia::render('welcome', [
            'hero' => HomepageSetting::content(),
            'featuredProducts' => $featuredProducts,
            'heroProduct' => $featuredProducts[0] ?? null,
        ]);
    }
}
