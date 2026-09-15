<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
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
            'status' => ['required', Rule::in(['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'])],
            'payment_status' => ['required', Rule::in(['pending', 'paid', 'failed', 'refunded'])],
            'receipt_type' => ['sometimes', Rule::in(['boleta', 'factura', 'sales_note'])],
            'receipt_status' => ['sometimes', Rule::in(['pending', 'issued', 'accepted', 'sent', 'rejected'])],
            'receipt_series' => ['nullable', 'string', 'max:10'],
            'receipt_number' => ['nullable', 'string', 'max:20'],
            'receipt_url' => ['nullable', 'url', 'max:255'],
        ];
    }
}
