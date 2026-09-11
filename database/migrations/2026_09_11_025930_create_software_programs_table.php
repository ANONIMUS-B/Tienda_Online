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
        Schema::create('software_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('image_id')->nullable()->constrained('media_files')->nullOnDelete();
            $table->foreignUuid('file_id')->nullable()->constrained('media_files')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category', 60);
            $table->string('platform', 60)->nullable();
            $table->string('version', 40)->nullable();
            $table->string('license_type', 30)->default('free');
            $table->decimal('price', 12, 2)->nullable();
            $table->string('short_description');
            $table->text('description')->nullable();
            $table->text('requirements')->nullable();
            $table->boolean('is_own')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('downloads')->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['is_active', 'category', 'license_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('software_programs');
    }
};
