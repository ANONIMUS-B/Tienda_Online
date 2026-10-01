<?php

use App\Enums\TeamRole;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;

test('administrators can create products with uploaded images', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $brand = Brand::factory()->create();

    $this->actingAs($user)->post(route('admin.products.store', $user->currentTeam), productPayload($category, $brand))->assertRedirect();
    $product = Product::query()->firstOrFail();
    expect($product->images)->toHaveCount(2)->and($product->images->first()->is_primary)->toBeTrue();
    expect($product->images->first()->path)->toStartWith('/media/');
    expect($product->benefits)->toBe(['Ideal para oficina', 'Incluye accesorios']);
    expect($product->warranty_info)->toBe('12 meses');
    $this->assertDatabaseHas('media_files', ['id' => str($product->images->first()->path)->after('/media/')->toString()]);
});

test('administrators can delete a product image', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $brand = Brand::factory()->create();

    $this->actingAs($user)->post(route('admin.products.store', $user->currentTeam), productPayload($category, $brand));
    $product = Product::query()->firstOrFail();
    $imageToDelete = $product->images->first();

    $this->actingAs($user)
        ->delete(route('admin.products.images.destroy', [
            'current_team' => $user->currentTeam->slug,
            'product' => $product->slug,
            'image' => $imageToDelete->id,
        ]))
        ->assertRedirect();

    expect($product->fresh()->images)->toHaveCount(1);
});

test('product image uploads reject unsafe formats', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $payload = productPayload($category);
    $payload['primary_image'] = UploadedFile::fake()->create('product.svg', 20, 'image/svg+xml');
    $this->actingAs($user)->post(route('admin.products.store', $user->currentTeam), $payload)->assertSessionHasErrors('primary_image');
});

test('administrators can create product with automatic slug and sku when omitted', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $brand = Brand::factory()->create(['name' => 'Autodesk']);

    $payload = productPayload($category, $brand);
    unset($payload['slug'], $payload['sku']);
    $payload['name'] = 'Autodesk Revit 2026';

    $this->actingAs($user)->post(route('admin.products.store', $user->currentTeam), $payload)->assertRedirect();
    $product = Product::query()->where('name', 'Autodesk Revit 2026')->firstOrFail();
    expect($product->slug)->toBe('autodesk-revit-2026');
    expect($product->sku)->toStartWith('JB-AUT-');
});

test('creating product with existing slug generates unique incremental slug', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();

    Product::factory()->create(['slug' => 'revit-pro', 'name' => 'Revit Pro']);

    $payload = productPayload($category);
    $payload['slug'] = 'revit-pro';
    $payload['sku'] = '';
    $payload['name'] = 'Revit Pro';

    $this->actingAs($user)->post(route('admin.products.store', $user->currentTeam), $payload)->assertRedirect();
    $secondProduct = Product::query()->where('slug', 'revit-pro-1')->first();
    expect($secondProduct)->not->toBeNull();
});

test('regular members cannot manage products', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $this->actingAs($member)->get(route('admin.products.index', $team))->assertForbidden();
});

test('public catalog filters products and renders product details', function () {
    $category = Category::factory()->create(['name' => 'Laptops', 'slug' => 'laptops']);
    $brand = Brand::factory()->create(['name' => 'Lenovo', 'slug' => 'lenovo']);
    $product = Product::factory()->create(['category_id' => $category->id, 'brand_id' => $brand->id, 'name' => 'ThinkPad Pro', 'slug' => 'thinkpad-pro']);
    Product::factory()->create(['category_id' => $category->id, 'name' => 'Otro equipo']);

    $this->get(route('products', ['q' => 'ThinkPad']))->assertInertia(fn (Assert $page) => $page->component('products/index')->has('products.data', 1)->where('products.data.0.name', 'ThinkPad Pro'));
    $this->get(route('products.show', $product))->assertInertia(fn (Assert $page) => $page->component('products/show')->where('product.name', 'ThinkPad Pro'));
});

