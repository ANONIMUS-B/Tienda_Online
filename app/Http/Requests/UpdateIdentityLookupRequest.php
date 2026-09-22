<?php

namespace App\Http\Requests;

use App\Models\CompanySetting;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateIdentityLookupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->canAccessAdministration() === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'identity_lookup_enabled' => ['required', 'boolean'],
            'identity_lookup_provider' => ['required', 'in:decolecta'],
            'identity_lookup_token' => ['nullable', 'string', 'max:2000'],
            'forget_token' => ['nullable', 'boolean'],
        ];
    }

    /** @return array<\Closure> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($this->boolean('identity_lookup_enabled') && ($this->boolean('forget_token') || (blank($this->input('identity_lookup_token')) && blank(CompanySetting::query()->first()?->identity_lookup_token)))) {
                $validator->errors()->add('identity_lookup_token', 'Configura un token antes de activar las consultas.');
            }
        }];
    }
}
