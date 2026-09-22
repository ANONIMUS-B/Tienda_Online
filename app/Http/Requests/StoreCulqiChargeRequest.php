<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCulqiChargeRequest extends FormRequest
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
            'source_id' => ['required', 'string', 'regex:/^(tkn|ype)_(test|live)_[a-zA-Z0-9]+$/', 'max:100'],
            'email' => ['required', 'email', 'max:50'],
            'device_id' => [Rule::requiredIf(! str_starts_with((string) $this->input('source_id'), 'ype_')), 'nullable', 'string', 'max:100'],
            'authentication_3DS' => ['sometimes', 'array:eci,xid,cavv,protocolVersion,directoryServerTransactionId'],
            'authentication_3DS.eci' => ['required_with:authentication_3DS', 'string', 'max:10'],
            'authentication_3DS.xid' => ['required_with:authentication_3DS', 'string', 'max:255'],
            'authentication_3DS.cavv' => ['required_with:authentication_3DS', 'string', 'max:255'],
            'authentication_3DS.protocolVersion' => ['required_with:authentication_3DS', 'string', 'max:20'],
            'authentication_3DS.directoryServerTransactionId' => ['required_with:authentication_3DS', 'string', 'max:100'],
        ];
    }
}
