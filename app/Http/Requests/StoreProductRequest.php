<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
        return [
            'category_id' => ['required', 'exists:categories,id'], 'brand_id' => ['nullable', 'exists:brands,id'],
            'type' => ['required', 'in:physical,digital,license,software,service,application'],
            'sku' => ['required', 'string', 'max:80', 'unique:products,sku'], 'name' => ['required', 'string', 'max:160'],
            'slug' => ['required', 'string', 'max:180', 'unique:products,slug'], 'short_description' => ['nullable', 'string', 'max:280'],
            'description' => ['nullable', 'string', 'max:5000'], 'specifications_text' => ['nullable', 'string', 'max:5000'],
            'benefits_text' => ['nullable', 'string', 'max:3000'], 'warranty_info' => ['nullable', 'string', 'max:160'],
            'shipping_info' => ['nullable', 'string', 'max:160'], 'payment_info' => ['nullable', 'string', 'max:160'],
            'price' => ['required', 'numeric', 'min:0'], 'promotional_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'stock' => ['required', 'integer', 'min:0'], 'minimum_stock' => ['required', 'integer', 'min:0'],
            'is_featured' => ['required', 'boolean'], 'is_bestseller' => ['required', 'boolean'], 'is_new' => ['required', 'boolean'], 'is_active' => ['required', 'boolean'],
            'primary_image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'gallery' => ['nullable', 'array', 'max:8'], 'gallery.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
        ];
    }
}
