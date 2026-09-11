<?php

namespace Database\Factories;

use App\Models\SoftwareProgram;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SoftwareProgram>
 */
class SoftwareProgramFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $name = $this->faker->unique()->sentence(3), 'slug' => str($name)->slug(), 'category' => 'Utilidades', 'platform' => 'Windows', 'version' => '1.0', 'license_type' => 'free', 'price' => null, 'short_description' => $this->faker->sentence(), 'description' => $this->faker->paragraph(), 'is_active' => true,
        ];
    }
}
