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
            $table->boolean('billing_enabled')->default(false);
            $table->string('billing_mode', 20)->default('api');
            $table->string('billing_environment', 20)->default('demo');
            $table->string('billing_provider', 60)->nullable();
            $table->string('billing_ruc', 11)->nullable();
            $table->string('billing_api_url')->nullable();
            $table->text('billing_api_token')->nullable();
            $table->string('billing_certificate_path')->nullable();
            $table->text('billing_certificate_password')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn(['billing_enabled', 'billing_mode', 'billing_environment', 'billing_provider', 'billing_ruc', 'billing_api_url', 'billing_api_token', 'billing_certificate_path', 'billing_certificate_password']);
        });
    }
};
