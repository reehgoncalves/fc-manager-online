<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table): void { $table->id(); $table->string('name'); $table->string('category', 20); $table->string('element', 20); $table->unsignedSmallInteger('power'); $table->string('effect'); $table->unsignedBigInteger('price_cents'); $table->string('icon', 8)->nullable(); $table->timestamps(); });
        Schema::create('manager_players', function (Blueprint $table): void { $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->foreignId('player_id')->constrained()->cascadeOnDelete(); $table->timestamps(); $table->primary(['user_id', 'player_id']); });
        Schema::create('player_items', function (Blueprint $table): void { $table->foreignId('player_id')->constrained()->cascadeOnDelete(); $table->foreignId('item_id')->constrained()->cascadeOnDelete(); $table->timestamp('equipped_at')->nullable(); $table->timestamps(); $table->primary(['player_id', 'item_id']); });
        Schema::create('manager_rankings', function (Blueprint $table): void { $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->string('season', 10); $table->string('scope', 20)->default('global'); $table->unsignedInteger('rank'); $table->unsignedInteger('points'); $table->unsignedSmallInteger('wins')->default(0); $table->unsignedSmallInteger('matches')->default(0); $table->string('division', 30)->nullable(); $table->timestamps(); $table->unique(['user_id', 'season', 'scope']); $table->index(['season', 'scope', 'rank']); });
        Schema::create('referrals', function (Blueprint $table): void { $table->id(); $table->foreignId('inviter_id')->constrained('users')->cascadeOnDelete(); $table->foreignId('invitee_id')->nullable()->constrained('users')->nullOnDelete(); $table->string('code', 32)->unique(); $table->string('status', 20)->default('sent'); $table->unsignedBigInteger('inviter_reward')->default(3000); $table->unsignedBigInteger('invitee_reward')->default(2000); $table->timestamp('completed_at')->nullable(); $table->timestamps(); });
    }
    public function down(): void { Schema::dropIfExists('referrals'); Schema::dropIfExists('manager_rankings'); Schema::dropIfExists('player_items'); Schema::dropIfExists('manager_players'); Schema::dropIfExists('items'); }
};
