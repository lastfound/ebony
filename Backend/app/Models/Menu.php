<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'category',
        'badge',
        'image_url',
        'is_featured',
        'is_available',
        'ingredients',
        'dietary_tags',
        'allergens',
        'spicy_level',
        
        // 🌟 KOREKSI UTAMA: Mengizinkan data promo baru lolos masuk ke database MySQL
        'is_promo',
        'promo_badge',
        'promo_tagline',
        'promo_subtext',
    ];

    protected $casts = [
        'price' => 'float',
        'is_featured' => 'boolean',
        'is_available' => 'boolean',
        'is_promo' => 'boolean', // Memaksa tipe data dibaca boolean true/false di React
    ];

    /**
     * Accessor pintar bawaan Anda untuk otomatis melengkapi link gambar storage
     */
    public function getImageUrlAttribute($value)
    {
        if (!$value) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        return url('storage/' . ltrim($value, '/'));
    }

    /**
     * Relasi ke item pemesanan meja bawaan project Anda
     */
    public function preorders()
    {
        return $this->hasMany(ReservationItem::class, 'menu_id');
    }
}
