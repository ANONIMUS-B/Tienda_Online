<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class EmitServiceReceiptRequest extends FormRequest
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
        return ['receipt_type' => ['required', 'in:boleta,factura']];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $serviceRequest = $this->route('serviceRequest');
            if ($serviceRequest?->payment_status !== 'paid' || ! $serviceRequest?->quoted_amount) {
                $validator->errors()->add('receipt_type', 'El servicio debe tener un importe y figurar como pagado.');
            }
            if ($this->input('receipt_type') === 'factura' && ! preg_match('/^\d{11}$/', (string) $serviceRequest?->user?->document_number)) {
                $validator->errors()->add('receipt_type', 'Para emitir factura el cliente debe tener un RUC válido de 11 dígitos.');
            }
        }];
    }
}
