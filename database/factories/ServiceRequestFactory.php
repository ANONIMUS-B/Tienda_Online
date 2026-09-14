<?php

namespace Database\Factories;

use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceRequest>
 */
class ServiceRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'number' => 'SR-'.fake()->unique()->numerify('######'),
            'service_type' => fake()->randomElement(['Mantenimiento', 'Diagnóstico y reparación', 'Instalación de programas']),
            'device' => fake()->randomElement(['Laptop HP', 'PC de escritorio', 'Impresora Epson']),
            'phone' => fake()->numerify('9########'),
            'priority' => 'normal',
            'status' => 'pending',
            'description' => fake()->sentence(12),
        ];
    }
}
