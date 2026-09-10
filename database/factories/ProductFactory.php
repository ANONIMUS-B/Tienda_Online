<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'category_id' => null, 'brand_id' => null, 'type' => 'physical', 'sku' => fake()->unique()->bothify('JB-####-??'),
            'name' => ucfirst(is_array($name) ? implode(' ', $name) : $name), 'slug' => str(is_array($name) ? implode(' ', $name) : $name)->slug(),
            'short_description' => fake()->sentence(), 'description' => fake()->paragraph(), 'specifications' => null,
            'price' => fake()->randomFloat(2, 50, 5000), 'promotional_price' => null, 'stock' => 10, 'minimum_stock' => 5,
            'is_featured' => false, 'is_bestseller' => false, 'is_new' => true, 'is_active' => true,
        ];
    }
}
