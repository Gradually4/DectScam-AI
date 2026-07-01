<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Exception;

class ProfileController extends Controller
{
    /**
     * Update the user's name and email.
     */
    public function updateInfo(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'profile_photo_path' => $user->profile_photo_path,
                    'profile_photo_url' => $user->profile_photo_path ? asset('storage/' . $user->profile_photo_path) : null,
                ]
            ]
        ], 200);
    }

    /**
     * Update the user's profile photo.
     */
    public function updatePhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = $request->user();

        try {
            if ($request->hasFile('photo')) {
                // Delete old photo if exists
                if ($user->profile_photo_path && Storage::disk('public')->exists($user->profile_photo_path)) {
                    Storage::disk('public')->delete($user->profile_photo_path);
                }

                // Store new photo in public/profile_photos directory
                $path = $request->file('photo')->store('profile_photos', 'public');

                $user->profile_photo_path = $path;
                $user->save();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Foto profil berhasil diperbarui.',
                    'data' => [
                        'profile_photo_path' => $path,
                        'profile_photo_url' => asset('storage/' . $path),
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'role' => $user->role,
                            'profile_photo_path' => $user->profile_photo_path,
                            'profile_photo_url' => asset('storage/' . $path),
                        ]
                    ]
                ], 200);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'File foto tidak ditemukan.'
            ], 400);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengunggah foto profil: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kata sandi saat ini tidak cocok.'
            ], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Kata sandi berhasil diperbarui.'
        ], 200);
    }

    /**
     * Get reports created by the authenticated user.
     */
    public function getUserReports(Request $request)
    {
        $user = $request->user();
        $reports = $user->reports()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'reports' => $reports
            ]
        ], 200);
    }
}
