<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    protected $fillable = [
        'admin_id',
        'endpoint',
        'public_key',
        'auth_token',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
