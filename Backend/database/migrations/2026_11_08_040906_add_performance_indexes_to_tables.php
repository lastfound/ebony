<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Menambahkan index performa untuk mempercepat query tanpa mengubah struktur tabel/kolom.
     */
    public function up(): void
    {
        // 1. Index untuk tabel Menus
        Schema::table('menus', function (Blueprint $table) {
            $table->index(['is_available', 'is_featured', 'id'], 'idx_menus_available_featured_id');
            $table->index(['is_available', 'category'], 'idx_menus_available_category');
        });

        // 2. Index untuk tabel Reservations
        Schema::table('reservations', function (Blueprint $table) {
            $table->index(['date', 'time'], 'idx_reservations_date_time');
            $table->index(['created_at', 'status'], 'idx_reservations_created_status');
            $table->index('status', 'idx_reservations_status');
        });

        // 3. Index untuk tabel Galleries
        Schema::table('galleries', function (Blueprint $table) {
            $table->index(['is_active', 'order', 'id'], 'idx_galleries_active_order_id');
        });

        // 4. Index untuk tabel Events
        Schema::table('events', function (Blueprint $table) {
            $table->index(['is_active', 'date'], 'idx_events_active_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropIndex('idx_menus_available_featured_id');
            $table->dropIndex('idx_menus_available_category');
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->dropIndex('idx_reservations_date_time');
            $table->dropIndex('idx_reservations_created_status');
            $table->dropIndex('idx_reservations_status');
        });

        Schema::table('galleries', function (Blueprint $table) {
            $table->dropIndex('idx_galleries_active_order_id');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('idx_events_active_date');
        });
    }
};
