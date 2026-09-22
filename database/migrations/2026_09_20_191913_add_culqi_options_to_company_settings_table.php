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
            $table->boolean('culqi_cards_enabled')->default(true);
            $table->boolean('culqi_yape_enabled')->default(true);
            $table->string('culqi_rsa_id')->nullable();
            $table->text('culqi_rsa_public_key')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn(['culqi_cards_enabled', 'culqi_yape_enabled', 'culqi_rsa_id', 'culqi_rsa_public_key']);
        });
    }
};
