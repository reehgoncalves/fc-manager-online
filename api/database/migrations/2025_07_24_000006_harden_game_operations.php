<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', static function (Blueprint $table): void {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        if (! Schema::hasTable('personal_access_tokens')) {
            Schema::create('personal_access_tokens', static function (Blueprint $table): void {
                $table->id();
                $table->morphs('tokenable');
                $table->string('name');
                $table->string('token', 64)->unique();
                $table->text('abilities')->nullable();
                $table->timestamp('last_used_at')->nullable();
                $table->timestamp('expires_at')->nullable()->index();
                $table->timestamps();
            });
        }

        Schema::table('users', static function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'team_id')) $table->foreignId('team_id')->nullable()->after('password')->constrained('teams')->nullOnDelete();
            if (! Schema::hasColumn('users', 'status')) $table->string('status', 20)->default('active')->index();
            if (! Schema::hasColumn('users', 'last_login_at')) $table->timestamp('last_login_at')->nullable();
        });

        Schema::table('teams', static function (Blueprint $table): void {
            if (! Schema::hasColumn('teams', 'price_fc')) $table->unsignedBigInteger('price_fc')->default(0)->after('rating');
        });

        Schema::table('players', static function (Blueprint $table): void {
            if (! Schema::hasColumn('players', 'price_fc')) $table->unsignedBigInteger('price_fc')->default(0)->after('price_cents');
            if (! Schema::hasColumn('players', 'version')) $table->unsignedBigInteger('version')->default(1)->index();
        });

        Schema::table('items', static function (Blueprint $table): void {
            if (! Schema::hasColumn('items', 'price_fc')) $table->unsignedBigInteger('price_fc')->default(0)->after('price_cents');
            if (! Schema::hasColumn('items', 'version')) $table->unsignedBigInteger('version')->default(1)->index();
        });

        Schema::table('orders', static function (Blueprint $table): void {
            if (! Schema::hasColumn('orders', 'payment_method')) $table->string('payment_method', 20)->default('pix')->after('kind');
            if (! Schema::hasColumn('orders', 'idempotency_key')) $table->string('idempotency_key', 80)->nullable()->after('payload');
            if (! Schema::hasColumn('orders', 'metadata')) $table->jsonb('metadata')->nullable()->after('payload');
            if (! Schema::hasColumn('orders', 'settled_by')) $table->foreignId('settled_by')->nullable()->after('paid_at')->constrained('users')->nullOnDelete();
        });
        Schema::table('orders', static function (Blueprint $table): void { $table->unique(['user_id', 'idempotency_key'], 'orders_user_id_idempotency_unique'); });

        Schema::table('wallet_transactions', static function (Blueprint $table): void {
            if (! Schema::hasColumn('wallet_transactions', 'idempotency_key')) $table->string('idempotency_key', 80)->nullable()->after('reference');
            if (! Schema::hasColumn('wallet_transactions', 'balance_after')) $table->unsignedBigInteger('balance_after')->nullable()->after('amount');
        });
        Schema::table('wallet_transactions', static function (Blueprint $table): void { $table->unique(['wallet_id', 'idempotency_key'], 'wallet_transactions_wallet_id_idempotency_unique'); });

        if (! Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', static function (Blueprint $table): void {
                $table->id();
                $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('action', 80);
                $table->string('auditable_type')->nullable();
                $table->unsignedBigInteger('auditable_id')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->jsonb('metadata')->nullable();
                $table->timestamps();
                $table->index(['auditable_type', 'auditable_id']);
            });
        }

        if (! Schema::hasTable('webhook_events')) {
            Schema::create('webhook_events', static function (Blueprint $table): void {
                $table->id();
                $table->string('provider', 40);
                $table->string('external_id', 160);
                $table->string('event_type', 80)->nullable();
                $table->jsonb('payload');
                $table->timestamp('processed_at')->nullable();
                $table->text('error_message')->nullable();
                $table->timestamps();
                $table->unique(['provider', 'external_id']);
            });
        }

        if (! Schema::hasTable('match_actions')) {
            Schema::create('match_actions', static function (Blueprint $table): void {
                $table->id();
                $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('action', 30);
                $table->string('player_name')->nullable();
                $table->string('idempotency_key', 80)->nullable();
                $table->unsignedBigInteger('sequence')->default(0);
                $table->jsonb('payload')->nullable();
                $table->timestamps();
                $table->index(['match_id', 'sequence']);
                $table->unique(['match_id', 'user_id', 'idempotency_key'], 'match_actions_idempotency_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('match_actions');
        Schema::dropIfExists('webhook_events');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('password_reset_tokens');
    }
};
