<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['culqi_enabled', 'culqi_pagoefectivo_enabled', 'culqi_cip_expiration_hours', 'izipay_enabled', 'izipay_merchant_code', 'izipay_public_key', 'izipay_api_username', 'izipay_api_password', 'izipay_hash_key', 'culqi_cards_enabled', 'culqi_yape_enabled', 'culqi_rsa_id', 'culqi_rsa_public_key', 'identity_lookup_enabled', 'identity_lookup_provider', 'identity_lookup_token', 'company_name', 'phone', 'whatsapp_number', 'email', 'address', 'logo_path', 'favicon_path', 'facebook_url', 'instagram_url', 'tiktok_url', 'payment_yape_enabled', 'payment_transfer_enabled', 'payment_cash_enabled', 'payment_gateway_enabled', 'payment_gateway', 'payment_test_mode', 'gateway_public_key', 'gateway_secret_key', 'yape_number', 'yape_qr_path', 'bank_name', 'bank_account', 'whatsapp_checkout_enabled', 'software_membership_enabled', 'software_monthly_price', 'software_annual_price', 'software_membership_price', 'software_membership_period', 'billing_enabled', 'billing_mode', 'billing_environment', 'billing_provider', 'billing_ruc', 'billing_api_url', 'billing_api_token', 'billing_certificate_path', 'billing_certificate_password'])]
#[Hidden(['gateway_secret_key', 'izipay_api_username', 'izipay_api_password', 'izipay_hash_key', 'billing_api_token', 'billing_certificate_password', 'identity_lookup_token'])]
class CompanySetting extends Model
{
    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['culqi_enabled' => 'boolean', 'culqi_pagoefectivo_enabled' => 'boolean', 'izipay_enabled' => 'boolean', 'izipay_api_username' => 'encrypted', 'izipay_api_password' => 'encrypted', 'izipay_hash_key' => 'encrypted', 'culqi_cards_enabled' => 'boolean', 'culqi_yape_enabled' => 'boolean', 'identity_lookup_enabled' => 'boolean', 'identity_lookup_token' => 'encrypted', 'billing_enabled' => 'boolean', 'billing_api_token' => 'encrypted', 'billing_certificate_password' => 'encrypted', 'payment_yape_enabled' => 'boolean', 'payment_transfer_enabled' => 'boolean', 'payment_cash_enabled' => 'boolean', 'payment_gateway_enabled' => 'boolean', 'payment_test_mode' => 'boolean', 'whatsapp_checkout_enabled' => 'boolean', 'software_membership_enabled' => 'boolean', 'software_monthly_price' => 'decimal:2', 'software_annual_price' => 'decimal:2', 'software_membership_price' => 'decimal:2', 'gateway_public_key' => 'encrypted', 'gateway_secret_key' => 'encrypted'];
    }
}
