<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Team;
use App\Services\ImageUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(private ImageUploader $images) {}

    public function index(): Response
    {
        return Inertia::render('admin/products/index', [
            'products' => Product::query()
                ->select(['id', 'category_id', 'brand_id', 'name', 'slug', 'sku', 'price', 'promotional_price', 'stock', 'is_active'])
                ->with([
                    'category:id,name',
                    'brand:id,name',
                    'images' => fn ($query) => $query->where('is_primary', true)->orderBy('sort_order'),
                ])
                ->latest()
                ->paginate(25),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/create', $this->options());
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $product = Product::query()->create($this->attributes($request->safe()->except(['primary_image', 'gallery'])));
            if ($product->stock > 0) {
                StockMovement::query()->create([
                    'product_id' => $product->id,
                    'user_id' => $request->user()->id,
                    'type' => 'entry',
                    'quantity' => $product->stock,
                    'stock_after' => $product->stock,
                    'reason' => 'Stock inicial del producto.',
                ]);
            }
            $path = $this->images->replace($request->file('primary_image'), 'products');
            $product->images()->create(['path' => $path, 'alt_text' => $product->name, 'is_primary' => true]);
            $this->storeGallery($product, $request->file('gallery', []));
        });
        Cache::flush();

        return redirect()->route('admin.products.index', $request->route('current_team'));
    }

    public function edit(Team $currentTeam, Product $product): Response
    {
        return Inertia::render('admin/products/edit', [...$this->options(), 'product' => $product->load('images')]);
    }

    public function update(UpdateProductRequest $request, Team $currentTeam, Product $product): RedirectResponse
    {
        DB::transaction(function () use ($request, $product): void {
            $previousStock = $product->stock;
            $product->update($this->attributes($request->safe()->except(['primary_image', 'gallery'])));
            $stockDifference = $product->stock - $previousStock;
            if ($stockDifference !== 0) {
                StockMovement::query()->create([
                    'product_id' => $product->id,
                    'user_id' => $request->user()->id,
                    'type' => $stockDifference > 0 ? 'entry' : 'adjustment',
                    'quantity' => $stockDifference,
                    'stock_after' => $product->stock,
                    'reason' => 'Ajuste desde administración.',
                ]);
            }
            if ($request->hasFile('primary_image')) {
                $old = $product->images()->where('is_primary', true)->first();
                $path = $this->images->replace($request->file('primary_image'), 'products', $old?->path);
                $old?->delete();
                $product->images()->create(['path' => $path, 'alt_text' => $product->name, 'is_primary' => true]);
            }
            $this->storeGallery($product, $request->file('gallery', []));
        });
        Cache::flush();

        return redirect()->route('admin.products.index', $request->route('current_team'));
    }

    public function destroy(Team $currentTeam, Product $product): RedirectResponse
    {
        $product->load('images')->images->each(fn ($image) => $this->images->delete($image->path));
        $product->delete();
        Cache::flush();

        return back();
    }

    /** @return array<string, mixed> */
    private function options(): array
    {
        return ['categories' => Category::query()->active()->orderBy('name')->get(['id', 'name']), 'brands' => Brand::query()->active()->orderBy('name')->get(['id', 'name'])];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data): array
    {
        $text = (string) Arr::pull($data, 'specifications_text', '');
        $benefitsText = (string) Arr::pull($data, 'benefits_text', '');
        $data['slug'] = Str::slug((string) $data['slug']);
        $specifications = [];

        foreach (preg_split('/\R/', $text) ?: [] as $line) {
            [$key, $value] = array_pad(explode(':', $line, 2), 2, '');

            if (trim($key) !== '') {
                $specifications[trim($key)] = trim($value);
            }
        }

        $data['specifications'] = $specifications;
        $data['benefits'] = collect(preg_split('/\R/', $benefitsText) ?: [])
            ->map(fn (string $benefit): string => trim($benefit))
            ->filter()
            ->values()
            ->all();

        return $data;
    }

    /** @param array<int, UploadedFile> $gallery */
    private function storeGallery(Product $product, array $gallery): void
    {
        foreach ($gallery as $index => $image) {
            $product->images()->create(['path' => $this->images->replace($image, 'products'), 'alt_text' => $product->name, 'sort_order' => $index + 1]);
        }
    }
}
