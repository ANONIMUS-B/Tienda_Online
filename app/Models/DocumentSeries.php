<?php

namespace App\Models;

use Database\Factories\DocumentSeriesFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['document_type', 'series', 'next_number', 'is_active'])]
class DocumentSeries extends Model
{
    /** @use HasFactory<DocumentSeriesFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['next_number' => 'integer', 'is_active' => 'boolean'];
    }
}
