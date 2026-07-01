<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UrlDetectionRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'url' => [
                'required',
                // Custom Regex to validate URLs (supports IPv4, domains without TLD requirements, ports, and paths)
                'regex:/^https?:\/\/(?:(?:\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9][-a-zA-Z0-9]*[a-zA-Z0-9](?:\.[a-zA-Z0-9][-a-zA-Z0-9]*[a-zA-Z0-9])*|localhost)(?::\d+)?(?:\/[^\s]*)?$/i'
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'url.required' => 'URL tautan wajib diisi.',
            'url.regex' => 'Format URL tidak valid. Pastikan diawali dengan http:// atau https://.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status' => 'error',
            'message' => 'Validasi gagal.',
            'errors' => $validator->errors()
        ], 422));
    }
}
