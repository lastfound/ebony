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
        Schema::table('menus', function (Blueprint $table) {
            $table->text('ingredients')->nullable();
            $table->string('dietary_tags')->nullable();
            $table->string('allergens')->nullable();
            $table->string('spicy_level')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropColumn(['ingredients', 'dietary_tags', 'allergens', 'spicy_level']);
        });
    }
};
