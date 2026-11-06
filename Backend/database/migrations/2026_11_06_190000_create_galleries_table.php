<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('caption')->nullable();
            $table->string('image_url');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed 5 initial gallery images that were previously hardcoded
        DB::table('galleries')->insert([
            [
                'title' => 'Interior Dining Area',
                'caption' => 'Ebony Cafe interior dining area',
                'image_url' => '/assets/images/gallery/gallery1.jpeg',
                'order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Restaurant Ambiance',
                'caption' => 'Restaurant ambiance at Ebony',
                'image_url' => '/assets/images/gallery/gallery2.jpeg',
                'order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Art Gallery Wall',
                'caption' => 'Cafe gallery wall',
                'image_url' => '/assets/images/gallery/gallery3.jpeg',
                'order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Bar Area',
                'caption' => 'Bar area at Ebony',
                'image_url' => '/assets/images/gallery/gallery4.jpeg',
                'order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Private Dining Room',
                'caption' => 'Private dining room',
                'image_url' => '/assets/images/gallery/gallery5.jpeg',
                'order' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('galleries');
    }
};
