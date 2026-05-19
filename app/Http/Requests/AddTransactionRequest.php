<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'amount'         => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|max:50',
            'notes'          => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required'         => 'El monto del abono es obligatorio',
            'amount.numeric'          => 'El monto debe ser un número',
            'amount.min'              => 'El monto debe ser mayor a 0',
            'payment_method.required' => 'El método de pago es obligatorio',
        ];
    }
}
