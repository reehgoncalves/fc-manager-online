<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasColumn('teams', 'flag_url')) Schema::table('teams', function (Blueprint $table): void { $table->string('flag_url')->nullable()->after('country'); });
    }

    public function down(): void
    {
        if (Schema::hasColumn('teams', 'flag_url')) Schema::table('teams', function (Blueprint $table): void { $table->dropColumn('flag_url'); });
    }
};
