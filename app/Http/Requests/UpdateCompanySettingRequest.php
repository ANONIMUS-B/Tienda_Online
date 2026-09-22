<?php

namespace App\Http\Requests;

use App\Models\CompanySetting;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCompanySettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:30'],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'tiktok_url' => ['nullable', 'url', 'max:255'],
            'payment_yape_enabled' => ['required', 'boolean'],
            'payment_transfer_enabled' => ['required', 'boolean'],
            'payment_cash_enabled' => ['required', 'boolean'],
            'payment_gateway_enabled' => ['required', 'boolean'],
            'payment_gateway' => ['nullable', Rule::in(['culqi', 'mercadopago', 'niubiz'])],
            'payment_test_mode' => ['required', 'boolean'],
            'gateway_public_key' => ['nullable', 'string', 'max:1000'],
            'gateway_secret_key' => ['nullable', 'string', 'max:1000'],
            'culqi_cards_enabled' => ['sometimes', 'boolean'],
            'culqi_yape_enabled' => ['sometimes', 'boolean'],
            'culqi_pagoefectivo_enabled' => ['sometimes', 'boolean'],
            'culqi_cip_expiration_hours' => ['sometimes', 'integer', 'min:1', 'max:168'],
            'izipay_enabled' => ['sometimes', 'boolean'],
            'izipay_merchant_code' => ['nullable', 'string', 'max:50'],
            'izipay_public_key' => ['nullable', 'string', 'max:5000'],
            'izipay_api_username' => ['nullable', 'string', 'max:1000'],
            'izipay_api_password' => ['nullable', 'string', 'max:1000'],
            'izipay_hash_key' => ['nullable', 'string', 'max:2000'],
            'culqi_rsa_id' => ['nullable', 'string', 'max:100', 'required_with:culqi_rsa_public_key'],
            'culqi_rsa_public_key' => ['nullable', 'string', 'max:5000', 'required_with:culqi_rsa_id'],
            'yape_number' => ['nullable', 'string', 'max:30'],
            'bank_name' => ['nullable', 'string', 'max:120'],
            'bank_account' => ['nullable', 'string', 'max:120'],
            'whatsapp_checkout_enabled' => ['required', 'boolean'],
            'software_membership_enabled' => ['sometimes', 'boolean'],
            'software_membership_price' => ['sometimes', 'numeric', 'min:0'],
            'software_membership_period' => ['sometimes', Rule::in(['monthly', 'annual', 'permanent'])],
        ];
    }

    /** @return array<\Closure> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if (! $this->boolean('payment_gateway_enabled')) {
                if ($this->boolean('izipay_enabled')) {
                    $this->validateIzipay($validator);
                }

                return;
            }
            if ($this->input('payment_gateway') !== 'culqi') {
                $validator->errors()->add('payment_gateway', 'Selecciona Culqi para activar los cobros en línea.');

                return;
            }
            $settings = CompanySetting::query()->first();
            $mode = $this->boolean('payment_test_mode') ? 'test' : 'live';
            foreach (['gateway_public_key' => 'pk', 'gateway_secret_key' => 'sk'] as $field => $prefix) {
                $key = $this->input($field) ?: $settings?->{$field};
                if (! is_string($key) || ! str_starts_with($key, "{$prefix}_{$mode}_")) {
                    $validator->errors()->add($field, "Configura la llave de Culqi del ambiente {$mode}.");
                }
            }
            if (! $this->boolean('culqi_cards_enabled', $settings->culqi_cards_enabled ?? true) && ! $this->boolean('culqi_yape_enabled', $settings->culqi_yape_enabled ?? true)) {
                if (! $this->boolean('culqi_pagoefectivo_enabled', $settings->culqi_pagoefectivo_enabled ?? false)) {
                    $validator->errors()->add('culqi_cards_enabled', 'Activa tarjeta, Yape o PagoEfectivo para usar Culqi.');
                }
            }
            if ($this->boolean('izipay_enabled')) {
                $this->validateIzipay($validator);
            }
        }];
    }

    private function validateIzipay(Validator $validator): void
    {
        $settings = CompanySetting::query()->first();
        foreach (['izipay_merchant_code', 'izipay_public_key', 'izipay_api_username', 'izipay_api_password', 'izipay_hash_key'] as $field) {
            if (blank($this->input($field)) && blank($settings?->{$field})) {
                $validator->errors()->add($field, 'Completa esta credencial entregada por Izipay.');
            }
        }
    }
}
