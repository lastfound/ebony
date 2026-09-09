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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('booking_number')->unique(); // e.g. "8291"
            $table->string('guest_name');
            $table->string('phone');
            $table->string('email');
            $table->date('date');
            $table->time('time');
            $table->integer('party_size'); // 1-20
            $table->foreignId('table_id')->nullable()->constrained('restaurant_tables')->nullOnDelete();
            $table->string('occasion')->nullable(); // Birthday, Anniversary, or Event Name
            $table->text('dietary_notes')->nullable();
            $table->text('seating_notes')->nullable();
            $table->boolean('is_arrived')->default(false);
            $table->string('status')->default('confirmed'); // confirmed, cancelled, completed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
