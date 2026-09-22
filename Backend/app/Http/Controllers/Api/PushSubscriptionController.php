<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PushSubscriptionController extends Controller
{
    /**
     * Mendaftarkan Web Push Subscription dari frontend.
     * POST /api/admin/push-subscriptions
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|string|url|max:500',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $adminId = $request->user()->id;

        $subscription = PushSubscription::updateOrCreate(
            ['endpoint' => $validated['endpoint']],
            [
                'admin_id' => $adminId,
                'public_key' => $validated['keys']['p256dh'],
                'auth_token' => $validated['keys']['auth'],
            ]
        );

        Log::info("Web Push: Subscription terdaftar untuk admin ID {$adminId}");

        return response()->json([
            'message' => 'Notifikasi berhasil diaktifkan.',
            'data' => $subscription
        ]);
    }

    /**
     * Mengecek status subscription untuk UI frontend.
     * GET /api/admin/push-subscriptions/check
     */
    public function check(Request $request)
    {
        $endpoint = $request->query('endpoint');
        if (!$endpoint) {
            return response()->json(['is_subscribed' => false]);
        }

        $exists = PushSubscription::where('admin_id', $request->user()->id)
            ->where('endpoint', $endpoint)
            ->exists();

        return response()->json(['is_subscribed' => $exists]);
    }

    /**
     * Menghapus subscription (saat admin mematikan notifikasi / logout).
     * DELETE /api/admin/push-subscriptions
     */
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|string|url'
        ]);

        PushSubscription::where('endpoint', $validated['endpoint'])->delete();

        Log::info("Web Push: Subscription dihapus untuk admin ID {$request->user()->id}");

        return response()->json([
            'message' => 'Subscription dihapus.'
        ]);
    }
}
