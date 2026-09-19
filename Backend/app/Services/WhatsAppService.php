<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WhatsAppService
{
    public function send(string $phone, string $message): array
    {
        $phone = $this->normalizePhone($phone);
        $driver = config('whatsapp.driver', 'fonnte');

        try {
            if ($driver === 'fonnte') {
                return $this->sendFonnte($phone, $message);
            }

            if ($driver === 'wablas') {
                return $this->sendWablas($phone, $message);
            }
        } catch (\Exception $e) {
            Log::error('WhatsAppService error: ' . $e->getMessage());

            return ['ok' => false, 'error' => $e->getMessage()];
        }

        return ['ok' => false, 'error' => "Driver WhatsApp tidak dikenal: {$driver}"];
    }

    public function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (Str::startsWith($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        } elseif (Str::startsWith($phone, '8')) {
            $phone = '62' . $phone;
        }

        return $phone;
    }

    protected function sendFonnte(string $phone, string $message): array
    {
        $token = config('whatsapp.fonnte_token');
        if (empty($token)) {
            return ['ok' => false, 'error' => 'FONNTE_TOKEN belum diisi di .env'];
        }

        $res = Http::withHeaders([
            'Authorization' => $token,
        ])->asForm()->timeout(20)->post('https://api.fonnte.com/send', [
            'target' => $phone,
            'message' => $message,
        ]);

        $json = $res->json();
        $statusOk = $res->successful() && !empty($json['status'])
            && ((int) $json['status'] === 1 || (bool) $json['status'] === true);

        if ($statusOk) {
            return ['ok' => true, 'data' => $json];
        }

        Log::warning('Fonnte send gagal: ' . $res->body());

        return ['ok' => false, 'error' => $json['detail'] ?? $res->body()];
    }

    protected function sendWablas(string $phone, string $message): array
    {
        $token = config('whatsapp.wablas_token');
        if (empty($token)) {
            return ['ok' => false, 'error' => 'WABLAS_TOKEN belum diisi di .env'];
        }

        $url = rtrim(config('whatsapp.wablas_url'), '/') . '/api/send-message';

        $res = Http::withToken($token)->asJson()->timeout(20)->post($url, [
            'phone' => $phone,
            'message' => $message,
            'secret' => false,
        ]);

        $json = $res->json();

        if ($res->successful() && (!empty($json['status']) && (bool) $json['status'] === true)) {
            return ['ok' => true, 'data' => $json];
        }

        Log::warning('Wablas send gagal: ' . $res->body());

        return ['ok' => false, 'error' => $json['message'] ?? $res->body()];
    }
}