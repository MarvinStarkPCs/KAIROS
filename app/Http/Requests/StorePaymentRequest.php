<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'student_id'       => 'required|exists:users,id',
            'program_id'       => 'nullable|exists:academic_programs,id',
            'enrollment_id'    => 'nullable|exists:enrollments,id',
            'concept'          => 'required|string|max:255',
            'payment_type'     => 'nullable|in:single,partial',
            'amount'           => 'required|numeric|min:0',
            'due_date'         => 'required|date',
            'status'           => 'required|in:pending,completed,overdue,cancelled',
            'payment_method'   => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes'            => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.required'    => 'El estudiante es obligatorio',
            'student_id.exists'      => 'El estudiante seleccionado no existe',
            'program_id.exists'      => 'El programa seleccionado no existe',
            'enrollment_id.exists'   => 'La inscripción seleccionada no existe',
            'concept.required'       => 'El concepto del pago es obligatorio',
            'concept.max'            => 'El concepto no puede exceder 255 caracteres',
            'amount.required'        => 'El monto es obligatorio',
            'amount.numeric'         => 'El monto debe ser un número',
            'amount.min'             => 'El monto debe ser mayor o igual a 0',
            'due_date.required'      => 'La fecha de vencimiento es obligatoria',
            'due_date.date'          => 'La fecha debe ser válida',
            'status.required'        => 'El estado es obligatorio',
            'status.in'              => 'El estado debe ser: pendiente, completado, vencido o cancelado',
            'payment_method.max'     => 'El método de pago no puede exceder 50 caracteres',
            'reference_number.max'   => 'El número de referencia no puede exceder 100 caracteres',
            'notes.max'              => 'Las notas no pueden exceder 500 caracteres',
        ];
    }
}
