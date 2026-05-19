<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'academic_program_id' => ['required', 'exists:academic_programs,id'],
            'professor_id'        => ['nullable', 'exists:users,id'],
            'name'                => ['required', 'string', 'max:255'],
            'description'         => ['nullable', 'string', 'max:1000'],
            'days_of_week'        => ['required', 'string'],
            'start_time'          => ['required', 'date_format:H:i'],
            'end_time'            => ['required', 'date_format:H:i', 'after:start_time'],
            'classroom'           => ['nullable', 'string', 'max:100'],
            'semester'            => ['nullable', 'string', 'max:50'],
            'max_students'        => ['required', 'integer', 'min:1', 'max:200'],
            'status'              => ['required', Rule::in(['active', 'inactive', 'completed'])],
        ];
    }

    public function messages(): array
    {
        return [
            'academic_program_id.required' => 'El programa académico es obligatorio',
            'academic_program_id.exists'   => 'El programa académico seleccionado no existe',
            'professor_id.exists'          => 'El profesor seleccionado no existe',
            'name.required'                => 'El nombre del horario es obligatorio',
            'name.max'                     => 'El nombre no puede superar los 255 caracteres',
            'days_of_week.required'        => 'Los días de la semana son obligatorios',
            'start_time.required'          => 'La hora de inicio es obligatoria',
            'start_time.date_format'       => 'La hora de inicio debe tener formato HH:MM',
            'end_time.required'            => 'La hora de fin es obligatoria',
            'end_time.date_format'         => 'La hora de fin debe tener formato HH:MM',
            'end_time.after'               => 'La hora de fin debe ser posterior a la hora de inicio',
            'max_students.required'        => 'El cupo máximo es obligatorio',
            'max_students.integer'         => 'El cupo máximo debe ser un número entero',
            'max_students.min'             => 'El cupo máximo debe ser al menos 1',
            'max_students.max'             => 'El cupo máximo no puede superar los 200 estudiantes',
            'status.required'              => 'El estado es obligatorio',
            'status.in'                    => 'El estado debe ser: activo, inactivo o completado',
        ];
    }
}
