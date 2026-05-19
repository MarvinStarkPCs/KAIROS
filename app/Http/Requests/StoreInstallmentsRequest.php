<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInstallmentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'student_id'             => 'required|exists:users,id',
            'program_id'             => 'nullable|exists:academic_programs,id',
            'enrollment_id'          => 'nullable|exists:enrollments,id',
            'concept'                => 'required|string|max:255',
            'total_amount'           => 'required|numeric|min:0',
            'number_of_installments' => 'required|integer|min:2|max:12',
            'start_date'             => 'required|date',
            'modality'               => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.required'             => 'El estudiante es obligatorio',
            'student_id.exists'               => 'El estudiante seleccionado no existe',
            'concept.required'                => 'El concepto es obligatorio',
            'total_amount.required'           => 'El monto total es obligatorio',
            'total_amount.numeric'            => 'El monto debe ser un número',
            'total_amount.min'                => 'El monto debe ser mayor a 0',
            'number_of_installments.required' => 'El número de cuotas es obligatorio',
            'number_of_installments.integer'  => 'El número de cuotas debe ser un entero',
            'number_of_installments.min'      => 'Debe haber al menos 2 cuotas',
            'number_of_installments.max'      => 'No puede haber más de 12 cuotas',
            'start_date.required'             => 'La fecha de inicio es obligatoria',
            'start_date.date'                 => 'La fecha debe ser válida',
        ];
    }
}
