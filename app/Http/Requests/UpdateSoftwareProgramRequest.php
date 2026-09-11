<?php

namespace App\Http\Requests;

use App\Models\SoftwareProgram;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSoftwareProgramRequest extends FormRequest
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
        $program = $this->route('software_program');

        return ['name' => ['required', 'string', 'max:255'], 'slug' => ['required', 'alpha_dash', 'max:255', Rule::unique('software_programs')->ignore($program instanceof SoftwareProgram ? $program->id : null)], 'category' => ['required', 'string', 'max:60'], 'platform' => ['nullable', 'string', 'max:60'], 'version' => ['nullable', 'string', 'max:40'], 'license_type' => ['required', Rule::in(['free', 'paid', 'demo'])], 'price' => ['nullable', 'numeric', 'min:0'], 'short_description' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'requirements' => ['nullable', 'string'], 'is_own' => ['required', 'boolean'], 'is_featured' => ['required', 'boolean'], 'is_active' => ['required', 'boolean'], 'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'], 'program_file' => ['nullable', 'file', 'max:102400']];
    }
}
