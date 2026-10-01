<?php

namespace App\Services;

use App\Jobs\SendWebPushNotification;
use App\Models\Reservation;
use Illuminate\Support\Facades\Log;

/**
 * Notifikasi reservasi baru ke admin.
 *
 * Dipakai oleh SEMUA sumber reservasi (form website, AI chatbot, atau input manual
 * admin) supaya alur notifikasi selalu sama: Web Push + WhatsApp + Telegram.
 * Notifikasi bersifat best-effort — kegagalan di satu channel tidak boleh
 * menggagalkan pembuatan reservasi.
 */
class ReservationNotifierService
{
    /**
     * Kanal notifikasi yang didukung, sesuai urutan panggilan.
     *
     * @var array<int, string>
     */
    public const CHANNELS = ['web_push', 'whatsapp', 'telegram'];

    public function __construct(
        protected WhatsAppService $whatsapp,
        protected TelegramService $telegram
    ) {}

    /**
     * Pesan error terakhir per kanal, diisi oleh setiap metode send*().
     * Kosong = kanal tidak dikonfigurasi (status "skipped", bukan "failed").
     *
     * @var array<string, string>
     */
    protected array $lastErrors = [];

    /**
     * @return array{web_push: bool, whatsapp: bool, telegram: bool}
     */
    public function notifyNewReservation(Reservation $reservation): array
    {
        $results = [
            'web_push' => $this->sendWebPush($reservation),
            'whatsapp' => $this->sendWhatsAppToAdmin($reservation),
            'telegram' => $this->sendTelegram($reservation),
        ];

        $this->recordStatus($reservation, $results);

        return $results;
    }

    /**
     * Kirim ulang notifikasi ke kanal tertentu saja.
     *
     * Dipakai admin dari halaman detail reservasi ketika sebuah kanal gagal
     * (mis. jaringan server sedang putus) tanpa perlu membuat reservasi baru.
     *
     * @param  array<int, string>|null  $channels  null = semua kanal
     * @return array<string, bool>
     */
    public function resend(Reservation $reservation, ?array $channels = null): array
    {
        $channels = $channels === null
            ? self::CHANNELS
            : array_values(array_intersect($channels, self::CHANNELS));

        $results = [];

        foreach ($channels as $channel) {
            $results[$channel] = match ($channel) {
                'web_push' => $this->sendWebPush($reservation),
                'whatsapp' => $this->sendWhatsAppToAdmin($reservation),
                'telegram' => $this->sendTelegram($reservation),
                default => false,
            };
        }

        $this->recordStatus($reservation, $results);

        return $results;
    }

    /**
     * Kanal mana saja yang masih gagal / belum pernah terkirim.
     *
     * @return array<int, string>
     */
    public function failedChannels(Reservation $reservation): array
    {
        $status = $reservation->notification_status;
        if (! is_array($status)) {
            // Reservasi lama yang belum pernah mencatat status: anggap semua
            // kanal perlu dicoba lagi.
            return self::CHANNELS;
        }

        return array_values(array_filter(
            self::CHANNELS,
            fn (string $channel) => ($status[$channel]['status'] ?? null) !== 'sent'
        ));
    }

    /**
     * Simpan hasil pengiriman ke kolom notification_status di tabel reservations.
     *
     * Status kanal yang tidak ikut pada percobaan ini tidak ditimpa, sehingga
     * "kirim ulang ke Telegram saja" tidak menghapus catatan hasil Web Push.
     *
     * @param  array<string, bool>  $results
     */
    protected function recordStatus(Reservation $reservation, array $results): void
    {
        try {
            $current = is_array($reservation->notification_status) ? $reservation->notification_status : [];
            $at = now()->toIso8601String();

            foreach ($results as $channel => $ok) {
                $entry = [
                    'status' => $ok ? 'sent' : (isset($this->lastErrors[$channel]) ? 'failed' : 'skipped'),
                    'at' => $at,
                ];

                if (isset($this->lastErrors[$channel])) {
                    $entry['error'] = $this->lastErrors[$channel];
                }

                $current[$channel] = $entry;
            }

            $this->lastErrors = [];

            $reservation->forceFill(['notification_status' => $current])->save();
        } catch (\Throwable $e) {
            // Status notifikasi tidak boleh menggagalkan alur reservasi.
            Log::error('Gagal menyimpan status notifikasi reservasi #'.$reservation->booking_number.': '.$e->getMessage());
        }
    }

