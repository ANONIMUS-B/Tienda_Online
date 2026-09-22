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
            $table->boolean('culqi_enabled')->default(false)->after('payment_gateway_enabled');
            $table->boolean('culqi_pagoefectivo_enabled')->default(false)->after('culqi_yape_enabled');
            $table->unsignedTinyInteger('culqi_cip_expiration_hours')->default(24)->after('culqi_pagoefectivo_enabled');
            $table->boolean('izipay_enabled')->default(false)->after('culqi_cip_expiration_hours');
            $table->string('izipay_merchant_code', 50)->nullable()->after('izipay_enabled');
            $table->text('izipay_public_key')->nullable()->after('izipay_merchant_code');
            $table->text('izipay_api_username')->nullable()->after('izipay_public_key');
            $table->text('izipay_api_password')->nullable()->after('izipay_api_username');
            $table->text('izipay_hash_key')->nullable()->after('izipay_api_password');
        });

        Schema::table('payment_attempts', function (Blueprint $table) {
            $table->string('provider', 30)->default('culqi')->after('order_id')->index();
            $table->string('payment_type', 30)->default('charge')->after('provider');
            $table->string('provider_order_id')->nullable()->after('charge_id')->index();
            $table->timestamp('expires_at')->nullable()->after('verified_at');
            $table->json('provider_data')->nullable()->after('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_attempts', function (Blueprint $table) {
            $table->dropIndex(['provider']);
            $table->dropIndex(['provider_order_id']);
            $table->dropColumn(['provider', 'payment_type', 'provider_order_id', 'expires_at', 'provider_data']);
        });

        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'culqi_enabled', 'culqi_pagoefectivo_enabled', 'culqi_cip_expiration_hours',
                'izipay_enabled', 'izipay_merchant_code', 'izipay_public_key',
                'izipay_api_username', 'izipay_api_password', 'izipay_hash_key',
            ]);
        });
    }
};
