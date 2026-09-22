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
        Schema::table('company_settings', function (Blueprint $table) {
            $table->boolean('identity_lookup_enabled')->default(false);
            $table->string('identity_lookup_provider')->default('decolecta');
            $table->text('identity_lookup_token')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn(['identity_lookup_enabled', 'identity_lookup_provider', 'identity_lookup_token']);
        });
    }
};
