<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

#[Fillable(['category_id', 'brand_id', 'type', 'sku', 'name', 'slug', 'short_description', 'description', 'specifications', 'benefits', 'warranty_info', 'shipping_info', 'payment_info', 'price', 'promotional_price', 'stock', 'minimum_stock', 'is_featured', 'is_bestseller', 'is_new', 'is_active'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, SoftDeletes;

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<Brand, $this> */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /** @return HasMany<ProductImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderByDesc('is_primary')->orderBy('sort_order');
    }

    /** @return HasMany<StockMovement, $this> */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class)->latest();
    }

    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name);
        if ($baseSlug === '') {
            $baseSlug = 'producto';
        }

        $slug = $baseSlug;
        $counter = 1;

        while (static::query()->where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    public static function generateUniqueSku(?string $name = null, ?int $brandId = null, ?int $categoryId = null, ?int $ignoreId = null): string
    {
        $brandPrefix = '';
        if ($brandId) {
            $brand = Brand::query()->find($brandId);
            if ($brand) {
                $cleaned = preg_replace('/[^A-Za-z0-9]/', '', (string) $brand->name);
                if (! empty($cleaned)) {
                    $brandPrefix = strtoupper(substr($cleaned, 0, 3));
                }
            }
        }

        $namePrefix = '';
        if ($name) {
            $words = preg_split('/\s+/', trim($name)) ?: [];
            $initials = '';
            foreach ($words as $word) {
                $cleaned = preg_replace('/[^A-Za-z0-9]/', '', (string) $word);
                if (! empty($cleaned)) {
                    $initials .= strtoupper($cleaned[0]);
                }
                if (strlen($initials) >= 4) {
                    break;
                }
            }
            if (strlen($initials) >= 2) {
                $namePrefix = $initials;
            } else {
                $cleaned = preg_replace('/[^A-Za-z0-9]/', '', $name);
                $namePrefix = strtoupper(substr($cleaned, 0, 3));
            }
        }

        $parts = ['JB'];
        if ($brandPrefix !== '') {
            $parts[] = $brandPrefix;
        }
        if ($namePrefix !== '') {
            $parts[] = $namePrefix;
        }

        $prefix = implode('-', $parts);

        do {
            $random = strtoupper(Str::random(4));
            $sku = "{$prefix}-{$random}";
        } while (static::query()->where('sku', $sku)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists());

        return $sku;
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['specifications' => 'array', 'benefits' => 'array', 'price' => 'decimal:2', 'promotional_price' => 'decimal:2', 'stock' => 'integer', 'minimum_stock' => 'integer', 'is_featured' => 'boolean', 'is_bestseller' => 'boolean', 'is_new' => 'boolean', 'is_active' => 'boolean'];
    }
}
