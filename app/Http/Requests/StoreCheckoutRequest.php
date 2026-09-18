<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckoutRequest extends FormRequest
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
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'document_number' => ['nullable', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'],
            'shipping_method' => ['required', Rule::in(['delivery', 'store_pickup'])],
            'payment_method' => ['required', Rule::in(['yape', 'bank_transfer', 'cash_on_delivery', 'gateway'])],
            'payment_reference' => ['nullable', 'string', 'max:50'],
            'payment_receipt' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
