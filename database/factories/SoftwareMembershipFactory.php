<?php

namespace Database\Factories;

use App\Models\SoftwareMembership;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SoftwareMembership>
 */
class SoftwareMembershipFactory extends Factory
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
            'plan' => 'monthly',
            'amount' => 29.90,
            'payment_method' => 'yape',
            'payment_reference' => fake()->numerify('########'),
            'status' => 'pending',
        ];
    }
}
