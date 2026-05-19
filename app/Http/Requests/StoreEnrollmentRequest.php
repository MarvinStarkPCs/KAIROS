<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'student_id'      => ['required', 'exists:users,id'],
            'program_id'      => ['required', 'exists:academic_programs,id'],
            'schedule_id'     => ['nullable', 'exists:schedules,id'],
            'enrollment_date' => ['nullable', 'date'],
            'status'          => ['required', Rule::in(['active', 'waiting', 'withdrawn'])],
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.required'  => 'El estudiante es obligatorio',
            'student_id.exists'    => 'El estudiante seleccionado no existe',
            'program_id.required'  => 'El programa académico es obligatorio',
            'program_id.exists'    => 'El programa académico seleccionado no existe',
            'schedule_id.exists'   => 'El horario seleccionado no existe',
            'enrollment_date.date' => 'La fecha de inscripción debe ser una fecha válida',
            'status.required'      => 'El estado es obligatorio',
            'status.in'            => 'El estado debe ser: activo, en espera o retirado',
        ];
    }
}
