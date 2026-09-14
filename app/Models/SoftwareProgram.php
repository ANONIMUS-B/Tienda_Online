<?php

namespace App\Models;

use Database\Factories\SoftwareProgramFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['image_id', 'file_id', 'name', 'slug', 'category', 'platform', 'version', 'license_type', 'price', 'short_description', 'description', 'requirements', 'installation_instructions', 'tutorial_url', 'download_enabled', 'is_own', 'is_featured', 'is_active', 'downloads'])]
class SoftwareProgram extends Model
{
    /** @use HasFactory<SoftwareProgramFactory> */
    use HasFactory, SoftDeletes;

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /** @return BelongsTo<MediaFile, $this> */
    public function image(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'image_id');
    }

    /** @return BelongsTo<MediaFile, $this> */
    public function file(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'file_id');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'download_enabled' => 'boolean', 'is_own' => 'boolean', 'is_featured' => 'boolean', 'is_active' => 'boolean', 'downloads' => 'integer'];
    }
}
