<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;

class CategoryCatalogController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('public-section', [
            'section' => 'categories',
            'categories' => Category::query()
                ->active()
                ->whereNull('parent_id')
                ->with(['children' => fn ($query) => $query->active()])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'parent_id', 'name', 'slug', 'description', 'image_path']),
        ]);
    }
}
