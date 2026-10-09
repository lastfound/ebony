<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Info jam tambahan untuk event:
     * - end_date: jam selesai acara (opsional, untuk batas reservasi)
     * - has_time: false = acara tanpa jam pasti (tamu bebas pilih jam)
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dateTime('end_date')->nullable()->after('date');
            $table->boolean('has_time')->default(true)->after('end_date');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['end_date', 'has_time']);
        });
    }
};
