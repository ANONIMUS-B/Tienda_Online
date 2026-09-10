<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Models\Brand;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/brands/index', [
            'brands' => Brand::query()->orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/brands/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBrandRequest $request): RedirectResponse
    {
        Brand::query()->create($this->normalized($request->validated()));

        return redirect()->route('admin.brands.index', $request->route('current_team'));
    }

    /**
     * Display the specified resource.
     */
    public function edit(Team $currentTeam, Brand $brand): Response
    {
        return Inertia::render('admin/brands/edit', ['brand' => $brand]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBrandRequest $request, Team $currentTeam, Brand $brand): RedirectResponse
    {
        $brand->update($this->normalized($request->validated()));

        return redirect()->route('admin.brands.index', $request->route('current_team'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $currentTeam, Brand $brand): RedirectResponse
    {
        $brand->delete();

        return back();
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
