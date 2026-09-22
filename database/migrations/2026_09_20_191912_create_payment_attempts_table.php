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
        Schema::create('payment_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('reference')->unique();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->string('environment', 8);
            $table->unsignedInteger('amount');
            $table->string('currency', 3)->default('PEN');
            $table->string('status', 30)->default('processing')->index();
            $table->string('source_hash', 64)->unique();
            $table->text('source_id');
            $table->text('secret_key');
            $table->text('device_id')->nullable();
            $table->string('email');
            $table->string('charge_id')->nullable()->unique();
            $table->string('message')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_attempts');
    }
};
