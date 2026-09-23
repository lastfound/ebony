<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendWebPushNotification;
use App\Models\Reservation;
use App\Services\TelegramService;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReservationController extends Controller
{
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
            'occasion' => 'nullable|string|max:255',
            'dietary_notes' => 'nullable|string|max:1000',
            'seating_notes' => 'nullable|string|max:1000',
        ]);

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
            'table_id' => null, // Set null karena belum menggunakan sistem meja
            'occasion' => $validated['occasion'] ?? null,
            'dietary_notes' => $validated['dietary_notes'] ?? null,
            'seating_notes' => $validated['seating_notes'] ?? null,
            'is_arrived' => false,
            'status' => 'pending',
        ]);

        // Kirim push notification ke admin via Web Push (async queue)
        // Jika gagal, reservasi tetap dianggap berhasil
        try {
            SendWebPushNotification::dispatch($reservation);
        } catch (\Exception $e) {
            Log::error(
                'Gagal dispatch Web Push job untuk reservasi #'.$reservation->booking_number.': '.$e->getMessage()
            );
        }

        // Kirim notifikasi WhatsApp ke admin via gatewa (Fonnte/Wablas)
        // Jika gagal, reservasi tetap dianggap berhasil
        try {
            $adminPhone = config('whatsapp.admin_phone');
            if ($adminPhone) {
                $wa = app(WhatsAppService::class);
                $wa->send($adminPhone, "🔔 RESERVASI BARU — Ebony Cafe\n".
                    "Kode Booking: #{$reservation->booking_number}\n".
                    "Nama: {$reservation->guest_name}\n".
                    "No HP: {$reservation->phone}\n".
                    "Tanggal: {$reservation->date}\n".
                    "Jam: {$reservation->time}\n".
                    "Jumlah: {$reservation->party_size} orang");
            }
        } catch (\Exception $e) {
            Log::error(
                'Gagal kirim WhatsApp notif admin untuk reservasi #'.$reservation->booking_number.': '.$e->getMessage()
            );
        }

        // Kirim notifikasi Telegram ke group chat admin (Bot API)
        // Jika gagal, reservasi tetap dianggap berhasil
        try {
            $tg = app(TelegramService::class);
            $tg->send(
                "🔔 <b>RESERVASI BARU</b> — Ebony Cafe\n".
                "Kode Booking: <b>#{$reservation->booking_number}</b>\n".
                "Nama: {$reservation->guest_name}\n".
                "No HP: {$reservation->phone}\n".
                "Tanggal: {$reservation->date}\n".
                "Jam: {$reservation->time}\n".
                "Jumlah: {$reservation->party_size} orang"
            );
        } catch (\Exception $e) {
            Log::error(
                'Gagal kirim Telegram notif admin untuk reservasi #'.$reservation->booking_number.': '.$e->getMessage()
            );
        }

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

        $query = Reservation::whereDate('date', '>=', Carbon::today())
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc');

        if ($request->filled('date') && $request->date !== 'all') {
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
                'is_arrived' => $r->is_arrived,
                'status' => $r->status,
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
        // Panggilan relation table dan relation preorders dihilangkan sementara agar aman dari error
        $r = Reservation::findOrFail($id);

        $dateFormatted = Carbon::parse($r->date)->format('M d, Y');
        $timeFormatted = Carbon::parse($r->time)->format('g:i A');

        return response()->json([
            'id' => $r->id,
            'booking_number' => $r->booking_number,
            'guest_name' => $r->guest_name,
            'phone' => $r->phone,
            'email' => $r->email,
            'date' => $dateFormatted,
            'raw_date' => is_string($r->date) ? $r->date : Carbon::parse($r->date)->format('Y-m-d'),
            'time' => $timeFormatted,
            'party_size' => $r->party_size,
            'occasion' => $r->occasion,
            'is_arrived' => (bool) $r->is_arrived,
            'status' => $r->status,
            'dietary_notes' => $r->dietary_notes,
            'seating_notes' => $r->seating_notes,
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
            'occasion' => 'nullable|string|max:255',
            'dietary_notes' => 'nullable|string',
            'seating_notes' => 'nullable|string',
            'is_arrived' => 'nullable|boolean',
            'status' => 'nullable|string',
        ]);

        $reservation->update($validated);

        return response()->json([
            'message' => 'Reservasi berhasil diperbarui.',
            'data' => $reservation,
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
}
