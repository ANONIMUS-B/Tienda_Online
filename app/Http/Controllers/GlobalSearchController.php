<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\SoftwareProgram;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GlobalSearchController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', Rule::in(['all', 'products', 'software', 'programs', 'services'])],
        ]);
        $query = trim((string) ($validated['q'] ?? ''));
        $type = (string) ($validated['type'] ?? 'all');
        $limit = $type === 'all' ? 6 : 24;

        return Inertia::render('search/index', [
            'results' => $query === '' ? [] : [
                ...$this->products($query, $type, $limit),
                ...$this->programs($query, $type, $limit),
                ...$this->services($query, $type),
            ],
            'filters' => ['q' => $query, 'type' => $type],
        ]);
    }

    /** @return array<int, array<string, mixed>> */
    private function products(string $query, string $type, int $limit): array
    {
        if (! in_array($type, ['all', 'products'], true)) {
            return [];
        }

        return Product::query()->active()->with('images')->where(fn ($builder) => $builder
            ->where('name', 'like', "%{$query}%")
            ->orWhere('sku', 'like', "%{$query}%")
            ->orWhere('short_description', 'like', "%{$query}%"))
            ->limit($limit)->get()->map(fn (Product $product) => [
                'id' => 'product-'.$product->id,
                'type' => 'products',
                'type_label' => 'Producto',
                'title' => $product->name,
                'description' => $product->short_description,
                'meta' => 'S/ '.number_format((float) ($product->promotional_price ?? $product->price), 2),
                'image' => $product->images->first()?->path,
                'url' => route('products.show', $product, false),
            ])->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function programs(string $query, string $type, int $limit): array
    {
        if (! in_array($type, ['all', 'software', 'programs'], true)) {
            return [];
        }

        return SoftwareProgram::query()->where('is_active', true)
            ->when($type === 'software', fn ($builder) => $builder->where('is_own', true))
            ->when($type === 'programs', fn ($builder) => $builder->where('is_own', false))
            ->where(fn ($builder) => $builder->where('name', 'like', "%{$query}%")
                ->orWhere('category', 'like', "%{$query}%")
                ->orWhere('short_description', 'like', "%{$query}%"))
            ->limit($limit)->get()->map(fn (SoftwareProgram $program) => [
                'id' => 'program-'.$program->id,
                'type' => $program->is_own ? 'software' : 'programs',
                'type_label' => $program->is_own ? 'Software propio' : 'Programa',
                'title' => $program->name,
                'description' => $program->short_description,
                'meta' => $program->category.($program->platform ? ' · '.$program->platform : ''),
                'image' => $program->image_id ? route('media.show', $program->image_id, false) : null,
                'url' => $program->is_own ? route('software.show', $program, false) : route('programs.show', $program, false),
            ])->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function services(string $query, string $type): array
    {
        if (! in_array($type, ['all', 'services'], true)) {
            return [];
        }

        return collect([
            ['title' => 'Mantenimiento preventivo', 'description' => 'Limpieza interna, cambio de pasta térmica, optimización y revisión integral.'],
            ['title' => 'Diagnóstico y reparación', 'description' => 'Solución de fallas de encendido, lentitud, temperatura, pantalla, batería y sistema operativo.'],
            ['title' => 'Actualización de equipos', 'description' => 'Instalación de SSD, memoria RAM y componentes para mejorar el rendimiento.'],
            ['title' => 'Instalación de programas', 'description' => 'Configuración segura de aplicaciones, controladores y herramientas de trabajo.'],
            ['title' => 'Soporte para empresas', 'description' => 'Mantenimiento periódico, redes, respaldo y asistencia para oficinas.'],
        ])->filter(fn (array $service) => Str::contains(Str::lower($service['title'].' '.$service['description']), Str::lower($query)))
            ->map(fn (array $service, int $index) => [
                'id' => 'service-'.$index,
                'type' => 'services',
                'type_label' => 'Servicio técnico',
                'title' => $service['title'],
                'description' => $service['description'],
                'meta' => 'Evaluación y atención personalizada',
                'image' => null,
                'url' => route('services', absolute: false),
            ])->values()->all();
    }
}
