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
        Schema::table('products', function (Blueprint $table) {
            $table->json('benefits')->nullable()->after('specifications');
            $table->string('warranty_info', 160)->nullable()->after('benefits');
            $table->string('shipping_info', 160)->nullable()->after('warranty_info');
            $table->string('payment_info', 160)->nullable()->after('shipping_info');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'benefits',
                'warranty_info',
                'shipping_info',
                'payment_info',
            ]);
        });
    }
};
