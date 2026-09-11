<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id', 'mime_type', 'size', 'original_name', 'contents'])]
class MediaFile extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';
}
