<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Exception;

class PasswordResetController extends Controller
{
    /**
     * Send a password reset link to the given user.
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Alamat email tidak terdaftar di sistem kami.'
            ], 404);
        }

        // Generate token using password broker
        $token = Password::broker()->createToken($user);

        // Generate the frontend reset link URL
        $resetUrl = config('app.frontend_url', 'http://localhost:5173') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

        try {
            // Send the email (which will be logged in storage/logs/laravel.log when MAIL_MAILER=log)
            Mail::raw("Halo {$user->name},\n\nAnda menerima email ini karena kami menerima permintaan penyetelan ulang kata sandi untuk akun Anda.\n\nSilakan klik tautan di bawah ini untuk menyetel ulang kata sandi Anda:\n{$resetUrl}\n\nTautan ini akan kedaluwarsa dalam 60 menit.\n\nJika Anda tidak meminta penyetelan ulang kata sandi, abaikan email ini.\n\nSalam,\nDectScam AI Team", function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Reset Kata Sandi Akun - DectScam AI');
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Tautan penyetelan ulang kata sandi telah dikirim ke email Anda.'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim email penyetelan ulang kata sandi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset the user's password.
     */
    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        // Reset password using broker
        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'status' => 'success',
                'message' => 'Kata sandi Anda berhasil disetel ulang.'
            ], 200);
        }

        // Map status to Indonesian translation
        $messages = [
            Password::INVALID_USER => 'Alamat email tidak ditemukan.',
            Password::INVALID_TOKEN => 'Token penyetelan ulang kata sandi tidak valid atau telah kedaluwarsa.',
            Password::RESET_THROTTLED => 'Terlalu banyak permintaan reset. Harap tunggu beberapa saat.',
        ];

        $message = $messages[$status] ?? __($status);

        // Return error message based on the status key returned by the broker
        return response()->json([
            'status' => 'error',
            'message' => $message
        ], 400);
    }
}
