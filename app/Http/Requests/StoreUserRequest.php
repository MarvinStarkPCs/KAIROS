<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'name'            => 'required|string|max:255',
            'last_name'       => 'nullable|string|max:255',
            'email'           => 'required|email|unique:users',
            'password'        => ['required', 'confirmed', Password::defaults()],
            'roles'           => 'array',
            'document_type'   => 'nullable|in:CC,TI,CE,Pasaporte',
            'document_number' => 'nullable|string|max:50',
            'birth_date'      => 'nullable|date',
            'gender'          => 'nullable|in:M,F',
            'mobile'          => 'nullable|string|max:20',
        ];
    }
}
