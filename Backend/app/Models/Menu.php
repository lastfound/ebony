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
    ];

    protected $casts = [
        'price' => 'float',
        'is_featured' => 'boolean',
        'is_available' => 'boolean',
    ];

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

    public function preorders()
    {
        return $this->hasMany(ReservationItem::class, 'menu_id');
    }
}
