<?php

namespace App\Jobs;

use App\Models\Reservation;
use App\Services\WebPushService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWebPushNotification implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        protected Reservation $reservation
    ) {}

    public function handle(WebPushService $webPushService): void
    {
        Log::info("Web Push Job: Mengirim notifikasi untuk reservasi #{$this->reservation->booking_number}");

        $dateFormatted = \Carbon\Carbon::parse($this->reservation->date)
            ->locale('id')->isoFormat('D MMMM Y');
        $timeFormatted = \Carbon\Carbon::parse($this->reservation->time)->format('H.i');

        $payload = [
            'title' => '🔔 Reservasi Baru — Ebony Cafe',
            'body' => "{$this->reservation->guest_name} melakukan reservasi untuk {$this->reservation->party_size} orang pada {$dateFormatted} pukul {$timeFormatted}.",
            'reservation_id' => $this->reservation->id,
            'customer_name' => $this->reservation->guest_name,
            'reservation_date' => $this->reservation->date,
            'reservation_time' => $this->reservation->time,
            'guest_count' => $this->reservation->party_size,
            'url' => config('app.frontend_url', 'http://localhost:5173') . "/admin/reservations/{$this->reservation->id}"
        ];

        $webPushService->sendToAllAdmins($payload);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error(
            "Web Push Job GAGAL untuk reservasi #{$this->reservation->booking_number}: " . $exception->getMessage()
        );
    }
}
