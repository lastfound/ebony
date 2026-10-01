<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_number',
        'source',
        'notification_status',
        'guest_name',
        'phone',
        'email',
        'date',
        'time',
        'party_size',
        'table_id',
        'occasion',
        'dietary_notes',
        'seating_notes',
        'is_arrived',
        'status',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'is_arrived' => 'boolean',
        'party_size' => 'integer',
        'notification_status' => 'array',
    ];

    public function table()
    {
        return $this->belongsTo(RestaurantTable::class, 'table_id');
    }

    public function items()
    {
        return $this->hasMany(ReservationItem::class, 'reservation_id');
    }

    public function preorders()
    {
        return $this->hasMany(ReservationItem::class, 'reservation_id');
    }
}
