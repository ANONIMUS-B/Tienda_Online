<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['company_name', 'phone', 'whatsapp_number', 'email', 'address', 'logo_path', 'favicon_path', 'facebook_url', 'instagram_url', 'tiktok_url'])]
class CompanySetting extends Model
{
}
