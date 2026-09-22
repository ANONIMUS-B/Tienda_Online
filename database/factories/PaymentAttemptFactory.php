<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\PaymentAttempt;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PaymentAttempt>
 */
class PaymentAttemptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $source = 'tkn_live_'.Str::random(16);

        return [
            'order_id' => Order::factory()->state(['payment_method' => 'gateway']),
            'reference' => (string) Str::uuid(),
            'environment' => 'live', 'amount' => 11500, 'currency' => 'PEN',
            'status' => 'unknown', 'source_id' => $source, 'source_hash' => hash('sha256', $source),
            'secret_key' => 'sk_live_example', 'device_id' => 'device-example', 'email' => 'cliente@example.com',
        ];
    }
}
