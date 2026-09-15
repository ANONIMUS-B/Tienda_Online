<?php

namespace App\Http\Requests;

use App\Models\SoftwareProgram;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSoftwareProgramRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(['download_enabled' => $this->boolean('download_enabled')]);
    }

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $program = $this->route('software_program');

        return [
            'name' => ['required', 'string', 'max:255'], 'slug' => ['required', 'alpha_dash', 'max:255', Rule::unique('software_programs')->ignore($program instanceof SoftwareProgram ? $program->id : null)],
            'category' => ['required', 'string', 'max:60'], 'platform' => ['nullable', 'string', 'max:60'], 'version' => ['nullable', 'string', 'max:40'],
            'license_type' => ['required', Rule::in(['free', 'paid'])], 'price' => ['prohibited'],
            'short_description' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'requirements' => ['nullable', 'string'],
            'installation_instructions' => ['nullable', 'string'], 'tutorial_url' => ['nullable', 'url:http,https', 'max:255'],
            'download_url' => ['required', 'url:http,https', 'max:2048'], 'download_enabled' => ['required', 'boolean'],
            'is_own' => ['required', 'boolean'], 'is_featured' => ['required', 'boolean'], 'is_active' => ['required', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'], 'program_file' => ['nullable', 'file', 'max:102400'],
        ];
    }
}
