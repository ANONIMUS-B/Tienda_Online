<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\Team;
use App\Services\ImageUploader;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(private ImageUploader $images) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/categories/index', [
            'categories' => Category::query()
                ->with('parent:id,name')
                ->withCount('children')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/categories/create', [
            'parentCategories' => $this->parentCategories(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $attributes = $this->normalized($request->safe()->except('image'));
        $attributes['image_path'] = $this->images->replace($request->file('image'), 'categories');
        Category::query()->create($attributes);

        return redirect()->route('admin.categories.index', $request->route('current_team'));
    }

    /**
     * Display the specified resource.
     */
    public function edit(Team $currentTeam, Category $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => $category,
            'parentCategories' => $this->parentCategories($category),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Team $currentTeam, Category $category): RedirectResponse
    {
        $attributes = $this->normalized($request->safe()->except('image'));
        $attributes['image_path'] = $this->images->replace($request->file('image'), 'categories', $category->image_path);
        $category->update($attributes);

        return redirect()->route('admin.categories.index', $request->route('current_team'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $currentTeam, Category $category): RedirectResponse
    {
        $this->images->delete($category->image_path);
        $category->delete();

        return back();
    }

    /** @return Collection<int, Category> */
    private function parentCategories(?Category $excludedCategory = null): Collection
    {
        return Category::query()
            ->whereNull('parent_id')
            ->when($excludedCategory, fn ($query) => $query->whereKeyNot($excludedCategory->getKey()))
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function normalized(array $attributes): array
    {
        $attributes['slug'] = Str::slug((string) $attributes['slug']);

        return $attributes;
    }
}
