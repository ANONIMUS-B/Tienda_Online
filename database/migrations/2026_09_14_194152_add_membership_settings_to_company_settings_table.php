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
            $table->boolean('software_membership_enabled')->default(true);
            $table->decimal('software_monthly_price', 12, 2)->default(29.90);
            $table->decimal('software_annual_price', 12, 2)->default(299.00);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn(['software_membership_enabled', 'software_monthly_price', 'software_annual_price']);
        });
    }
};
