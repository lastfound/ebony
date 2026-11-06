================================================================================
  EBONY CAFE & GALLERY — SISTEM INFORMASI RESTORAN
  README & PANDUAN SETUP
================================================================================

Versi     : 1.0.0
Dibuat    : November 2026
Teknologi : Laravel 13 (Backend) + React 19 (Frontend)

--------------------------------------------------------------------------------
DESKRIPSI PROJECT
--------------------------------------------------------------------------------

Ebony Cafe & Gallery adalah aplikasi web restoran full-stack yang terdiri dari:

  - Landing Page publik (menu, event, reservasi)
  - Admin Portal (manajemen reservasi, menu, event, pengaturan)
  - Notifikasi real-time (Web Push, WhatsApp via Fonnte/Wablas, Telegram Bot)
  - AI Chat Assistant untuk rekomendasi menu & bantuan reservasi (via AI API)
  - Denah meja interaktif 2 lantai

Struktur folder:
  psaj/
  ├── Backend/     → Laravel 13 REST API
  ├── Frontend/    → React 19 + Vite (SPA)
  └── uiux/        → Aset desain UI/UX

================================================================================
PERSYARATAN SISTEM
================================================================================

  - PHP           >= 8.5.12
  - Composer      >= 2.x
  - Node.js       >= 18.x
  - NPM           >= 9.x
  - MySQL / MariaDB (atau SQLite untuk lokal)
  - Laragon / XAMPP / server lokal lainnya

================================================================================
CARA SETUP — BACKEND (Laravel)
================================================================================

1. MASUK KE FOLDER BACKEND
   --------------------------
   cd Backend

2. INSTALL DEPENDENSI PHP
   --------------------------
   composer install

3. SALIN FILE ENVIRONMENT
   --------------------------
   copy .env.example .env
   (Linux/Mac: cp .env.example .env)

4. GENERATE APP KEY
   --------------------------
   php artisan key:generate

5. KONFIGURASI DATABASE di file .env
   --------------------------
   Buka file .env, lalu ubah bagian berikut:

     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=nama_database_kamu
     DB_USERNAME=root
     DB_PASSWORD=

   (Buat dulu database-nya di phpMyAdmin / MySQL)

6. JALANKAN MIGRASI & SEEDER
   --------------------------
   php artisan migrate
   php artisan db:seed

   Seeder akan membuat:
     - Akun admin default
     - Data meja restoran (Lantai 1 & 2)
     - Contoh menu, event, dan reservasi

7. LINK STORAGE (untuk upload gambar)
   --------------------------
   php artisan storage:link

8. JALANKAN SERVER BACKEND
   --------------------------
   php artisan serve

   Backend akan berjalan di: http://127.0.0.1:8000

================================================================================
CARA SETUP — FRONTEND (React + Vite)
================================================================================

1. MASUK KE FOLDER FRONTEND
   --------------------------
   cd Frontend

2. INSTALL DEPENDENSI NODE
   --------------------------
   npm install

3. SALIN FILE ENVIRONMENT
   --------------------------
   copy .env.example .env
   (atau buat file .env baru)

   Isi file .env:
     VITE_API_URL=http://127.0.0.1:8000/api

4. JALANKAN DEV SERVER
   --------------------------
   npm run dev

   Frontend akan berjalan di: http://localhost:5173

5. BUILD UNTUK PRODUKSI (opsional)
   --------------------------
   npm run build

================================================================================
AKUN ADMIN DEFAULT
================================================================================

  URL Login  : http://localhost:5173/admin/login
  Email      : admin@ebony.com
  Password   : password123

  PENTING: Ganti password setelah login pertama kali melalui halaman Settings!

================================================================================
KONFIGURASI TAMBAHAN (OPSIONAL)
================================================================================

--- NOTIFIKASI WHATSAPP (Fonnte / Wablas) ---
Isi di Backend/.env:

  WHATSAPP_DRIVER=fonnte           (atau: wablas)
  ADMIN_PHONE_NUMBER=628xxxxxxxxxx
  FONNTE_TOKEN=token_dari_fonnte
  WABLAS_TOKEN=token_dari_wablas
  WABLAS_URL=https://srv12.wablas.com

--- NOTIFIKASI TELEGRAM BOT ---
Isi di Backend/.env:

  TELEGRAM_BOT_TOKEN=token_dari_botfather
  TELEGRAM_CHAT_ID=id_group_chat_admin

  Langkah:
  1. Chat @BotFather di Telegram → /newbot
  2. Salin token yang diberikan
  3. Tambahkan bot ke group admin
  4. Dapatkan chat_id group

--- WEB PUSH NOTIFICATION (Firebase FCM) ---
Isi di Backend/.env:

  FCM_PROJECT_ID=your-firebase-project-id
  FCM_CREDENTIALS_PATH=storage/app/firebase-credentials.json

  Langkah:
  1. Buat project di https://console.firebase.google.com/
  2. Download service account JSON dari Project Settings > Service Accounts
  3. Simpan file JSON ke Backend/storage/app/firebase-credentials.json
     (JANGAN commit file ini ke git!)

