<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasColumn('players', 'avatar_url')) {
            Schema::table('players', function (Blueprint $table): void { $table->string('avatar_url')->nullable()->after('club_name'); });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('players', 'avatar_url')) {
            Schema::table('players', function (Blueprint $table): void { $table->dropColumn('avatar_url'); });
        }
    }
};
