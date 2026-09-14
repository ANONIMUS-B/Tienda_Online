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

test('product image uploads reject unsafe formats', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $payload = productPayload($category);
    $payload['primary_image'] = UploadedFile::fake()->create('product.svg', 20, 'image/svg+xml');
    $this->actingAs($user)->post(route('admin.products.store', $user->currentTeam), $payload)->assertSessionHasErrors('primary_image');
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

/** @return array<string, mixed> */
function productPayload(Category $category, ?Brand $brand = null): array
{
    return ['category_id' => $category->id, 'brand_id' => $brand?->id, 'type' => 'physical', 'sku' => 'JB-001', 'name' => 'Laptop profesional', 'slug' => 'laptop-profesional', 'short_description' => 'Equipo de alto rendimiento.', 'description' => 'Descripción completa.', 'specifications_text' => "RAM: 16 GB\nDisco: 512 GB", 'benefits_text' => "Ideal para oficina\nIncluye accesorios", 'warranty_info' => '12 meses', 'shipping_info' => 'Envío nacional', 'payment_info' => 'Yape, Plin y tarjeta', 'price' => 3000, 'promotional_price' => 2799, 'stock' => 10, 'minimum_stock' => 3, 'is_featured' => true, 'is_bestseller' => false, 'is_new' => true, 'is_active' => true, 'primary_image' => UploadedFile::fake()->image('principal.webp'), 'gallery' => [UploadedFile::fake()->image('detalle.webp')]];
}
