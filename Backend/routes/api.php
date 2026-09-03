<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// --- TAMBAHKAN KODE BARU DI BAWAH INI ---

Route::get('/tes-koneksi', function () {
    return response()->json([
        'status' => 'sukses',
        'pesan' => 'Halo Frontend! Hubungan antara Laravel dan React berhasil tersambung 100%!',
        'data' => [
            'project_name' => 'Ebony',
            'developer_backend' => 'Anda sendiri'
        ]
    ]);
});
