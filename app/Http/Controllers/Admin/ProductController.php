<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\StockMovement;
use App\Models\Team;
use App\Services\ImageUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

class ProductController extends Controller
{
    public function __construct(private ImageUploader $images) {}

    public function index(Request $request): Response
    {
        $q = $request->string('q')->trim()->toString();

        return Inertia::render('admin/products/index', [
            'products' => Product::query()
                ->select(['id', 'category_id', 'brand_id', 'name', 'slug', 'sku', 'price', 'promotional_price', 'stock', 'is_active'])
                ->with([
                    'category:id,name',
                    'brand:id,name',
                    'images' => fn ($query) => $query->where('is_primary', true)->orderBy('sort_order'),
                ])
                ->when($q !== '', function ($query) use ($q): void {
                    $query->where(function ($sub) use ($q): void {
                        $sub->where('name', 'like', "%{$q}%")
                            ->orWhere('sku', 'like', "%{$q}%")
                            ->orWhereHas('category', fn ($c) => $c->where('name', 'like', "%{$q}%"))
                            ->orWhereHas('brand', fn ($b) => $b->where('name', 'like', "%{$q}%"));
                    });
                })
                ->latest()
                ->paginate(25)
                ->withQueryString(),
            'filters' => [
                'q' => $q,
            ],
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
            $product->update($this->attributes($request->safe()->except(['primary_image', 'gallery']), $product));
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

    public function destroyImage(Team $currentTeam, Product $product, ProductImage $image): RedirectResponse
    {
        if ($image->product_id === $product->id) {
            $isPrimary = $image->is_primary;
            $this->images->delete($image->path);
            $image->delete();

            if ($isPrimary) {
                $product->images()->first()?->update(['is_primary' => true]);
            }

            Cache::flush();
        }

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
    private function attributes(array $data, ?Product $product = null): array
    {
        $text = (string) Arr::pull($data, 'specifications_text', '');
        $benefitsText = (string) Arr::pull($data, 'benefits_text', '');

        $name = (string) ($data['name'] ?? '');
        if (empty($data['slug'])) {
            $data['slug'] = Product::generateUniqueSlug($name, $product?->id);
        } else {
            $data['slug'] = Str::slug((string) $data['slug']);
        }

        if (empty($data['sku'])) {
            $data['sku'] = Product::generateUniqueSku(
                $name,
                isset($data['brand_id']) && $data['brand_id'] ? (int) $data['brand_id'] : null,
                isset($data['category_id']) && $data['category_id'] ? (int) $data['category_id'] : null,
                $product?->id
            );
        } else {
            $data['sku'] = strtoupper((string) $data['sku']);
        }

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
        $maxSort = (int) $product->images()->max('sort_order');
        foreach ($gallery as $index => $image) {
            $product->images()->create([
                'path' => $this->images->replace($image, 'products'),
                'alt_text' => $product->name,
                'sort_order' => $maxSort + $index + 1,
                'is_primary' => false,
            ]);
        }
    }

    public function downloadTemplate(?Team $currentTeam = null): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            // UTF-8 BOM for Microsoft Excel
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, [
                'nombre',
                'sku',
                'categoria',
                'marca',
                'tipo',
                'precio',
                'precio_oferta',
                'stock',
                'stock_minimo',
                'descripcion_corta',
                'descripcion',
                'especificaciones',
                'beneficios',
                'garantia',
                'envio',
                'metodos_pago',
                'activo',
                'destacado',
                'mas_vendido',
                'nuevo',
            ]);

            $sampleRows = [
                [
                    'Autodesk AutoCAD 2027 - 1 PC - 1 Año',
                    'AUT-ACAD-2027-1Y',
                    'Ingeniería',
                    'Autodesk',
                    'license',
                    '90.00',
                    '79.00',
                    '15',
                    '3',
                    'AutoCAD 2027: software de diseño CAD líder para dibujo 2D y modelado 3D.',
                    'Diseño de proyectos de ingeniería y arquitectura con máxima precisión y compatibilidad.',
                    'Requisitos: Windows 10/11 64-bit | RAM: 16 GB | Espacio libre: 30 GB | Equipo: 1 PC',
                    'Licencia original garantizada | Actualizaciones oficiales | Soporte técnico incluido',
                    '1 año de garantía comercial',
                    'Entrega digital inmediata por correo y WhatsApp',
                    'Tarjeta, transferencia bancaria, Yape y Plin',
                    '1',
                    '1',
                    '1',
                    '1',
                ],
                [
                    'Autodesk Revit 2026 - 1 PC - 1 Año',
                    'AUT-REVT-2026-1Y',
                    'Ingeniería',
                    'Autodesk',
                    'license',
                    '95.00',
                    '85.00',
                    '20',
                    '3',
                    'Revit 2026: software BIM multidimensional para diseño y modelado de edificaciones.',
                    'Herramienta completa de arquitectura, estructuras y MEP con colaboración en tiempo real.',
                    'Requisitos: Windows 10/11 64-bit | RAM: 16 GB mínimo / 32 GB recomendado | CPU: Multi-core i7 o Ryzen 7',
                    'Activación rápida | Acceso a librerías oficiales | Garantía de funcionamiento',
                    '1 año de garantía',
                    'Entrega digital inmediata por correo',
                    'Yape, Plin y transferencia bancaria',
                    '1',
                    '1',
                    '0',
                    '1',
                ],
                [
                    'Laptop Lenovo ThinkPad T14 Gen 4',
                    'LEN-T14-G4-I7',
                    'Laptops',
                    'Lenovo',
                    'physical',
                    '4200.00',
                    '3899.00',
                    '8',
                    '2',
                    'Laptop empresarial ultraduradera con procesador Intel Core i7 de 13va generación.',
                    'Diseño robusto MIL-STD 810H, teclado retroiluminado resistente a salpicaduras y batería de larga duración.',
                    'Procesador: Intel Core i7-1355U | RAM: 16 GB DDR5 | Disco: 512 GB SSD NVMe | Pantalla: 14" WUXGA IPS',
                    'Garantía oficial Lenovo | Envíos a todo el Perú asegurados | Asistencia técnica postventa',
                    '12 meses de garantía oficial',
                    'Envío a domicilio en Lima y provincias por Olva Courier',
                    'Tarjeta de crédito, débito, transferencia y efectivo contraentrega',
                    '1',
                    '0',
                    '1',
                    '0',
                ],
            ];

            foreach ($sampleRows as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        }, 'plantilla_productos_inventario.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function export(?Team $currentTeam = null): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            // UTF-8 BOM for Microsoft Excel
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, [
                'nombre',
                'sku',
                'categoria',
                'marca',
                'tipo',
                'precio',
                'precio_oferta',
                'stock',
                'stock_minimo',
                'descripcion_corta',
                'descripcion',
                'especificaciones',
                'beneficios',
                'garantia',
                'envio',
                'metodos_pago',
                'activo',
                'destacado',
                'mas_vendido',
                'nuevo',
            ]);

            Product::query()
                ->with(['category:id,name', 'brand:id,name'])
                ->orderBy('id')
                ->chunk(100, function ($products) use ($handle): void {
                    foreach ($products as $product) {
                        $specsStr = '';
                        if (is_array($product->specifications)) {
                            $parts = [];
                            foreach ($product->specifications as $k => $v) {
                                $parts[] = "{$k}: {$v}";
                            }
                            $specsStr = implode(' | ', $parts);
                        }

                        $benefitsStr = '';
                        if (is_array($product->benefits)) {
                            $benefitsStr = implode(' | ', $product->benefits);
                        }

                        fputcsv($handle, [
                            $product->name,
                            $product->sku,
                            $product->category?->name ?? '',
                            $product->brand?->name ?? '',
                            $product->type,
                            number_format((float) $product->price, 2, '.', ''),
                            $product->promotional_price !== null ? number_format((float) $product->promotional_price, 2, '.', '') : '',
                            (string) $product->stock,
                            (string) $product->minimum_stock,
                            (string) $product->short_description,
                            (string) $product->description,
                            $specsStr,
                            $benefitsStr,
                            (string) $product->warranty_info,
                            (string) $product->shipping_info,
                            (string) $product->payment_info,
                            $product->is_active ? '1' : '0',
                            $product->is_featured ? '1' : '0',
                            $product->is_bestseller ? '1' : '0',
                            $product->is_new ? '1' : '0',
                        ]);
                    }
                });

            fclose($handle);
        }, 'inventario_completo.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function import(Request $request, ?Team $currentTeam = null): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:20480'],
        ], [
            'file.required' => 'Debes seleccionar un archivo para importar.',
            'file.file' => 'El archivo subido no es válido.',
            'file.max' => 'El archivo no puede exceder los 20 MB.',
        ]);

        $file = $request->file('file');
        $extension = strtolower((string) $file->getClientOriginalExtension());
        if (! in_array($extension, ['xlsx', 'xls', 'csv', 'txt'], true)) {
            return back()->withErrors(['file' => 'Solo se admiten archivos Excel (.xlsx, .xls) o CSV (.csv).']);
        }

        $importedCount = $this->importFromFilePath($file->getRealPath(), $extension, $request->user()?->id);
        Cache::flush();

        return back()->with('toast', [
            'type' => 'success',
            'message' => "Se procesaron con éxito {$importedCount} productos en el inventario.",
        ]);
    }

    private function importFromFilePath(string $filePath, string $extension, ?int $userId = null): int
    {
        $rows = in_array($extension, ['xlsx', 'xls'], true)
            ? $this->readXlsxRows($filePath)
            : $this->readCsvRows($filePath);

        if (empty($rows)) {
            return 0;
        }

        $headerRow = array_shift($rows);
        $headers = array_map(function ($h) {
            $clean = strtolower(trim((string) $h));
            $clean = str_replace([' ', '-', '.'], '_', $clean);

            return preg_replace('/[^a-z0-9_]/', '', $clean);
        }, $headerRow);

        $importedCount = 0;

        foreach ($rows as $row) {
            if (empty(array_filter($row, fn ($val) => trim((string) $val) !== ''))) {
                continue;
            }

            $data = [];
            foreach ($headers as $index => $colName) {
                if ($colName !== '') {
                    $data[$colName] = $row[$index] ?? '';
                }
            }

            $name = trim((string) ($data['nombre'] ?? ''));
            if ($name === '') {
                continue;
            }

            $categoryId = null;
            $catName = trim((string) ($data['categoria'] ?? ''));
            if ($catName !== '') {
                $category = Category::query()->firstOrCreate(
                    ['slug' => Str::slug($catName)],
                    ['name' => $catName, 'is_active' => true]
                );
                $categoryId = $category->id;
            }

            $brandId = null;
            $brandName = trim((string) ($data['marca'] ?? ''));
            if ($brandName !== '') {
                $brand = Brand::query()->firstOrCreate(
                    ['slug' => Str::slug($brandName)],
                    ['name' => $brandName, 'is_active' => true]
                );
                $brandId = $brand->id;
            }

            $sku = strtoupper(trim((string) ($data['sku'] ?? '')));
            if ($sku === '') {
                $sku = Product::generateUniqueSku($name, $brandId, $categoryId);
            }

            $price = (float) str_replace([',', ' '], ['', ''], (string) ($data['precio'] ?? '0'));
            $rawPromo = trim((string) ($data['precio_oferta'] ?? ''));
            $promotionalPrice = $rawPromo !== '' ? (float) str_replace([',', ' '], ['', ''], $rawPromo) : null;

            $stock = max(0, (int) ($data['stock'] ?? 0));
            $minStock = max(0, (int) ($data['stock_minimo'] ?? 0));

            $type = trim((string) ($data['tipo'] ?? ''));
            if (! in_array($type, ['license', 'software', 'physical'], true)) {
                $type = 'license';
            }

            $specifications = $this->parseSpecifications((string) ($data['especificaciones'] ?? ''));
            $benefits = $this->parseBenefits((string) ($data['beneficios'] ?? ''));

            $isActive = $this->parseBoolean($data['activo'] ?? '1', true);
            $isFeatured = $this->parseBoolean($data['destacado'] ?? '0', false);
            $isBestseller = $this->parseBoolean($data['mas_vendido'] ?? '0', false);
            $isNew = $this->parseBoolean($data['nuevo'] ?? '0', false);

            $existingProduct = Product::query()->where('sku', $sku)->first();

            $slug = $existingProduct
                ? $existingProduct->slug
                : Product::generateUniqueSlug($name);

            $attributes = [
                'category_id' => $categoryId,
                'brand_id' => $brandId,
                'name' => $name,
                'slug' => $slug,
                'sku' => $sku,
                'type' => $type,
                'price' => $price,
                'promotional_price' => $promotionalPrice,
                'stock' => $stock,
                'minimum_stock' => $minStock,
                'short_description' => trim((string) ($data['descripcion_corta'] ?? '')),
                'description' => trim((string) ($data['descripcion'] ?? '')),
                'specifications' => $specifications,
                'benefits' => $benefits,
                'warranty_info' => trim((string) ($data['garantia'] ?? '')),
                'shipping_info' => trim((string) ($data['envio'] ?? '')),
                'payment_info' => trim((string) ($data['metodos_pago'] ?? '')),
                'is_active' => $isActive,
                'is_featured' => $isFeatured,
                'is_bestseller' => $isBestseller,
                'is_new' => $isNew,
            ];

            if ($existingProduct) {
                $prevStock = $existingProduct->stock;
                $existingProduct->update($attributes);
                $diff = $stock - $prevStock;
                if ($diff !== 0 && $userId) {
                    StockMovement::query()->create([
                        'product_id' => $existingProduct->id,
                        'user_id' => $userId,
                        'type' => $diff > 0 ? 'entry' : 'adjustment',
                        'quantity' => $diff,
                        'stock_after' => $stock,
                        'reason' => 'Actualización masiva de inventario (Importación).',
                    ]);
                }
            } else {
                $newProduct = Product::query()->create($attributes);
                if ($stock > 0 && $userId) {
                    StockMovement::query()->create([
                        'product_id' => $newProduct->id,
                        'user_id' => $userId,
                        'type' => 'entry',
                        'quantity' => $stock,
                        'stock_after' => $stock,
                        'reason' => 'Stock inicial por importación de catálogo.',
                    ]);
                }
            }

            $importedCount++;
        }

        return $importedCount;
    }

    private function readXlsxRows(string $filePath): array
    {
        $zip = new ZipArchive;
        if ($zip->open($filePath) !== true) {
            return [];
        }

        $sharedStrings = [];
        $sharedStringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($sharedStringsXml !== false) {
            $xml = @simplexml_load_string($sharedStringsXml);
            if ($xml !== false) {
                foreach ($xml->si as $si) {
                    if (isset($si->t)) {
                        $sharedStrings[] = (string) $si->t;
                    } elseif (isset($si->r)) {
                        $text = '';
                        foreach ($si->r as $r) {
                            $text .= (string) $r->t;
                        }
                        $sharedStrings[] = $text;
                    } else {
                        $sharedStrings[] = '';
                    }
                }
            }
        }

        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();

        if ($sheetXml === false) {
            return [];
        }

        $xml = @simplexml_load_string($sheetXml);
        if ($xml === false || ! isset($xml->sheetData->row)) {
            return [];
        }

        $rows = [];
        foreach ($xml->sheetData->row as $row) {
            $rowData = [];
            foreach ($row->c as $cell) {
                $ref = (string) $cell['r'];
                $colLetters = preg_replace('/[0-9]/', '', $ref);
                $colIndex = 0;
                for ($i = 0; $i < strlen($colLetters); $i++) {
                    $colIndex = $colIndex * 26 + (ord($colLetters[$i]) - ord('A') + 1);
                }
                $colIndex -= 1;

                $type = (string) $cell['t'];
                $val = isset($cell->v) ? (string) $cell->v : (isset($cell->is->t) ? (string) $cell->is->t : '');

                if ($type === 's' && isset($sharedStrings[(int) $val])) {
                    $val = $sharedStrings[(int) $val];
                }

                $rowData[$colIndex] = trim($val);
            }

            if (! empty($rowData)) {
                $maxKey = max(array_keys($rowData));
                $normalizedRow = [];
                for ($k = 0; $k <= $maxKey; $k++) {
                    $normalizedRow[$k] = $rowData[$k] ?? '';
                }
                $rows[] = $normalizedRow;
            }
        }

        return $rows;
    }

    private function readCsvRows(string $filePath): array
    {
        $handle = fopen($filePath, 'r');
        if (! $handle) {
            return [];
        }

        $firstLine = fgets($handle);
        rewind($handle);

        $delimiter = ',';
        if ($firstLine !== false) {
            if (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
                $delimiter = ';';
            } elseif (substr_count($firstLine, "\t") > substr_count($firstLine, ',')) {
                $delimiter = "\t";
            }
        }

        $rows = [];
        while (($data = fgetcsv($handle, 0, $delimiter)) !== false) {
            if (count($rows) === 0 && isset($data[0])) {
                $data[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $data[0]);
            }
            $rows[] = array_map(fn ($val) => trim((string) $val), $data);
        }

        fclose($handle);

        return $rows;
    }

    /** @return array<string, string> */
    private function parseSpecifications(string $text): array
    {
        $specifications = [];
        $parts = preg_split('/\||\R/', $text) ?: [];
        foreach ($parts as $part) {
            if (str_contains($part, ':')) {
                [$k, $v] = explode(':', $part, 2);
                $key = trim($k);
                $val = trim($v);
                if ($key !== '') {
                    $specifications[$key] = $val;
                }
            }
        }

        return $specifications;
    }

    /** @return array<int, string> */
    private function parseBenefits(string $text): array
    {
        $benefits = [];
        $parts = preg_split('/\||\R/', $text) ?: [];
        foreach ($parts as $part) {
            $item = trim($part);
            if ($item !== '') {
                $benefits[] = $item;
            }
        }

        return $benefits;
    }

    private function parseBoolean(mixed $val, bool $default = false): bool
    {
        if ($val === null || $val === '') {
            return $default;
        }

        $normalized = strtolower(trim((string) $val));

        return in_array($normalized, ['1', 'true', 'si', 'sí', 'yes', 'y', 's', 'activo', 'publicado'], true);
    }
}
