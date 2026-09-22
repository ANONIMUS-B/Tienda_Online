<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ProductCatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'brand' => ['nullable', 'string', 'max:100'],
            'available' => ['nullable', 'boolean'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'gte:min_price'],
        ]);

        $products = Product::query()->active()->with(['category:id,name,slug', 'brand:id,name,slug', 'images'])
            ->when($request->string('q')->isNotEmpty(), fn ($query) => $query->where(fn ($nested) => $nested->where('name', 'like', '%'.$request->string('q').'%')->orWhere('sku', 'like', '%'.$request->string('q').'%')))
            ->when($request->filled('category'), fn ($query) => $query->whereHas('category', fn ($category) => $category->where('slug', $request->string('category'))))
            ->when($request->filled('brand'), fn ($query) => $query->whereHas('brand', fn ($brand) => $brand->where('slug', $request->string('brand'))))
            ->when(isset($filters['min_price']), fn ($query) => $query->whereRaw('CAST(COALESCE(promotional_price, price) AS DECIMAL(12, 2)) >= CAST(? AS DECIMAL(12, 2))', [$filters['min_price']]))
            ->when(isset($filters['max_price']), fn ($query) => $query->whereRaw('CAST(COALESCE(promotional_price, price) AS DECIMAL(12, 2)) <= CAST(? AS DECIMAL(12, 2))', [$filters['max_price']]))
            ->when($request->boolean('available'), fn ($query) => $query->where('stock', '>', 0))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => Cache::remember(
                'public.products.categories',
                now()->addMinutes(5),
                fn () => Category::query()->active()->orderBy('name')->get(['name', 'slug']),
            ),
            'brands' => Cache::remember(
                'public.products.brands',
                now()->addMinutes(5),
                fn () => Brand::query()->active()->orderBy('name')->get(['name', 'slug']),
            ),
            'filters' => $filters,
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->is_active, 404);

        return Inertia::render('products/show', ['product' => $product->load(['category:id,name,slug', 'brand:id,name,slug', 'images'])]);
    }
}
