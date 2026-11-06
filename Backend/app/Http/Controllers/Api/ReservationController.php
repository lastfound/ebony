<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Services\ReservationNotifierService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReservationController extends Controller
{
    public function __construct(protected ReservationNotifierService $notifier) {}

    /**
     * Public submit reservation with quota validation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:2|max:255',
            'phone' => 'required|string|min:8|max:30',
            'email' => 'required|email|max:255',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|string',
            'party_size' => 'required|integer|min:1|max:100',
            'table_id' => 'nullable|integer|exists:restaurant_tables,id',
            'occasion' => 'nullable|string|max:255',
            'dietary_notes' => 'nullable|string|max:1000',
            'seating_notes' => 'nullable|string|max:1000',
        ]);

        // Validasi meja: harus aktif, muat, dan belum dibooking di slot yang sama.
        if (! empty($validated['table_id'])) {
            $check = $this->checkTableAvailable(
                (int) $validated['table_id'],
                $validated['date'],
                $validated['time'],
                (int) $validated['party_size']
            );
            if (! $check['ok']) {
                return response()->json([
                    'message' => $check['message'],
                    'available_tables' => $this->availableTablesForSlot(
                        $validated['date'],
                        $validated['time'],
                        (int) $validated['party_size']
                    ),
                ], 422);
            }
        }

        // Quota check: maksimal 25 tamu per slot waktu yang sama di tanggal tersebut
        $currentBookedGuests = Reservation::where('date', $validated['date'])
            ->where('time', 'like', substr($validated['time'], 0, 2).'%')
            ->where('status', '!=', 'cancelled')
            ->sum('party_size');

        $maxCapacityPerSlot = 25;
        if (($currentBookedGuests + $validated['party_size']) > $maxCapacityPerSlot) {
            return response()->json([
                'message' => 'Maaf, kuota reservasi pada waktu tersebut sudah penuh.',
            ], 422);
        }

        // Generate unique 4-digit booking number
        do {
            $bookingNumber = (string) mt_rand(1000, 9999);
        } while (Reservation::where('booking_number', $bookingNumber)->exists());

        $reservation = Reservation::create([
            'booking_number' => $bookingNumber,
            'guest_name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'date' => $validated['date'],
            'time' => $validated['time'],
            'party_size' => $validated['party_size'],
            'table_id' => $validated['table_id'] ?? null,
            'occasion' => $validated['occasion'] ?? null,
            'dietary_notes' => $validated['dietary_notes'] ?? null,
            'seating_notes' => $validated['seating_notes'] ?? null,
            'is_arrived' => false,
            'status' => 'pending',
            'source' => 'web',
        ]);

        // Kabari admin (Web Push + WhatsApp + Telegram).
        // Best-effort: kalau gagal, reservasi tetap dianggap berhasil.
        $this->notifier->notifyNewReservation($reservation);

        return response()->json([
            'message' => 'Reservasi berhasil dikirim.',
            'booking_number' => $reservation->booking_number,
            'data' => $reservation,
        ], 201);
    }

    /**
     * Admin list reservations.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 10);

        $query = Reservation::with('table');

        if ($request->filled('date') && $request->date !== 'all') {
            if ($request->date === 'today') {
                $query->whereDate('date', Carbon::today());
            } else {
                $query->whereDate('date', $request->date);
            }
        } elseif (! $request->filled('date')) {
            // Default: tampilkan reservasi mulai hari ini ke depan (upcoming)
            $query->whereDate('date', '>=', Carbon::today());
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('guest_name', 'like', "%{$s}%")
                    ->orWhere('booking_number', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%");
            });
        }

        $query->orderBy('date', 'asc')->orderBy('time', 'asc');

        $paginated = $query->paginate($perPage);

        $formatted = collect($paginated->items())->map(function ($r) {
            return [
                'id' => $r->id,
                'booking_number' => $r->booking_number,
                'guest_name' => $r->guest_name,
                'phone' => $r->phone,
                'time' => is_string($r->time) ? substr($r->time, 0, 5) : Carbon::parse($r->time)->format('H:i'),
                'date' => is_string($r->date) ? $r->date : Carbon::parse($r->date)->format('Y-m-d'),
                'formatted_date' => Carbon::parse($r->date)->format('d M Y'),
                'party_size' => $r->party_size,
                'occasion' => $r->occasion,
                'source' => $r->source,
                'is_arrived' => $r->is_arrived,
                'status' => $r->status,
                'table_name' => $r->table?->name ?? 'Unassigned',
            ];
        });

        return response()->json([
            'data' => $formatted,
            'total' => $paginated->total(),
            'per_page' => $paginated->perPage(),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
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
     * Reservasi baru sejak timestamp tertentu (untuk polling real-time admin).
     * GET /api/admin/reservations/new?since=ISO8601
     */
    public function newReservations(Request $request)
    {
        $since = $request->query('since');
        $from = $since && strtotime($since)
            ? Carbon::parse($since)
            : Carbon::now()->subMinutes(10);

        $reservations = Reservation::where('created_at', '>', $from)
            ->where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'asc')
            ->limit(20)
            ->get();

        $formatted = $reservations->map(function ($r) {
            return [
                'id' => $r->id,
                'booking_number' => $r->booking_number,
                'guest_name' => $r->guest_name,
                'party_size' => $r->party_size,
                'status' => $r->status,
                'source' => $r->source,
                'date' => is_string($r->date) ? $r->date : Carbon::parse($r->date)->format('Y-m-d'),
                'time' => is_string($r->time) ? substr($r->time, 0, 5) : Carbon::parse($r->time)->format('H:i'),
                'formatted_date' => Carbon::parse($r->date)->format('d M Y'),
                'created_at' => $r->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'data' => $formatted,
            'server_time' => Carbon::now()->toIso8601String(),
        ]);
    }

    /**
     * Admin show reservation detail.
     */
    public function show($id)
    {
        $r = Reservation::with('table')->findOrFail($id);

        $dateFormatted = Carbon::parse($r->date)->format('M d, Y');
        $timeFormatted = Carbon::parse($r->time)->format('g:i A');
        $rawDate = is_string($r->date) ? substr((string) $r->date, 0, 10) : Carbon::parse($r->date)->format('Y-m-d');
        $rawTime = is_string($r->time) ? substr((string) $r->time, 0, 5) : Carbon::parse($r->time)->format('H:i');

        return response()->json([
            'id' => $r->id,
            'booking_number' => $r->booking_number,
            'guest_name' => $r->guest_name,
            'phone' => $r->phone,
            'email' => $r->email,
            'date' => $dateFormatted,
            'raw_date' => $rawDate,
            'time' => $timeFormatted,
            'raw_time' => $rawTime,
            'party_size' => $r->party_size,
            'occasion' => $r->occasion,
            'source' => $r->source,
            'is_arrived' => (bool) $r->is_arrived,
            'status' => $r->status,
            'dietary_notes' => $r->dietary_notes,
            'seating_notes' => $r->seating_notes,
            'table_id' => $r->table_id,
            'table' => $r->table ? [
                'id' => $r->table->id,
                'name' => $r->table->name,
                'capacity' => $r->table->capacity,
                'area' => $r->table->area,
            ] : null,
            // Denah untuk slot reservasi ini (exclude diri sendiri supaya meja
            // yang sedang dipakai reservasi ini tetap terlihat "miliknya").
            'table_availability' => $this->availableTablesForSlot($rawDate, $rawTime, (int) $r->party_size, (int) $r->id),
            'notification_status' => $r->notification_status,
            'failed_notification_channels' => $this->notifier->failedChannels($r),
            'guest' => [
                'name' => $r->guest_name,
                'phone' => $r->phone,
                'email' => $r->email,
                'is_vip' => $r->party_size >= 6,
                'avatar' => null,
            ],
        ]);
    }

    /**
     * Kirim ulang notifikasi admin untuk satu reservasi.
     *
     * Dipakai ketika sebuah kanal gagal (mis. jaringan server sedang putus),
     * sehingga admin tidak perlu membuat reservasi baru.
     */
    public function resendNotification(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        $validated = $request->validate([
            'channels' => 'nullable|array',
            'channels.*' => 'string|in:web_push,whatsapp,telegram',
        ]);

        $channels = $validated['channels'] ?? null;

        $results = $this->notifier->resend($reservation, $channels);

        $sent = array_keys(array_filter($results));
        $failed = array_keys(array_filter($results, fn ($ok) => ! $ok));

        return response()->json([
            'message' => $failed === []
                ? 'Notifikasi berhasil dikirim ulang.'
                : 'Sebagian notifikasi masih gagal dikirim.',
            'results' => $results,
            'sent' => $sent,
            'failed' => $failed,
            'notification_status' => $reservation->fresh()->notification_status,
        ]);
    }

    /**
     * Admin update reservation.
     */
    public function update(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        $validated = $request->validate([
            'guest_name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:30',
            'email' => 'sometimes|required|email|max:255',
            'date' => 'sometimes|required|date',
            'time' => 'sometimes|required',
            'party_size' => 'sometimes|required|integer|min:1|max:100',
            'table_id' => 'nullable|integer|exists:restaurant_tables,id',
            'occasion' => 'nullable|string|max:255',
            'dietary_notes' => 'nullable|string',
            'seating_notes' => 'nullable|string',
            'is_arrived' => 'nullable|boolean',
            'status' => 'nullable|string',
        ]);

        // Kalau admin ganti / assign meja, validasi bentrok (kecuali milik sendiri).
        if (array_key_exists('table_id', $validated) && ! empty($validated['table_id'])) {
            $date = $validated['date'] ?? (is_string($reservation->date) ? substr((string) $reservation->date, 0, 10) : Carbon::parse($reservation->date)->format('Y-m-d'));
            $time = $validated['time'] ?? (is_string($reservation->time) ? substr((string) $reservation->time, 0, 5) : Carbon::parse($reservation->time)->format('H:i'));
            $partySize = (int) ($validated['party_size'] ?? $reservation->party_size);

            $check = $this->checkTableAvailable((int) $validated['table_id'], $date, $time, $partySize, (int) $reservation->id);
            if (! $check['ok']) {
                return response()->json([
                    'message' => $check['message'],
                    'available_tables' => $this->availableTablesForSlot($date, $time, $partySize, (int) $reservation->id),
                ], 422);
            }
        }

        $reservation->update($validated);

        return response()->json([
            'message' => 'Reservasi berhasil diperbarui.',
            'data' => $reservation->fresh('table'),
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
            'message' => 'Kedatangan tamu berhasil dikonfirmasi.',
            'is_arrived' => true,
        ]);
    }

    /**
     * Export reservations to CSV.
     */
    public function exportCsv(Request $request)
    {
        $reservations = Reservation::orderBy('date', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="reservations-'.date('Y-m-d').'.csv"',
        ];

        $callback = function () use ($reservations) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Booking Number', 'Guest Name', 'Phone', 'Email', 'Date', 'Time', 'Guests', 'Occasion', 'Status', 'Arrived']);

            foreach ($reservations as $r) {
                fputcsv($file, [
                    $r->booking_number,
                    $r->guest_name,
                    $r->phone,
                    $r->email,
                    $r->date,
                    $r->time,
                    $r->party_size,
                    $r->occasion ?? '-',
                    $r->status,
                    $r->is_arrived ? 'Yes' : 'No',
                ]);
            }
            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    /**
     * Cek satu meja untuk satu slot (tanggal + jam yang sama).
     * Dipakai saat user pilih meja maupun saat admin assign meja.
     *
     * @return array{ok: bool, message: string}
     */
    protected function checkTableAvailable(int $tableId, string $date, string $time, int $partySize, ?int $excludeReservationId = null): array
    {
        $table = RestaurantTable::find($tableId);
        if (! $table || ! $table->is_active) {
            return ['ok' => false, 'message' => 'Meja yang dipilih tidak tersedia.'];
        }

        if ($table->capacity < $partySize) {
            return ['ok' => false, 'message' => "Meja {$table->name} hanya muat {$table->capacity} orang, sedangkan tamu {$partySize} orang. Silakan pilih meja lain yang masih kosong."];
        }

        $hourPrefix = substr($time, 0, 2);
        $conflict = Reservation::where('date', $date)
            ->where('time', 'like', $hourPrefix.'%')
            ->where('status', '!=', 'cancelled')
            ->where('table_id', $tableId)
            ->when($excludeReservationId, fn ($q) => $q->where('id', '!=', $excludeReservationId))
            ->exists();

        if ($conflict) {
            return ['ok' => false, 'message' => "Meja {$table->name} sudah terisi di jam tersebut (mungkin via offline/WA). Silakan pilih meja lain yang masih kosong, atau hubungi tamu via WhatsApp untuk menawarkan meja pengganti."];
        }

        return ['ok' => true, 'message' => 'OK'];
    }

    /**
     * Daftar meja + status kosong/isi untuk satu slot.
     * Dipakai untuk denah di user & admin, dan sebagai saran alternatif
     * saat meja pilihan ternyata sudah terisi.
     */
    protected function availableTablesForSlot(string $date, string $time, int $partySize, ?int $excludeReservationId = null): array
    {
        $hourPrefix = substr($time, 0, 2);

        $bookedIds = Reservation::where('date', $date)
            ->where('time', 'like', $hourPrefix.'%')
            ->where('status', '!=', 'cancelled')
            ->whereNotNull('table_id')
            ->when($excludeReservationId, fn ($q) => $q->where('id', '!=', $excludeReservationId))
            ->pluck('table_id')
            ->unique()
            ->all();

        $bookedSet = array_flip($bookedIds);

        return RestaurantTable::where('is_active', true)
            ->orderBy('area')
            ->orderBy('capacity')
            ->orderBy('name')
            ->get(['id', 'name', 'capacity', 'area'])
            ->map(function ($t) use ($bookedSet, $partySize) {
                $isBooked = isset($bookedSet[$t->id]);
                $fits = $t->capacity >= $partySize;

                return [
                    'id' => $t->id,
                    'name' => $t->name,
                    'capacity' => $t->capacity,
                    'area' => $t->area,
                    'is_booked' => $isBooked,
                    'fits_party' => $fits,
                    'is_available' => ! $isBooked && $fits,
                    'reason' => $isBooked ? 'booked' : ($fits ? null : 'too_small'),
                ];
            })->all();
    }
}
