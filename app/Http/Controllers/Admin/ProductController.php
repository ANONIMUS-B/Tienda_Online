<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Team;
use App\Services\ImageUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(private ImageUploader $images) {}

    public function index(): Response
    {
        return Inertia::render('admin/products/index', ['products' => Product::query()->with(['category:id,name', 'brand:id,name', 'images'])->latest()->get()]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/create', $this->options());
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $product = Product::query()->create($this->attributes($request->safe()->except(['primary_image', 'gallery'])));
            $path = $this->images->replace($request->file('primary_image'), 'products');
            $product->images()->create(['path' => $path, 'alt_text' => $product->name, 'is_primary' => true]);
            $this->storeGallery($product, $request->file('gallery', []));
        });

        return redirect()->route('admin.products.index', $request->route('current_team'));
    }

    public function edit(Team $currentTeam, Product $product): Response
    {
        return Inertia::render('admin/products/edit', [...$this->options(), 'product' => $product->load('images')]);
    }

    public function update(UpdateProductRequest $request, Team $currentTeam, Product $product): RedirectResponse
    {
        DB::transaction(function () use ($request, $product): void {
            $product->update($this->attributes($request->safe()->except(['primary_image', 'gallery'])));
            if ($request->hasFile('primary_image')) {
                $old = $product->images()->where('is_primary', true)->first();
                $path = $this->images->replace($request->file('primary_image'), 'products', $old?->path);
                $old?->delete();
                $product->images()->create(['path' => $path, 'alt_text' => $product->name, 'is_primary' => true]);
            }
            $this->storeGallery($product, $request->file('gallery', []));
        });

        return redirect()->route('admin.products.index', $request->route('current_team'));
    }

    public function destroy(Team $currentTeam, Product $product): RedirectResponse
    {
        $product->load('images')->images->each(fn ($image) => $this->images->delete($image->path));
        $product->delete();

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
        $data['slug'] = Str::slug((string) $data['slug']);
        $specifications = [];

        foreach (preg_split('/\R/', $text) ?: [] as $line) {
            [$key, $value] = array_pad(explode(':', $line, 2), 2, '');

            if (trim($key) !== '') {
                $specifications[trim($key)] = trim($value);
            }
        }

        $data['specifications'] = $specifications;

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
