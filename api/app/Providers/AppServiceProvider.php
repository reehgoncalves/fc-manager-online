<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Gate;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        ResetPassword::createUrlUsing(static function ($notifiable, string $token): string {
            return rtrim((string) config('services.frontend_url'), '/').'/reset-password?token='.urlencode($token).'&email='.urlencode($notifiable->getEmailForPasswordReset());
        });
        Gate::define('manage-platform', static fn (User $user): bool => $user->role === 'admin');
        RateLimiter::for('auth', static fn ($request) => Limit::perMinute(10)->by((string) $request->ip()));
        RateLimiter::for('purchase', static fn ($request) => Limit::perMinute(30)->by((string) ($request->user()?->id ?? $request->ip())));
        RateLimiter::for('webhook', static fn ($request) => Limit::perMinute(120)->by((string) $request->ip()));
        RateLimiter::for('match-actions', static fn ($request) => Limit::perMinute(120)->by((string) ($request->user()?->id ?? $request->ip())));
    }
}
