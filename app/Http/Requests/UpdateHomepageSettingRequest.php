<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateHomepageSettingRequest extends FormRequest
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
            'hero_overline' => ['required', 'string', 'max:120'],
            'hero_title' => ['required', 'string', 'max:80'],
            'hero_accent' => ['required', 'string', 'max:80'],
            'hero_description' => ['required', 'string', 'max:280'],
            'hero_primary_label' => ['required', 'string', 'max:50'],
            'hero_primary_url' => ['required', 'string', 'max:255', 'starts_with:/,#,https://'],
            'hero_secondary_label' => ['required', 'string', 'max:50'],
            'hero_secondary_url' => ['required', 'string', 'max:255', 'starts_with:/,#,https://'],
            'hero_image_path' => ['required', 'string', 'max:255', 'starts_with:/,https://'],
        ];
    }
}
