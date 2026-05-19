<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $userId = $this->route('usuario')?->id ?? $this->route('user')?->id;

        return [
            'name'            => 'required|string|max:255',
            'last_name'       => 'nullable|string|max:255',
            'email'           => ['required', 'email', Rule::unique('users')->ignore($userId)],
            'password'        => ['nullable', 'confirmed', Password::defaults()],
            'roles'           => 'array',
            'document_type'   => 'nullable|in:CC,TI,CE,Pasaporte',
            'document_number' => 'nullable|string|max:50',
            'birth_date'      => 'nullable|date',
            'birth_place'     => 'nullable|string|max:255',
            'gender'          => 'nullable|in:M,F',
            'phone'           => 'nullable|string|max:20',
            'mobile'          => 'nullable|string|max:20',
            'address'         => 'nullable|string|max:255',
            'neighborhood'    => 'nullable|string|max:255',
            'city'            => 'nullable|string|max:255',
            'department'      => 'nullable|string|max:255',
            // Perfil de estudiante
            'student_profile'                          => 'nullable|array',
            'student_profile.modality'                 => 'nullable|in:Linaje Kids,Linaje Teens,Linaje Big',
            'student_profile.desired_instrument'       => 'nullable|string|max:255',
            'student_profile.plays_instrument'         => 'nullable|boolean',
            'student_profile.instruments_played'       => 'nullable|string',
            'student_profile.has_music_studies'        => 'nullable|boolean',
            'student_profile.music_schools'            => 'nullable|string',
            'student_profile.current_level'            => 'nullable|integer|min:1|max:10',
            'student_profile.emergency_contact_name'   => 'nullable|string|max:255',
            'student_profile.emergency_contact_phone'  => 'nullable|string|max:20',
            'student_profile.medical_conditions'       => 'nullable|string',
            'student_profile.allergies'                => 'nullable|string',
            // Perfil de profesor
            'teacher_profile'                    => 'nullable|array',
            'teacher_profile.instruments_played' => 'nullable|string',
            'teacher_profile.music_schools'      => 'nullable|string',
            'teacher_profile.experience_years'   => 'nullable|integer|min:0|max:50',
            'teacher_profile.bio'                => 'nullable|string',
            'teacher_profile.specialization'     => 'nullable|string|max:255',
            'teacher_profile.hourly_rate'        => 'nullable|numeric|min:0',
            'teacher_profile.is_active'          => 'nullable|boolean',
        ];
    }
}
