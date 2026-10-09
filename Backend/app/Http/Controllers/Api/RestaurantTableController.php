<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use Illuminate\Http\Request;

class RestaurantTableController extends Controller
{
    /**
     * Daftar semua meja aktif (untuk fallback / legenda denah).
     * GET /api/tables  &  GET /api/admin/tables
     */
    public function index()
    {
        $tables = RestaurantTable::where('is_active', true)
            ->orderBy('area')
            ->orderBy('capacity')
            ->orderBy('name')
            ->get(['id', 'name', 'capacity', 'area']);

        return response()->json(['data' => $tables]);
    }

    /**
     * Ketersediaan meja untuk satu slot waktu.
     * GET /api/tables/available?date=YYYY-MM-DD&time=HH:mm&party_size=N&exclude_reservation_id=
     *
     * Aturan slot SAMA dengan quota di ReservationController:
     * satu slot = tanggal sama + jam yang sama (2 digit pertama time).
     * Status 'cancelled' tidak menghalangi meja.
     */
    public function available(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'time' => 'required|string|min:2|max:8',
            'party_size' => 'nullable|integer|min:1|max:100',
            'exclude_reservation_id' => 'nullable|integer|exists:reservations,id',
        ]);

        $partySize = (int) ($validated['party_size'] ?? 1);
        $hourPrefix = substr($validated['time'], 0, 2);

        $bookedTableIds = Reservation::where('date', $validated['date'])
            ->where('time', 'like', $hourPrefix.'%')
            ->where('status', '!=', 'cancelled')
            ->whereNotNull('table_id')
            ->when(! empty($validated['exclude_reservation_id']), function ($q) use ($validated) {
                $q->where('id', '!=', $validated['exclude_reservation_id']);
            })
            ->pluck('table_id')
            ->unique()
            ->all();

        $bookedSet = array_flip($bookedTableIds);

        $tables = RestaurantTable::where('is_active', true)
            ->orderBy('area')
            ->orderBy('capacity')
            ->orderBy('name')
            ->get(['id', 'name', 'capacity', 'area']);

        $data = $tables->map(function ($t) use ($bookedSet, $partySize) {
            $isBooked = isset($bookedSet[$t->id]);
            $fits = $t->capacity >= $partySize;

            return [
                'id' => $t->id,
                'name' => $t->name,
                'capacity' => $t->capacity,
                'area' => $t->area,
                'is_booked' => $isBooked,
                'fits_party' => $fits,
                // Kosong = belum dibooking DAN muat untuk jumlah tamu.
                'is_available' => ! $isBooked && $fits,
                'reason' => $isBooked ? 'booked' : ($fits ? null : 'too_small'),
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'date' => $validated['date'],
                'time' => substr($validated['time'], 0, 5),
                'party_size' => $partySize,
                'total' => $data->count(),
                'available' => $data->where('is_available', true)->count(),
                'booked' => $data->where('is_booked', true)->count(),
            ],
        ]);
    }
}
