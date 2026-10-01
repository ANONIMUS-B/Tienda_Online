<?php

namespace App\Http\Requests;

use App\Models\Product;
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
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $name = trim((string) $this->input('name'));
        $slug = trim((string) $this->input('slug'));
        if ($slug === '' && $name !== '') {
            $slug = Product::generateUniqueSlug($name);
        } elseif ($slug !== '') {
            $slug = Product::generateUniqueSlug($slug);
        }

        $sku = trim((string) $this->input('sku'));
        if ($sku === '' && $name !== '') {
            $sku = Product::generateUniqueSku(
                $name,
                $this->filled('brand_id') ? (int) $this->input('brand_id') : null,
                $this->filled('category_id') ? (int) $this->input('category_id') : null
            );
        } elseif ($sku !== '') {
            $sku = strtoupper($sku);
            if (Product::query()->where('sku', $sku)->exists()) {
                $sku = Product::generateUniqueSku(
                    $name ?: $sku,
                    $this->filled('brand_id') ? (int) $this->input('brand_id') : null,
                    $this->filled('category_id') ? (int) $this->input('category_id') : null
                );
            }
        }

        $this->merge(array_filter([
            'slug' => $slug ?: null,
            'sku' => $sku ?: null,
        ], fn ($v) => $v !== null));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'type' => ['required', 'in:physical,digital,license,software,service,application'],
            'sku' => ['nullable', 'string', 'max:80', 'unique:products,sku'],
            'name' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:180', 'unique:products,slug'],
            'short_description' => ['nullable', 'string', 'max:280'],
            'description' => ['nullable', 'string', 'max:5000'],
            'specifications_text' => ['nullable', 'string', 'max:5000'],
            'benefits_text' => ['nullable', 'string', 'max:3000'],
            'warranty_info' => ['nullable', 'string', 'max:160'],
            'shipping_info' => ['nullable', 'string', 'max:160'],
            'payment_info' => ['nullable', 'string', 'max:160'],
            'price' => ['required', 'numeric', 'min:0'],
            'promotional_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'stock' => ['required', 'integer', 'min:0'],
            'minimum_stock' => ['required', 'integer', 'min:0'],
            'is_featured' => ['required', 'boolean'],
            'is_bestseller' => ['required', 'boolean'],
            'is_new' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'primary_image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:12288'],
            'gallery' => ['nullable', 'array', 'max:8'],
            'gallery.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:12288'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'primary_image.required' => 'La imagen principal es obligatoria.',
            'primary_image.image' => 'El archivo seleccionado como imagen principal debe ser una imagen válida.',
            'primary_image.mimes' => 'La imagen principal debe estar en formato JPG, JPEG, PNG o WEBP.',
            'primary_image.max' => 'La imagen principal no debe superar los 12 MB.',
            'primary_image.uploaded' => 'No se pudo subir la imagen principal. Verifica que el archivo no esté dañado o exceda el tamaño permitido.',
            'gallery.max' => 'Puedes subir como máximo 8 imágenes en la galería.',
            'gallery.*.image' => 'Todos los archivos de la galería deben ser imágenes válidas.',
            'gallery.*.mimes' => 'Las imágenes de la galería deben estar en formato JPG, JPEG, PNG o WEBP.',
            'gallery.*.max' => 'Ninguna imagen de la galería debe superar los 12 MB.',
            'gallery.*.uploaded' => 'Una de las imágenes de la galería no se pudo subir. Verifica su tamaño.',
            'sku.unique' => 'Este código SKU ya está registrado en otro producto.',
            'slug.unique' => 'Este slug ya está en uso. Modifícalo o déjalo vacío para generarlo automáticamente.',
        ];
    }
}
