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
            // Menambahkan kolom kontrol promo baru
            $table->boolean('is_promo')->default(false);
            $table->string('promo_badge')->nullable();
            $table->string('promo_tagline')->nullable();
            $table->string('promo_subtext')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            // Pengaman untuk menghapus kolom jika migrasi di-rollback
            $table->dropColumn(['is_promo', 'promo_badge', 'promo_tagline', 'promo_subtext']);
        });
    }
};
