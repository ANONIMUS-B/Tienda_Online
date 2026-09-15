<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateElectronicBillingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessAdministration() === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'billing_enabled' => ['required', 'boolean'], 'billing_mode' => ['required', Rule::in(['api', 'certificate'])],
            'billing_environment' => ['required', Rule::in(['demo', 'production'])], 'billing_provider' => ['required_if:billing_enabled,1', 'nullable', Rule::in(['apisunat'])],
            'billing_ruc' => ['required_if:billing_enabled,1', 'nullable', 'digits:11'], 'billing_api_url' => ['required_if:billing_enabled,1', 'nullable', 'url:http,https', Rule::in(['https://sandbox.apisunat.pe', 'https://app.apisunat.pe'])],
            'billing_api_token' => ['nullable', 'string', 'max:2000'], 'billing_certificate' => ['nullable', 'file', 'mimes:p12,pfx', 'max:4096'],
            'billing_certificate_password' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $expectedUrl = $this->input('billing_environment') === 'production'
                ? 'https://app.apisunat.pe'
                : 'https://sandbox.apisunat.pe';
            if ($this->boolean('billing_enabled') && rtrim((string) $this->input('billing_api_url'), '/') !== $expectedUrl) {
                $validator->errors()->add('billing_api_url', "La URL debe ser {$expectedUrl} para el ambiente seleccionado.");
            }
        }];
    }
}
