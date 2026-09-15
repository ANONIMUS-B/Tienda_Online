<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('document_series', function (Blueprint $table) {
            $table->id();
            $table->string('document_type', 20)->unique();
            $table->string('series', 4)->unique();
            $table->unsignedBigInteger('next_number')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('document_series')->insert([
            ['document_type' => 'boleta', 'series' => 'B001', 'next_number' => 1, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['document_type' => 'factura', 'series' => 'F001', 'next_number' => 1, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['document_type' => 'credit_note', 'series' => 'BC01', 'next_number' => 1, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['document_type' => 'debit_note', 'series' => 'BD01', 'next_number' => 1, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_series');
    }
};
