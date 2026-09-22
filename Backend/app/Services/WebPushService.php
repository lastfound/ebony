<?php

namespace App\Services;

use App\Models\PushSubscription;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Support\Facades\Log;

class WebPushService
{
    protected WebPush $webPush;

    public function __construct()
    {
        $auth = [
            'VAPID' => [
                'subject' => config('app.vapid.subject', 'mailto:admin@ebonycafe.com'),
                'publicKey' => config('app.vapid.public_key'),
                'privateKey' => config('app.vapid.private_key'),
            ],
        ];

        $this->webPush = new WebPush($auth);
    }

    public function sendToAllAdmins(array $payload)
    {
        $subscriptions = PushSubscription::all();
        $payloadJson = json_encode($payload);

        foreach ($subscriptions as $subModel) {
            $subscription = Subscription::create([
                'endpoint' => $subModel->endpoint,
                'keys' => [
                    'p256dh' => $subModel->public_key,
                    'auth' => $subModel->auth_token,
                ],
            ]);

            $this->webPush->queueNotification($subscription, $payloadJson);
        }

        foreach ($this->webPush->flush() as $report) {
            $endpoint = $report->getRequest()->getUri()->__toString();
            
            if ($report->isSuccess()) {
                Log::info("Web Push: Berhasil terkirim ke {$endpoint}");
            } else {
                Log::warning("Web Push: Gagal ke {$endpoint}. Error: {$report->getReason()}");

                // Hapus token jika sudah expired/invalid (404/410)
                if ($report->getResponse() && in_array($report->getResponse()->getStatusCode(), [404, 410])) {
                    PushSubscription::where('endpoint', $endpoint)->delete();
                    Log::info("Web Push: Endpoint expired, menghapus subscription dari DB.");
                }
            }
        }
    }
}
