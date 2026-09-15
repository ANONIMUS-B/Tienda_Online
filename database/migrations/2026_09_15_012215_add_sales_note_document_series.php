<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('document_series')->updateOrInsert(
            ['document_type' => 'sales_note'],
            ['series' => 'NV01', 'next_number' => 1, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('document_series')->where('document_type', 'sales_note')->delete();
    }
};
