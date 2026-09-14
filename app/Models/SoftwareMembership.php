<?php

namespace App\Models;

use Database\Factories\SoftwareMembershipFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'approved_by', 'plan', 'amount', 'payment_method', 'payment_reference', 'status', 'starts_at', 'expires_at'])]
class SoftwareMembership extends Model
{
    /** @use HasFactory<SoftwareMembershipFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<User, $this> */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'starts_at' => 'datetime', 'expires_at' => 'datetime'];
    }
}
