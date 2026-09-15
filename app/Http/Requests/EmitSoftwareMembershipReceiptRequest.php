<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class EmitSoftwareMembershipReceiptRequest extends FormRequest
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
            $membership = $this->route('softwareMembership');
            if ($membership?->status !== 'active') {
                $validator->errors()->add('receipt_type', 'Primero debes confirmar el pago y activar la membresía.');
            }
            if ($this->input('receipt_type') === 'factura' && ! preg_match('/^\d{11}$/', (string) $membership?->user?->document_number)) {
                $validator->errors()->add('receipt_type', 'Para emitir factura el cliente debe tener un RUC válido de 11 dígitos.');
            }
        }];
    }
}
