<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, CanResetPassword;
    protected $fillable = ['name', 'email', 'password', 'role', 'referral_code', 'team_id', 'status', 'last_login_at'];
    protected $hidden = ['password', 'remember_token'];
    protected function casts(): array { return ['email_verified_at' => 'datetime', 'last_login_at' => 'datetime']; }
    public function wallet(): HasOne { return $this->hasOne(Wallet::class); }
    public function team(): BelongsTo { return $this->belongsTo(Team::class); }
    public function orders(): HasMany { return $this->hasMany(Order::class); }
    public function players(): BelongsToMany { return $this->belongsToMany(Player::class, 'manager_players')->withTimestamps(); }
}
