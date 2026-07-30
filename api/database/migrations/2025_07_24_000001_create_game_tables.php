<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table): void { $table->id(); $table->string('external_id')->unique(); $table->string('name'); $table->string('short_name')->nullable(); $table->string('country')->nullable(); $table->string('flag_url')->nullable(); $table->string('logo_url')->nullable(); $table->unsignedSmallInteger('rating')->default(0); $table->timestamps(); });
        Schema::create('players', function (Blueprint $table): void { $table->id(); $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete(); $table->string('external_id')->unique(); $table->string('name'); $table->string('role', 8); $table->string('club_name'); $table->string('avatar_url')->nullable(); $table->unsignedSmallInteger('rating'); $table->unsignedBigInteger('price_cents'); $table->string('tier', 20)->index(); $table->boolean('is_extreme')->default(false)->index(); $table->boolean('is_listed')->default(true)->index(); $table->jsonb('stats')->nullable(); $table->jsonb('tags')->nullable(); $table->timestamps(); });
        Schema::create('wallets', function (Blueprint $table): void { $table->id(); $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete(); $table->unsignedBigInteger('balance')->default(0); $table->timestamps(); });
        Schema::create('wallet_transactions', function (Blueprint $table): void { $table->id(); $table->foreignId('wallet_id')->constrained()->cascadeOnDelete(); $table->string('type', 30); $table->bigInteger('amount'); $table->string('reference')->nullable()->index(); $table->jsonb('metadata')->nullable(); $table->timestamps(); });
        Schema::create('orders', function (Blueprint $table): void { $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->string('kind', 20); $table->string('status', 20)->default('pending')->index(); $table->unsignedBigInteger('total_cents'); $table->jsonb('payload'); $table->string('provider_reference')->nullable()->unique(); $table->timestamp('paid_at')->nullable(); $table->timestamps(); });
    }
    public function down(): void { Schema::dropIfExists('orders'); Schema::dropIfExists('wallet_transactions'); Schema::dropIfExists('wallets'); Schema::dropIfExists('players'); Schema::dropIfExists('teams'); }
};
