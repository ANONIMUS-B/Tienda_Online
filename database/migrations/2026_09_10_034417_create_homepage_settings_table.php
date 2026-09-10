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
        Schema::create('homepage_settings', function (Blueprint $table) {
            $table->id();
            $table->string('hero_overline');
            $table->string('hero_title');
            $table->string('hero_accent');
            $table->text('hero_description');
            $table->string('hero_primary_label');
            $table->string('hero_primary_url');
            $table->string('hero_secondary_label');
            $table->string('hero_secondary_url');
            $table->string('hero_image_path');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('homepage_settings');
    }
};
