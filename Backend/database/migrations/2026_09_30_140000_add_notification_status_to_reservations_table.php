<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Ringkasan hasil pengiriman notifikasi per kanal:
            // { "telegram": { "status": "failed", "error": "...", "at": "..." }, ... }
            $table->json('notification_status')->nullable()->after('source');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('notification_status');
        });
    }
};
