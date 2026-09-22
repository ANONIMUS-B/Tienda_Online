<?php

namespace App\Http\Requests;

use App\Models\CompanySetting;
use App\Services\CulqiGateway;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreManualOrderRequest extends FormRequest
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
            'receipt_type' => ['required', 'in:boleta,factura'],
            'document_type' => ['required', 'in:dni,ruc,none'],
            'document_number' => ['nullable', 'required_unless:document_type,none', 'prohibited_if:document_type,none', $this->input('document_type') === 'ruc' ? 'digits:11' : 'digits:8'],
            'customer_name' => ['required_unless:document_type,none', 'nullable', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'address' => ['required_if:receipt_type,factura', 'nullable', 'string', 'max:255'],
            'payment_method' => ['required', 'in:yape,bank_transfer,cash_on_delivery,gateway'],
            'payment_status' => ['required', 'in:pending,paid'],
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'requires_identification' => ['required', 'boolean'],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:10000'],
            'items.*.unit_price' => ['required', 'numeric', 'decimal:0,2', 'min:0.01', 'max:999999.99'],
        ];
    }

    /** @return array<\Closure> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            $totalCents = collect($this->array('items'))->sum(fn (array $item): int => (int) round((float) $item['unit_price'] * 100) * (int) $item['quantity']);
            if ($this->input('payment_method') === 'gateway') {
                $settings = CompanySetting::query()->first();
                if (! app(CulqiGateway::class)->ready($settings)) {
                    $validator->errors()->add('payment_method', 'Configura y activa Culqi en Empresa y pagos.');
                }
                if ($this->input('payment_status') !== 'pending') {
                    $validator->errors()->add('payment_status', 'El pago Culqi debe quedar pendiente hasta su confirmación.');
                }
                if (blank($this->input('customer_email')) || strlen((string) $this->input('customer_email')) > 50) {
                    $validator->errors()->add('customer_email', 'Culqi requiere el correo del cliente (máximo 50 caracteres).');
                }
                $maximum = app(CulqiGateway::class)->maximumAmount($settings);
                if ($totalCents < 300 || $totalCents > $maximum) {
                    $validator->errors()->add('items', 'El importe no está permitido por los medios Culqi habilitados. Mínimo S/ 3; máximo S/ '.($maximum / 100).'.');
                }
            }
            if ($totalCents > 99999999999) {
                $validator->errors()->add('items', 'El total supera el importe permitido.');
            }
            if ($this->input('receipt_type') === 'factura' && $this->input('document_type') !== 'ruc') {
                $validator->errors()->add('document_type', 'Para emitir factura debes seleccionar RUC.');
            }
            if ($this->input('document_type') === 'none' && ($totalCents > 70000 || $this->boolean('requires_identification'))) {
                $validator->errors()->add('document_number', 'Debes identificar al cliente si la boleta supera S/ 700 o la operación requiere identificación.');
            }
        }];
    }
}
