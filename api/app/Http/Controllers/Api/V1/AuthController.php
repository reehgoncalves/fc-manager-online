<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

final class AuthController
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'min:2', 'max:80'], 'email' => ['required', 'email:rfc,dns', 'max:160', 'unique:users,email'], 'password' => ['required', 'confirmed', 'min:8', 'regex:/[A-Z]/', 'regex:/[a-z]/', 'regex:/\d/']]);
        $user = User::create(['name' => $data['name'], 'email' => mb_strtolower($data['email']), 'password' => Hash::make($data['password']), 'role' => 'manager', 'status' => 'active', 'referral_code' => strtoupper(str()->random(10))]);
        $user->wallet()->create(['balance' => (int) config('game.initial_fc', 25000)]);
        event(new Registered($user));
        return $this->tokenResponse($user, 'account-created', 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string'], 'device_name' => ['nullable', 'string', 'max:100']]);
        $user = User::query()->where('email', mb_strtolower($data['email']))->first();
        if (! $user || ! Hash::check($data['password'], $user->password) || $user->status !== 'active') {
            throw ValidationException::withMessages(['email' => 'As credenciais informadas são inválidas.']);
        }
        $user->forceFill(['last_login_at' => now()])->save();
        return $this->tokenResponse($user, $data['device_name'] ?? 'web');
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()->load(['team', 'wallet']), 'wallet' => $request->user()->wallet]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'Sessão encerrada.']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);
        Password::sendResetLink(['email' => mb_strtolower($data['email'])]);
        return response()->json(['message' => 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate(['token' => ['required', 'string'], 'email' => ['required', 'email'], 'password' => ['required', 'confirmed', 'min:8', 'regex:/[A-Z]/', 'regex:/[a-z]/', 'regex:/\d/']]);
        $status = Password::reset(['email' => mb_strtolower($data['email']), 'password' => $data['password'], 'password_confirmation' => $data['password_confirmation'], 'token' => $data['token']], static function (User $user, string $password): void {
            $user->forceFill(['password' => Hash::make($password), 'remember_token' => null])->save();
            $user->tokens()->delete();
        });
        if ($status !== Password::PASSWORD_RESET) throw ValidationException::withMessages(['email' => 'O link de recuperação é inválido ou expirou.']);
        return response()->json(['message' => 'Senha redefinida. Faça login novamente.']);
    }

    private function tokenResponse(User $user, string $device, int $status = 200): JsonResponse
    {
        return response()->json(['token' => $user->createToken($device)->plainTextToken, 'user' => $user->load(['team', 'wallet'])], $status);
    }
}
