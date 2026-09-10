<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'number' => 'JB-'.$this->faker->unique()->numerify('########'), 'status' => 'pending', 'payment_status' => 'pending', 'payment_method' => 'yape', 'shipping_method' => 'delivery', 'customer_name' => $this->faker->name(), 'customer_email' => $this->faker->safeEmail(), 'customer_phone' => '999999999', 'address' => $this->faker->streetAddress(), 'district' => 'Miraflores', 'province' => 'Lima', 'department' => 'Lima', 'subtotal' => 100, 'shipping_total' => 15, 'total' => 115,
        ];
    }
}
