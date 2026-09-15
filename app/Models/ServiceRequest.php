<?php

namespace App\Models;

use Database\Factories\ServiceRequestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $responded_by
 * @property string $number
 * @property string $service_type
 * @property string|null $device
 * @property string $phone
 * @property string $priority
 * @property string $status
 * @property string $description
 * @property string|null $admin_response
 * @property Carbon|null $responded_at
 * @property Carbon|null $customer_read_at
 */
#[Fillable(['user_id', 'responded_by', 'number', 'service_type', 'device', 'phone', 'priority', 'status', 'description', 'admin_response', 'quoted_amount', 'payment_status', 'receipt_type', 'responded_at', 'customer_read_at'])]
class ServiceRequest extends Model
{
    /** @use HasFactory<ServiceRequestFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<User, $this> */
    public function responder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responded_by');
    }

    public function electronicDocuments(): HasMany
    {
        return $this->hasMany(ElectronicDocument::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
            'customer_read_at' => 'datetime',
            'quoted_amount' => 'decimal:2',
        ];
    }
}
