<?php

namespace App\Models;

use Database\Factories\ElectronicDocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['order_id', 'service_request_id', 'software_membership_id', 'type', 'series', 'correlative', 'number', 'status', 'environment', 'provider', 'currency', 'customer_name', 'customer_document', 'customer_email', 'subtotal', 'tax', 'total', 'payload_json', 'response_json', 'xml_path', 'cdr_path', 'issued_at', 'sent_at'])]
class ElectronicDocument extends Model
{
    /** @use HasFactory<ElectronicDocumentFactory> */
    use HasFactory;

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function softwareMembership(): BelongsTo
    {
        return $this->belongsTo(SoftwareMembership::class);
    }

    protected function casts(): array
    {
        return ['payload_json' => 'array', 'response_json' => 'array', 'subtotal' => 'decimal:2', 'tax' => 'decimal:2', 'total' => 'decimal:2', 'issued_at' => 'datetime', 'sent_at' => 'datetime'];
    }
}
