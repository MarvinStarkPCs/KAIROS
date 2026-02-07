<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EnrollmentRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            // Datos del responsable
            'responsable.name' => ['required', 'string', 'max:255'],
            'responsable.last_name' => ['required', 'string', 'max:255'],
            'responsable.email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'responsable.document_type' => ['required', Rule::in(['TI', 'CC', 'CE', 'Pasaporte'])],
            'responsable.document_number' => ['required', 'string', 'max:50', 'unique:users,document_number'],
            'responsable.birth_place' => ['nullable', 'string', 'max:255'],
            'responsable.birth_date' => ['required', 'date', 'before:today'],
            'responsable.gender' => ['required', Rule::in(['M', 'F'])],
            'responsable.address' => ['required', 'string'],
            'responsable.neighborhood' => ['nullable', 'string', 'max:255'],
            'responsable.phone' => ['nullable', 'string', 'max:20'],
            'responsable.mobile' => ['required', 'string', 'max:20'],
            'responsable.city' => ['required', 'string', 'max:255'],
            'responsable.department' => ['required', 'string', 'max:255'],

            // Tipo de matrícula
            'is_minor' => ['required', 'boolean'],

            // Datos musicales del responsable (si es adulto)
            'responsable.plays_instrument' => ['nullable', 'required_if:is_minor,false', 'boolean'],
            'responsable.instruments_played' => ['nullable', 'string'],
            'responsable.has_music_studies' => ['nullable', 'required_if:is_minor,false', 'boolean'],
            'responsable.music_schools' => ['nullable', 'string'],
            'responsable.modality' => ['nullable', 'required_if:is_minor,false', Rule::in(['Linaje Kids', 'Linaje Teens', 'Linaje Big'])],
            'responsable.program_id' => ['nullable', 'required_if:is_minor,false', 'exists:academic_programs,id'],
            'responsable.schedule_id' => ['nullable', 'exists:schedules,id'],

            // Estudiantes (si es menor)
            'estudiantes' => [
                'required_if:is_minor,true',
                'array',
                function ($attribute, $value, $fail) {
                    // Solo validar min:1 si is_minor es true
                    if ($this->input('is_minor') === true || $this->input('is_minor') === 'true') {
                        if (!is_array($value) || count($value) < 1) {
                            $fail('Debe agregar al menos un estudiante');
                        }
                    }
                },
                'max:10'
            ],
            'estudiantes.*.name' => ['required', 'string', 'max:255'],
            'estudiantes.*.last_name' => ['required', 'string', 'max:255'],
            'estudiantes.*.email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'estudiantes.*.document_type' => ['required', Rule::in(['TI', 'CC', 'CE', 'Pasaporte'])],
            'estudiantes.*.document_number' => ['required', 'string', 'max:50', 'unique:users,document_number'],
            'estudiantes.*.birth_place' => ['nullable', 'string', 'max:255'],
            'estudiantes.*.birth_date' => ['required', 'date', 'before:today'],
            'estudiantes.*.gender' => ['required', Rule::in(['M', 'F'])],
            'estudiantes.*.datos_musicales.plays_instrument' => ['required', 'boolean'],
            'estudiantes.*.datos_musicales.instruments_played' => ['nullable', 'string'],
            'estudiantes.*.datos_musicales.has_music_studies' => ['required', 'boolean'],
            'estudiantes.*.datos_musicales.music_schools' => ['nullable', 'string'],
            'estudiantes.*.datos_musicales.modality' => ['required', Rule::in(['Linaje Kids', 'Linaje Teens', 'Linaje Big'])],
            'estudiantes.*.program_id' => ['required', 'exists:academic_programs,id'],
            'estudiantes.*.schedule_id' => ['nullable', 'exists:schedules,id'],

            // Autorizaciones
            'parental_authorization' => [
                function ($attribute, $value, $fail) {
                    if ($this->input('is_minor') == true) {
                        if (!$value || $value !== true) {
                            $fail('Debe aceptar la autorización parental para menores de edad.');
                        }
                    }
                },
            ],
            'payment_commitment' => ['required', 'accepted'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            // Responsable
            'responsable.name.required' => 'El nombre del responsable es obligatorio',
            'responsable.last_name.required' => 'Los apellidos del responsable son obligatorios',
            'responsable.email.required' => 'El correo electrónico es obligatorio',
            'responsable.email.unique' => 'Este correo electrónico ya está registrado',
            'responsable.document_number.required' => 'El número de documento es obligatorio',
            'responsable.document_number.unique' => 'Este número de documento ya está registrado',
            'responsable.birth_date.required' => 'La fecha de nacimiento es obligatoria',
            'responsable.birth_date.before' => 'La fecha de nacimiento debe ser anterior a hoy',
            'responsable.mobile.required' => 'El número de celular es obligatorio',
            'responsable.address.required' => 'La dirección es obligatoria',
            'responsable.city.required' => 'La ciudad es obligatoria',
            'responsable.department.required' => 'El departamento es obligatorio',

            // Datos musicales responsable
            'responsable.modality.required_if' => 'Debe seleccionar una modalidad',
            'responsable.program_id.required_if' => 'Debe seleccionar un programa académico',

            // Estudiantes
            'estudiantes.required_if' => 'Debe agregar al menos un estudiante',
            'estudiantes.min' => 'Debe agregar al menos un estudiante',
            'estudiantes.max' => 'No puede agregar más de 10 estudiantes',
            'estudiantes.*.name.required' => 'El nombre del estudiante es obligatorio',
            'estudiantes.*.last_name.required' => 'Los apellidos del estudiante son obligatorios',
            'estudiantes.*.email.unique' => 'Este correo electrónico ya está registrado',
            'estudiantes.*.document_number.required' => 'El número de documento del estudiante es obligatorio',
            'estudiantes.*.document_number.unique' => 'Este número de documento ya está registrado',
            'estudiantes.*.birth_date.required' => 'La fecha de nacimiento del estudiante es obligatoria',
            'estudiantes.*.birth_date.before' => 'La fecha de nacimiento debe ser anterior a hoy',
            'estudiantes.*.gender.required' => 'El género del estudiante es obligatorio',
            'estudiantes.*.datos_musicales.modality.required' => 'Debe seleccionar una modalidad para el estudiante',
            'estudiantes.*.program_id.required' => 'Debe seleccionar un programa académico para cada estudiante',

            // Autorizaciones
            'payment_commitment.accepted' => 'Debe aceptar el compromiso de pago',
            'parental_authorization.accepted' => 'Debe aceptar la autorización parental',
        ];
    }
}
