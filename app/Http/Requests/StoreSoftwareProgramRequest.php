<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSoftwareProgramRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(['download_enabled' => $this->boolean('download_enabled')]);
    }

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
        return $this->programRules(true);
    }

    /** @return array<string, mixed> */
    protected function programRules(bool $requireFile): array
    {
        return ['name' => ['required', 'string', 'max:255'], 'slug' => ['required', 'alpha_dash', 'max:255', 'unique:software_programs,slug'], 'category' => ['required', 'string', 'max:60'], 'platform' => ['nullable', 'string', 'max:60'], 'version' => ['nullable', 'string', 'max:40'], 'license_type' => ['required', Rule::in(['free', 'paid', 'demo'])], 'price' => ['nullable', 'numeric', 'min:0'], 'short_description' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'requirements' => ['nullable', 'string'], 'installation_instructions' => ['nullable', 'string'], 'tutorial_url' => ['nullable', 'url', 'max:255'], 'download_enabled' => ['required', 'boolean'], 'is_own' => ['required', 'boolean'], 'is_featured' => ['required', 'boolean'], 'is_active' => ['required', 'boolean'], 'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'], 'program_file' => [$requireFile ? 'required' : 'nullable', 'file', 'max:102400']];
    }
}
