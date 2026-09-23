<?php

namespace App\Console\Commands;

use App\Services\TelegramService;
use Illuminate\Console\Command;

class TelegramTest extends Command
{
    protected $signature = 'telegram:test {--message= Pesan test yang akan dikirim}';

    protected $description = 'Kirim pesan test ke group chat Telegram admin';

    public function handle(TelegramService $telegram): int
    {
        $message = $this->option('message')
            ?: '✅ <b>Test Notifikasi</b> — Ebony Cafe'."\n"
            .'Koneksi bot Telegram berhasil. Notifikasi reservasi akan masuk ke group ini.';

        $result = $telegram->send($message);

        if ($result['ok']) {
            $this->info('Pesan berhasil dikirim ke Telegram.');

            return self::SUCCESS;
        }

        $this->error('Gagal: '.($result['error'] ?? 'unknown error'));

        return self::FAILURE;
    }
}
