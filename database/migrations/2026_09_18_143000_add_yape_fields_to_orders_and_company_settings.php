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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_reference', 50)->nullable()->after('payment_method');
            $table->string('payment_receipt_path')->nullable()->after('payment_reference');
        });

        Schema::table('company_settings', function (Blueprint $table) {
            $table->string('yape_qr_path')->nullable()->after('yape_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_reference', 'payment_receipt_path']);
        });

        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn('yape_qr_path');
        });
    }
};