================================================================================
STRUKTUR API ENDPOINT
================================================================================

  === PUBLIK (Tanpa Login) ===
  GET  /api/menus                  → Daftar menu
  GET  /api/events                 → Daftar event
  GET  /api/events/{id}            → Detail event
  GET  /api/tables                 → Daftar meja
  GET  /api/tables/available       → Meja tersedia
  POST /api/reservations           → Buat reservasi baru
  GET  /api/settings               → Pengaturan situs publik
  GET  /api/tes-koneksi            → Cek koneksi API

  === AUTH ADMIN ===
  POST /api/admin/login            → Login admin

  === ADMIN (Butuh Token Bearer) ===
  POST /api/admin/logout           → Logout
  GET  /api/admin/me               → Profil admin
  PUT  /api/admin/profile          → Update profil
  GET  /api/admin/dashboard        → Data dashboard

  GET  /api/admin/reservations     → Daftar reservasi
  POST /api/admin/reservations     → Buat reservasi (admin)
  GET  /api/admin/reservations/{id}→ Detail reservasi
  PUT  /api/admin/reservations/{id}→ Update reservasi
  GET  /api/admin/reservations/export-csv → Export CSV

  GET  /api/admin/menus            → Daftar menu (admin)
  POST /api/admin/menus            → Tambah menu
  PUT  /api/admin/menus/{id}       → Edit menu
  DELETE /api/admin/menus/{id}     → Hapus menu
  PATCH /api/admin/menus/{id}/toggle → Toggle ketersediaan

  GET  /api/admin/events           → Daftar event (admin)
  POST /api/admin/events           → Tambah event
  PUT  /api/admin/events/{id}      → Edit event
  DELETE /api/admin/events/{id}    → Hapus event

  POST /api/admin/settings         → Update pengaturan situs

  === AI ASSISTANT (Rate limit: 20 req/menit/IP) ===
  POST /api/ai/chat                        → Chat umum
  POST /api/ai/menu-recommendation         → Rekomendasi menu
  POST /api/ai/reservation-assistant       → Bantuan reservasi
  POST /api/ai/analyze-request             → Analisis request
  GET  /api/ai/sold-out-menus              → Daftar menu habis

================================================================================
TROUBLESHOOTING
================================================================================

MASALAH: Tidak bisa login ke admin portal
  → Pastikan sudah jalankan: php artisan db:seed
  → Gunakan email: admin@ebony.com | password: password123
  → Pastikan Backend sudah berjalan di http://127.0.0.1:8000
  → Cek file Frontend/.env apakah VITE_API_URL sudah benar
  → Pastikan npm run dev sudah dijalankan ulang setelah edit .env

MASALAH: Error "CORS" di browser
  → Pastikan FRONTEND_URL di Backend/.env sesuai dengan URL Frontend
  → Contoh: FRONTEND_URL=http://localhost:5173

MASALAH: Error 500 / Server Error
  → Cek file Backend/storage/logs/laravel.log
  → Pastikan APP_KEY sudah di-generate: php artisan key:generate

MASALAH: Upload gambar tidak tampil
  → Jalankan: php artisan storage:link
  → Pastikan folder Backend/storage/app/public bisa ditulis (writable)

MASALAH: Database tidak terhubung
  → Pastikan konfigurasi DB_* di .env sudah benar
  → Pastikan database sudah dibuat di MySQL/MariaDB
  → Jalankan: php artisan migrate

MASALAH: Setelah git pull, ada fitur yang error
  → Jalankan: composer install  (Backend)
  → Jalankan: npm install       (Frontend)
  → Jalankan: php artisan migrate
  → Jalankan: php artisan db:seed
  → Restart server backend & frontend

================================================================================
TECH STACK LENGKAP
================================================================================

  BACKEND:
    - PHP 8.5+
    - Laravel 13.x (Framework)
    - Laravel Sanctum 4.x (Autentikasi Token API)
    - MySQL / MariaDB (Database)
    - minishlink/web-push (Web Push Notification)

  FRONTEND:
    - React 19.x
    - Vite 8.x (Build tool)
    - React Router DOM 7.x (Routing SPA)
    - Axios 1.x (HTTP Client)
    - Firebase 12.x (Push Notification)
    - AOS (Animate On Scroll)

================================================================================
CATATAN PENTING UNTUK TIM
================================================================================

  1. JANGAN commit file .env ke git!
  2. JANGAN commit file firebase-credentials.json ke git!
  3. Setelah pull dari git, selalu jalankan:
       - composer install (kalau ada perubahan composer.json)
       - npm install      (kalau ada perubahan package.json)
       - php artisan migrate (kalau ada migrasi baru)
  4. Kalau ada teman yang tidak bisa login setelah pull,
     suruh jalankan: php artisan db:seed
  5. Password admin default: password123 (ganti setelah setup!)

================================================================================
  Ebony Cafe & Gallery — Internal Development Team
  Dibuat dengan Laravel + React
================================================================================
