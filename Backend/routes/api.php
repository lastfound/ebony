<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes — Ebony Cafe & Gallery
|--------------------------------------------------------------------------
*/

// ===== 1. PUBLIK (Tanpa Auth) =====
Route::get('/menus',             [MenuController::class, 'publicIndex']);
Route::get('/events',            [EventController::class, 'publicIndex']);
Route::get('/events/{id}',       [EventController::class, 'show']);
Route::post('/reservations',     [ReservationController::class, 'store']);

// Tes koneksi
Route::get('/tes-koneksi', function () {
    return response()->json([
        'status' => 'sukses',
        'pesan'  => 'Halo Frontend! API Laravel Ebony Cafe aktif dan siap melayani request!',
    ]);
});

// ===== 2. AUTH ADMIN =====
Route::post('/admin/login',  [AuthController::class, 'login']);

// ===== 3. ADMIN (Protected - Butuh Token Sanctum) =====
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout',   [AuthController::class, 'logout']);
    Route::get('/me',        [AuthController::class, 'me']);
    Route::put('/profile',   [AuthController::class, 'updateProfile']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Reservations (Penting: export-csv diletakkan sebelum {id})
    Route::get('/reservations',                [ReservationController::class, 'index']);
    Route::post('/reservations',               [ReservationController::class, 'adminStore']);
    Route::get('/reservations/export-csv',     [ReservationController::class, 'exportCsv']);
    Route::get('/reservations/{id}',           [ReservationController::class, 'show']);
    Route::put('/reservations/{id}',           [ReservationController::class, 'update']);
    Route::patch('/reservations/{id}/confirm', [ReservationController::class, 'confirmArrival']);

    // Menus
    Route::get('/menus',              [MenuController::class, 'index']);
    Route::post('/menus',             [MenuController::class, 'store']);
    Route::put('/menus/{id}',         [MenuController::class, 'update']);
    Route::delete('/menus/{id}',      [MenuController::class, 'destroy']);
    Route::patch('/menus/{id}/toggle',[MenuController::class, 'toggleStatus']);

    // Events
    Route::get('/events',          [EventController::class, 'index']);
    Route::post('/events',         [EventController::class, 'store']);
    Route::put('/events/{id}',     [EventController::class, 'update']);
    Route::delete('/events/{id}',  [EventController::class, 'destroy']);
});
