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
            $table->boolean('payment_yape_enabled')->default(true);
            $table->boolean('payment_transfer_enabled')->default(true);
            $table->boolean('payment_cash_enabled')->default(true);
            $table->boolean('payment_gateway_enabled')->default(false);
            $table->string('payment_gateway', 30)->nullable();
            $table->boolean('payment_test_mode')->default(true);
            $table->text('gateway_public_key')->nullable();
            $table->text('gateway_secret_key')->nullable();
            $table->string('yape_number', 30)->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->boolean('whatsapp_checkout_enabled')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn(['payment_yape_enabled', 'payment_transfer_enabled', 'payment_cash_enabled', 'payment_gateway_enabled', 'payment_gateway', 'payment_test_mode', 'gateway_public_key', 'gateway_secret_key', 'yape_number', 'bank_name', 'bank_account', 'whatsapp_checkout_enabled']);
        });
    }
};
