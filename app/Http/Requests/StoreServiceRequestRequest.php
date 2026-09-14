<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'service_type' => ['required', 'string', 'max:60'],
            'device' => ['nullable', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'priority' => ['required', 'in:normal,urgent'],
            'description' => ['required', 'string', 'min:15', 'max:3000'],
        ];
    }
}
