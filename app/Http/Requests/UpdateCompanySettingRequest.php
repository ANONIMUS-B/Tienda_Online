<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'yape_number' => ['nullable', 'string', 'max:30'],
            'bank_name' => ['nullable', 'string', 'max:120'],
            'bank_account' => ['nullable', 'string', 'max:120'],
            'whatsapp_checkout_enabled' => ['required', 'boolean'],
        ];
    }
}
