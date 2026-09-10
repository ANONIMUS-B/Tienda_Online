<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $product = $this->route('product');
        $productId = $product instanceof Product ? $product->getKey() : $product;

        return [
            'category_id' => ['required', 'exists:categories,id'], 'brand_id' => ['nullable', 'exists:brands,id'],
            'type' => ['required', 'in:physical,digital,license,software,service,application'],
            'sku' => ['required', 'string', 'max:80', Rule::unique('products', 'sku')->ignore($productId)], 'name' => ['required', 'string', 'max:160'],
            'slug' => ['required', 'string', 'max:180', Rule::unique('products', 'slug')->ignore($productId)], 'short_description' => ['nullable', 'string', 'max:280'],
            'description' => ['nullable', 'string', 'max:5000'], 'specifications_text' => ['nullable', 'string', 'max:5000'],
            'price' => ['required', 'numeric', 'min:0'], 'promotional_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'stock' => ['required', 'integer', 'min:0'], 'minimum_stock' => ['required', 'integer', 'min:0'],
            'is_featured' => ['required', 'boolean'], 'is_bestseller' => ['required', 'boolean'], 'is_new' => ['required', 'boolean'], 'is_active' => ['required', 'boolean'],
            'primary_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'gallery' => ['nullable', 'array', 'max:8'], 'gallery.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
        ];
    }
}
