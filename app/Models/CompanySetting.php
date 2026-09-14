<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['company_name', 'phone', 'whatsapp_number', 'email', 'address', 'logo_path', 'favicon_path', 'facebook_url', 'instagram_url', 'tiktok_url', 'payment_yape_enabled', 'payment_transfer_enabled', 'payment_cash_enabled', 'payment_gateway_enabled', 'payment_gateway', 'payment_test_mode', 'gateway_public_key', 'gateway_secret_key', 'yape_number', 'bank_name', 'bank_account', 'whatsapp_checkout_enabled', 'software_membership_enabled', 'software_monthly_price', 'software_annual_price', 'software_membership_price', 'software_membership_period'])]
#[Hidden(['gateway_secret_key'])]
class CompanySetting extends Model
{
    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['payment_yape_enabled' => 'boolean', 'payment_transfer_enabled' => 'boolean', 'payment_cash_enabled' => 'boolean', 'payment_gateway_enabled' => 'boolean', 'payment_test_mode' => 'boolean', 'whatsapp_checkout_enabled' => 'boolean', 'software_membership_enabled' => 'boolean', 'software_monthly_price' => 'decimal:2', 'software_annual_price' => 'decimal:2', 'software_membership_price' => 'decimal:2', 'gateway_public_key' => 'encrypted', 'gateway_secret_key' => 'encrypted'];
    }
}
