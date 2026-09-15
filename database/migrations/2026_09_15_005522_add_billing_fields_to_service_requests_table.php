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
        Schema::table('service_requests', function (Blueprint $table) {
            $table->decimal('quoted_amount', 12, 2)->nullable()->after('admin_response');
            $table->string('payment_status', 20)->default('pending')->after('quoted_amount');
            $table->string('receipt_type', 20)->default('boleta')->after('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropColumn(['quoted_amount', 'payment_status', 'receipt_type']);
        });
    }
};