    /**
     * Label sumber reservasi supaya admin tahu asal booking-nya
     * (form website atau AI chatbot).
     */
    public function sourceLabel(?string $source): string
    {
        return $source === 'ai' ? '🤖 Via AI Chatbot' : '🌐 Via Website';
    }

    /**
     * Ringkasan data reservasi untuk pesan teks (WhatsApp & Telegram).
     */
    public function buildSummary(Reservation $reservation): string
    {
        $date = $this->formatDate($reservation->date);
        $time = $this->formatTime($reservation->time);

        return "Kode Booking: #{$reservation->booking_number}\n"
            . "Nama: {$reservation->guest_name}\n"
            . "No HP: {$reservation->phone}\n"
            . "Tanggal: {$date}\n"
            . "Jam: {$time}\n"
            . "Jumlah: {$reservation->party_size} orang";
    }

    protected function formatDate($date): string
    {
        if (empty($date)) return '-';

        try {
            return \Carbon\Carbon::parse($date)->locale('id')->format('d M Y');
        } catch (\Throwable $e) {
            return (string) $date;
        }
    }

    protected function formatTime($time): string
    {
        if (empty($time)) return '-';

        try {
            return \Carbon\Carbon::parse($time)->format('H:i');
        } catch (\Throwable $e) {
            return substr((string) $time, 0, 5);
        }
    }

    protected function sendWebPush(Reservation $reservation): bool
    {
        try {
            SendWebPushNotification::dispatch($reservation);
            return true;
        } catch (\Throwable $e) {
            $this->lastErrors['web_push'] = $e->getMessage();
            Log::error('Gagal dispatch Web Push untuk reservasi #'.$reservation->booking_number.': '.$e->getMessage());
            return false;
        }
    }

    protected function sendWhatsAppToAdmin(Reservation $reservation): bool
    {
        $adminPhone = config('whatsapp.admin_phone');
        if (empty($adminPhone)) {
            // Tidak dikonfigurasi — dicatat sebagai "skipped", bukan "failed".
            return false;
        }

        try {
            $result = $this->whatsapp->send(
                $adminPhone,
                "🔔 RESERVASI BARU — Ebony Cafe\n"
                .$this->sourceLabel($reservation->source)."\n"
                .$this->buildSummary($reservation)
            );

            if (empty($result['ok'])) {
                $this->lastErrors['whatsapp'] = $result['error'] ?? 'unknown';
                Log::warning('Notifikasi WhatsApp admin gagal: '.($result['error'] ?? 'unknown'));
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            $this->lastErrors['whatsapp'] = $e->getMessage();
            Log::error('Gagal kirim WhatsApp notif admin untuk reservasi #'.$reservation->booking_number.': '.$e->getMessage());
            return false;
        }
    }

    protected function sendTelegram(Reservation $reservation): bool
    {
        // Pesan dikirim dengan parse_mode HTML, jadi semua data yang berasal dari
        // input tamu WAJIB di-escape. Tanpa ini, nama seperti "Budi & Sari" atau
        // "Rizky <Admin>" akan membuat Telegram membalas HTTP 400
        // ("can't parse entities") dan pesan tidak pernah terkirim.
        $name = htmlspecialchars((string) $reservation->guest_name, ENT_QUOTES, 'UTF-8');
        $phone = htmlspecialchars((string) $reservation->phone, ENT_QUOTES, 'UTF-8');

        $message = "🔔 <b>RESERVASI BARU</b> — Ebony Cafe\n"
            .$this->sourceLabel($reservation->source)."\n"
            ."Kode Booking: <b>#{$reservation->booking_number}</b>\n"
            ."Nama: {$name}\n"
            ."No HP: {$phone}\n"
            ."Tanggal: {$this->formatDate($reservation->date)}\n"
            ."Jam: {$this->formatTime($reservation->time)}\n"
            ."Jumlah: {$reservation->party_size} orang";

        try {
            $result = $this->telegram->send($message);

            if (empty($result['ok'])) {
                $this->lastErrors['telegram'] = $result['error'] ?? 'unknown';
                Log::warning('Notifikasi Telegram gagal: '.($result['error'] ?? 'unknown'));
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            $this->lastErrors['telegram'] = $e->getMessage();
            Log::error('Gagal kirim Telegram notif admin untuk reservasi #'.$reservation->booking_number.': '.$e->getMessage());
            return false;
        }
    }
}
