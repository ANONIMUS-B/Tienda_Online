<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequestRequest extends FormRequest
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
            'status' => ['required', 'in:pending,in_review,waiting_customer,resolved,closed'],
            'admin_response' => ['required', 'string', 'min:5', 'max:3000'],
            'quoted_amount' => ['nullable', 'numeric', 'min:0.01', 'max:999999999.99'],
            'payment_status' => ['required', 'in:pending,paid,refunded'],
            'receipt_type' => ['required', 'in:boleta,factura'],
        ];
    }
}