test('public catalog filters products by their effective price', function () {
    $discountedProduct = Product::factory()->create([
        'name' => 'Equipo en oferta',
        'price' => 1800,
        'promotional_price' => 1200,
    ]);
    Product::factory()->create(['price' => 900, 'promotional_price' => null]);
    Product::factory()->create(['price' => 2200, 'promotional_price' => null]);

    $this->get(route('products', ['min_price' => 1000, 'max_price' => 1500]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('products/index')
            ->has('products.data', 1)
            ->where('products.data.0.id', $discountedProduct->id)
            ->where('filters.min_price', '1000')
            ->where('filters.max_price', '1500'),
        );
});

test('public catalog rejects an inverted price range', function () {
    $this->get(route('products', ['min_price' => 1500, 'max_price' => 1000]))
        ->assertSessionHasErrors('max_price');
});

test('inactive products are hidden from their public detail page', function () {
    $product = Product::factory()->create(['is_active' => false]);
    $this->get(route('products.show', $product))->assertNotFound();
});

test('administrators can download product import template', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('admin.products.template', $user->currentTeam));

    $response->assertSuccessful();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('administrators can export all products inventory to CSV', function () {
    $user = User::factory()->create();
    Product::factory()->create(['name' => 'AutoCAD 2026', 'sku' => 'AUT-ACAD-2026']);

    $response = $this->actingAs($user)->get(route('admin.products.export', $user->currentTeam));

    $response->assertSuccessful();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    $content = $response->streamedContent();
    expect($content)->toContain('AUT-ACAD-2026')
        ->and($content)->toContain('AutoCAD 2026');
});

test('administrators can import products via CSV', function () {
    $user = User::factory()->create();

    $csvContent = "\xEF\xBB\xBFnombre,sku,categoria,marca,tipo,precio,precio_oferta,stock,stock_minimo,descripcion_corta,descripcion,especificaciones,beneficios,garantia,envio,metodos_pago,activo,destacado,mas_vendido,nuevo\n"
        ."AutoCAD 2026 Test,AUT-TEST-001,Ingeniería,Autodesk,license,120.00,99.00,20,5,Software CAD,Descripción completa,\"RAM: 16 GB | SO: Windows 11\",\"Soporte oficial | Licencia legal\",1 año,Digital,Yape / Tarjeta,1,1,0,1\n";

    $file = UploadedFile::fake()->createWithContent('productos.csv', $csvContent);

    $response = $this->actingAs($user)->post(route('admin.products.import', $user->currentTeam), [
        'file' => $file,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('products', [
        'sku' => 'AUT-TEST-001',
        'name' => 'AutoCAD 2026 Test',
        'price' => '120.00',
        'promotional_price' => '99.00',
        'stock' => 20,
    ]);

    $product = Product::query()->where('sku', 'AUT-TEST-001')->firstOrFail();
    expect($product->specifications)->toHaveKey('RAM', '16 GB')
        ->and($product->specifications)->toHaveKey('SO', 'Windows 11')
        ->and($product->benefits)->toContain('Soporte oficial')
        ->and($product->benefits)->toContain('Licencia legal');
});

/** @return array<string, mixed> */
function productPayload(Category $category, ?Brand $brand = null): array
{
    return ['category_id' => $category->id, 'brand_id' => $brand?->id, 'type' => 'physical', 'sku' => 'JB-001', 'name' => 'Laptop profesional', 'slug' => 'laptop-profesional', 'short_description' => 'Equipo de alto rendimiento.', 'description' => 'Descripción completa.', 'specifications_text' => "RAM: 16 GB\nDisco: 512 GB", 'benefits_text' => "Ideal para oficina\nIncluye accesorios", 'warranty_info' => '12 meses', 'shipping_info' => 'Envío nacional', 'payment_info' => 'Yape, Plin y tarjeta', 'price' => 3000, 'promotional_price' => 2799, 'stock' => 10, 'minimum_stock' => 3, 'is_featured' => true, 'is_bestseller' => false, 'is_new' => true, 'is_active' => true, 'primary_image' => UploadedFile::fake()->image('principal.webp'), 'gallery' => [UploadedFile::fake()->image('detalle.webp')]];
}
