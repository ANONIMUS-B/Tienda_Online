<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductCatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()->active()->with(['category:id,name,slug', 'brand:id,name,slug', 'images'])
            ->when($request->string('q')->isNotEmpty(), fn ($query) => $query->where(fn ($nested) => $nested->where('name', 'like', '%'.$request->string('q').'%')->orWhere('sku', 'like', '%'.$request->string('q').'%')))
            ->when($request->filled('category'), fn ($query) => $query->whereHas('category', fn ($category) => $category->where('slug', $request->string('category'))))
            ->when($request->filled('brand'), fn ($query) => $query->whereHas('brand', fn ($brand) => $brand->where('slug', $request->string('brand'))))
            ->when($request->boolean('available'), fn ($query) => $query->where('stock', '>', 0))->latest()->paginate(12)->withQueryString();

        return Inertia::render('products/index', ['products' => $products, 'categories' => Category::query()->active()->orderBy('name')->get(['name', 'slug']), 'brands' => Brand::query()->active()->orderBy('name')->get(['name', 'slug']), 'filters' => $request->only(['q', 'category', 'brand', 'available'])]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->is_active, 404);

        return Inertia::render('products/show', ['product' => $product->load(['category:id,name,slug', 'brand:id,name,slug', 'images'])]);
    }
}
