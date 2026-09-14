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
        Schema::table('users', function (Blueprint $table) {
            $table->string('document_type', 10)->nullable()->after('email');
            $table->string('document_number', 20)->nullable()->unique()->after('document_type');
            $table->string('address')->nullable()->after('document_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['document_number']);
            $table->dropColumn(['document_type', 'document_number', 'address']);
        });
    }
};
