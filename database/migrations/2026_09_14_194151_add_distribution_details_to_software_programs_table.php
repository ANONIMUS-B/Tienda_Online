<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('software_programs', function (Blueprint $table) {
            $table->text('installation_instructions')->nullable()->after('requirements');
            $table->string('tutorial_url')->nullable()->after('installation_instructions');
            $table->boolean('download_enabled')->default(false)->after('tutorial_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('software_programs', function (Blueprint $table) {
            $table->dropColumn(['installation_instructions', 'tutorial_url', 'download_enabled']);
        });
    }
};
