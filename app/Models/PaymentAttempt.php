<?php

namespace App\Models;

use Database\Factories\PaymentAttemptFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['reference', 'order_id', 'provider', 'payment_type', 'environment', 'amount', 'currency', 'status', 'source_hash', 'source_id', 'secret_key', 'device_id', 'email', 'charge_id', 'provider_order_id', 'message', 'verified_at', 'expires_at', 'provider_data'])]
#[Hidden(['source_id', 'source_hash', 'secret_key', 'device_id', 'email'])]
class PaymentAttempt extends Model
{
    /** @use HasFactory<PaymentAttemptFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['amount' => 'integer', 'provider_data' => 'array', 'expires_at' => 'datetime', 'source_id' => 'encrypted', 'secret_key' => 'encrypted', 'device_id' => 'encrypted', 'verified_at' => 'datetime'];
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
