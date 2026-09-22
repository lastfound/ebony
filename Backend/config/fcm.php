<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Firebase Cloud Messaging Configuration
    |--------------------------------------------------------------------------
    |
    | project_id  : ID project Firebase kamu (dari Firebase Console)
    | credentials : Path ke file service account JSON (JANGAN expose ke publik)
    |
    */

    'project_id' => env('FCM_PROJECT_ID', ''),

    'credentials_path' => env('FCM_CREDENTIALS_PATH', storage_path('app/firebase-credentials.json')),

    /*
    | FCM HTTP v1 API endpoint
    */
    'endpoint' => 'https://fcm.googleapis.com/v1/projects/{project_id}/messages:send',

    /*
    | Deep link prefix untuk klik notifikasi di HP admin → diarahkan ke halaman detail
    | Sesuaikan dengan URL dashboard admin kamu
    */
    'dashboard_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/admin/reservations',
];
