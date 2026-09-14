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
            $table->string('receipt_type', 20)->default('boleta')->after('payment_status');
            $table->string('receipt_status', 20)->default('pending')->after('receipt_type');
            $table->string('receipt_series', 10)->nullable()->after('receipt_status');
            $table->string('receipt_number', 20)->nullable()->after('receipt_series');
            $table->string('receipt_url')->nullable()->after('receipt_number');
            $table->timestamp('receipt_issued_at')->nullable()->after('receipt_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['receipt_type', 'receipt_status', 'receipt_series', 'receipt_number', 'receipt_url', 'receipt_issued_at']);
        });
    }
};
