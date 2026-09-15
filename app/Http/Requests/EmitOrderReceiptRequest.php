<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class EmitOrderReceiptRequest extends FormRequest
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
            'receipt_type' => ['required', 'in:boleta,factura,sales_note'],
            'send_email' => ['nullable', 'boolean'],
            'send_system' => ['nullable', 'boolean'],
            'open_whatsapp' => ['nullable', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $order = $this->route('order');
            if ($order?->payment_status !== 'paid') {
                $validator->errors()->add('receipt_type', 'Primero debes marcar el pedido como pagado.');
            }
            if ($this->input('receipt_type') === 'factura' && ! preg_match('/^\d{11}$/', (string) $order?->document_number)) {
                $validator->errors()->add('receipt_type', 'Para emitir factura el cliente debe tener un RUC válido de 11 dígitos.');
            }
        }];
    }
}
