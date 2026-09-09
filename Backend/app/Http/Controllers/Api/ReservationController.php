<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReservationController extends Controller
{
    /**
     * Public submit reservation with quota validation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|min:2|max:255',
            'phone'         => 'required|string|min:8|max:30',
            'email'         => 'required|email|max:255',
            'date'          => 'required|date|after_or_equal:today',
            'time'          => 'required|string',
            'party_size'    => 'required|integer|min:1|max:20',
            'table_id'      => 'nullable|exists:restaurant_tables,id',
            'occasion'      => 'nullable|string|max:255',
            'dietary_notes' => 'nullable|string|max:1000',
            'seating_notes' => 'nullable|string|max:1000',
        ]);

        // Quota check: maksimal 25 tamu per slot waktu yang sama di tanggal tersebut
        $currentBookedGuests = Reservation::where('date', $validated['date'])
            ->where('time', 'like', substr($validated['time'], 0, 2) . '%')
            ->where('status', '!=', 'cancelled')
            ->sum('party_size');

        $maxCapacityPerSlot = 25;
        if (($currentBookedGuests + $validated['party_size']) > $maxCapacityPerSlot) {
            return response()->json([
                'message' => 'Maaf, kuota reservasi pada waktu tersebut sudah penuh.',
            ], 422);
        }

        // Auto assign meja jika table_id belum dipilih
        $tableId = $validated['table_id'] ?? null;
        if (!$tableId) {
            $suitableTable = RestaurantTable::where('is_active', true)
                ->where('capacity', '>=', $validated['party_size'])
                ->orderBy('capacity', 'asc')
                ->first();
            $tableId = $suitableTable ? $suitableTable->id : null;
        }

        // Generate unique 4-digit booking number
        do {
            $bookingNumber = (string) mt_rand(1000, 9999);
        } while (Reservation::where('booking_number', $bookingNumber)->exists());

        $reservation = Reservation::create([
            'booking_number' => $bookingNumber,
            'guest_name'     => $validated['name'],
            'phone'          => $validated['phone'],
            'email'          => $validated['email'],
            'date'           => $validated['date'],
            'time'           => $validated['time'],
            'party_size'     => $validated['party_size'],
            'table_id'       => $tableId,
            'occasion'       => $validated['occasion'] ?? null,
            'dietary_notes'  => $validated['dietary_notes'] ?? null,
            'seating_notes'  => $validated['seating_notes'] ?? null,
            'is_arrived'     => false,
            'status'         => 'confirmed',
        ]);

        return response()->json([
            'message'        => 'Reservasi berhasil dikonfirmasi.',
            'booking_number' => $reservation->booking_number,
            'data'           => $reservation,
        ], 201);
    }

    /**
     * Admin list reservations (with pagination & search).
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 4);
        $query   = Reservation::with('table')->orderBy('date', 'desc')->orderBy('time', 'asc');

        if ($request->filled('date')) {
            if ($request->date === 'today') {
                $query->whereDate('date', Carbon::today());
            } else {
                $query->whereDate('date', $request->date);
            }
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('guest_name', 'like', "%{$s}%")
                  ->orWhere('booking_number', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        $paginated = $query->paginate($perPage);

        // Format data agar sesuai ekspektasi frontend ReservationRow.jsx
        $formatted = collect($paginated->items())->map(function ($r) {
            return [
                'id'             => $r->id,
                'booking_number' => $r->booking_number,
                'guest_name'     => $r->guest_name,
                'time'           => is_string($r->time) ? substr($r->time, 0, 5) : Carbon::parse($r->time)->format('H:i'),
                'date'           => is_string($r->date) ? $r->date : Carbon::parse($r->date)->format('Y-m-d'),
                'party_size'     => $r->party_size,
                'table_name'     => $r->table ? $r->table->name : 'Unassigned',
                'occasion'       => $r->occasion,
                'is_arrived'     => $r->is_arrived,
                'status'         => $r->status,
            ];
        });

        return response()->json([
            'data'         => $formatted,
            'total'        => $paginated->total(),
            'per_page'     => $paginated->perPage(),
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
        ]);
    }

    /**
     * Admin manual reservation creation.
     */
    public function adminStore(Request $request)
    {
        return $this->store($request);
    }

    /**
     * Admin show reservation detail (matches ReservationDetailPage.jsx schema).
     */
    public function show($id)
    {
        $r = Reservation::with(['table', 'items.menu'])->findOrFail($id);

        $preorders = $r->items->map(function ($item) {
            return [
                'id'          => $item->id,
                'name'        => $item->menu ? $item->menu->name : 'Menu item',
                'description' => $item->menu ? $item->menu->description : '',
                'price'       => (float) $item->price,
                'qty'         => (int) $item->qty,
                'image_url'   => $item->menu ? $item->menu->image_url : null,
            ];
        });

        $dateFormatted = Carbon::parse($r->date)->format('M d, Y');
        $timeFormatted = Carbon::parse($r->time)->format('g:i A');

        return response()->json([
            'id'             => $r->id,
            'booking_number' => $r->booking_number,
            'date'           => $dateFormatted,
            'raw_date'       => is_string($r->date) ? $r->date : Carbon::parse($r->date)->format('Y-m-d'),
            'time'           => $timeFormatted,
            'party_size'     => $r->party_size,
            'table_name'     => $r->table ? $r->table->name : 'Standard Table',
            'table_area'     => $r->table ? $r->table->area : 'Main Hall',
            'occasion'       => $r->occasion,
            'is_arrived'     => (bool) $r->is_arrived,
            'dietary_notes'  => $r->dietary_notes,
            'seating_notes'  => $r->seating_notes,
            'guest'          => [
                'name'   => $r->guest_name,
                'phone'  => $r->phone,
                'email'  => $r->email,
                'is_vip' => $r->party_size >= 6,
                'avatar' => null,
            ],
            'preorders'      => $preorders,
        ]);
    }

    /**
     * Admin update reservation.
     */
    public function update(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        $validated = $request->validate([
            'guest_name'    => 'sometimes|required|string|max:255',
            'phone'         => 'sometimes|required|string|max:30',
            'email'         => 'sometimes|required|email|max:255',
            'date'          => 'sometimes|required|date',
            'time'          => 'sometimes|required',
            'party_size'    => 'sometimes|required|integer|min:1|max:20',
            'table_id'      => 'nullable|exists:restaurant_tables,id',
            'occasion'      => 'nullable|string|max:255',
            'dietary_notes' => 'nullable|string',
            'seating_notes' => 'nullable|string',
            'is_arrived'    => 'nullable|boolean',
            'status'        => 'nullable|string',
        ]);

        $reservation->update($validated);

        return response()->json([
            'message' => 'Reservasi berhasil diperbarui.',
            'data'    => $reservation,
        ]);
    }

    /**
     * Confirm guest arrival.
     */
    public function confirmArrival($id)
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->is_arrived = true;
        $reservation->save();

        return response()->json([
            'message'    => 'Kedatangan tamu berhasil dikonfirmasi.',
            'is_arrived' => true,
        ]);
    }

    /**
     * Export reservations to CSV.
     */
    public function exportCsv(Request $request)
    {
        $reservations = Reservation::with('table')->orderBy('date', 'desc')->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="reservations-' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($reservations) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Booking Number', 'Guest Name', 'Phone', 'Email', 'Date', 'Time', 'Guests', 'Table', 'Occasion', 'Status', 'Arrived']);

            foreach ($reservations as $r) {
                fputcsv($file, [
                    $r->booking_number,
                    $r->guest_name,
                    $r->phone,
                    $r->email,
                    $r->date,
                    $r->time,
                    $r->party_size,
                    $r->table ? $r->table->name : 'N/A',
                    $r->occasion ?? '-',
                    $r->status,
                    $r->is_arrived ? 'Yes' : 'No',
                ]);
            }
            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
