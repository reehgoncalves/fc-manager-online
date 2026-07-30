<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_register_login_and_logout(): void
    {
        $this->postJson('/api/v1/auth/register', ['name' => 'Manager Teste', 'email' => 'manager@example.com', 'password' => 'SenhaForte1', 'password_confirmation' => 'SenhaForte1'])->assertCreated()->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
        $login = $this->postJson('/api/v1/auth/login', ['email' => 'manager@example.com', 'password' => 'SenhaForte1'])->assertOk()->json('token');
        $this->withHeader('Authorization', 'Bearer '.$login)->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('user.email', 'manager@example.com');
        $this->withHeader('Authorization', 'Bearer '.$login)->deleteJson('/api/v1/auth/logout')->assertOk();
    }

    public function test_invalid_password_is_rejected_without_leaking_account_state(): void
    {
        User::create(['name' => 'Manager Teste', 'email' => 'manager@example.com', 'password' => Hash::make('SenhaForte1'), 'role' => 'manager', 'status' => 'active']);
        $this->postJson('/api/v1/auth/login', ['email' => 'manager@example.com', 'password' => 'errada'])->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }
}
