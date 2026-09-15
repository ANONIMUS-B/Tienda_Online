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
        Schema::table('electronic_documents', function (Blueprint $table) {
            $table->foreignId('software_membership_id')->nullable()->after('service_request_id')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('electronic_documents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('software_membership_id');
        });
    }
};
