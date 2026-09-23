<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    /**
     * Kirim pesan ke group chat Telegram (notifikasi admin).
     *
     * @return array{ok: bool, error?: string, data?: mixed}
     */
    public function send(string $message): array
    {
        $token = config('telegram.bot_token');
        $chatId = config('telegram.chat_id');

        if (empty($token) || empty($chatId)) {
            return ['ok' => false, 'error' => 'TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diisi di .env'];
        }

        try {
            $url = rtrim(config('telegram.api_base', 'https://api.telegram.org'), '/')
                .'/bot'.$token.'/sendMessage';

            $res = Http::timeout(20)->asForm()->post($url, [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
                'disable_web_page_preview' => true,
            ]);

            $json = $res->json();

            if ($res->successful() && ! empty($json['ok'])) {
                return ['ok' => true, 'data' => $json];
            }

            Log::warning('Telegram send gagal: '.$res->body());

            return ['ok' => false, 'error' => $json['description'] ?? $res->body()];
        } catch (\Exception $e) {
            Log::error('TelegramService error: '.$e->getMessage());

            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
}
