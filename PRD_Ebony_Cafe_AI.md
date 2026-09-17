# PRODUCT REQUIREMENT DOCUMENT (PRD)

## PROJECT: EBONY — AI DINING CONCIERGE & SMART RESERVATION

**Version:** 1.0  
**Project Type:** PSAJ / Final Project  
**Application:** Ebony Cafe  
**Frontend:** React.js  
**Backend:** Laravel API  
**AI:** LLM-based AI integrated through Backend API

---

# IMPLEMENTATION STATUS (As of Sep 17, 2026)

## ✅ Selesai (DONE)
- **Customer AI (Floating AI Chat):** UI Floating chatbot di frontend (`Ask Ebony AI`) telah selesai dan terintegrasi.
- **Hide AI in Admin Dashboard:** Widget AI disembunyikan di area admin (`/admin/*`) dan hanya tampil di landing page publik.
- **AI Context Awareness:** API AI dapat mengambil referensi secara realtime dari database backend (Menu, Event, Table Reservation).
- **Menu & Occasion Recommendation:** Fitur rekomendasi menu/pairing untuk occasion (contoh: *romantic dinner*) sudah berhasil diimplementasikan via NLP prompt ke AI.
- **Dietary & Allergy Filter:** AI dapat mengecek *ingredients* dan *allergens* dari database, dan memberi rekomendasi dengan *disclaimer* standar jika ada risiko *cross-contamination*.
- **Reservation Assistance:** AI dapat menangkap informasi yang diperlukan (tanggal, jumlah tamu) di chat untuk persiapan reservasi.
- **Polite Error Handling:** Error message dari AI sudah diperhalus untuk mengarahkan customer menghubungi Admin di WhatsApp jika terjadi kendala teknis atau ketika ketersediaan meja tidak diketahui AI.
- **Guest Request Analyzer (Admin AI):** Fungsional ✨ *AI Guest Request Analyzer* di halaman *Reservation Detail* untuk staf sudah terimplementasi dan berfungsi penuh untuk ekstrak sentimen dan langkah antisipasi staf.

## ❌ Belum Dibuat / Out of Scope
Sesuai arahan Scope PRD, fitur di bawah ini memang belum diimplementasikan di versi saat ini (disengaja):
- Voice assistant.
- Image generation dari AI.
- Memproses checkout atau pembayaran langsung via AI.
- AI melakukan registrasi reservasi otonom tanpa adanya intervensi/konfirmasi user melalui GUI.

---

# 1. PROJECT OVERVIEW

Ebony adalah aplikasi **Ebony Cafe** yang memiliki fitur utama:

- Restaurant Landing Page
- Menu Management
- Restaurant Reservation
- Event Dining
- Reservation Management
- Customer Information
- Admin Dashboard

Project ini akan dikembangkan dengan menambahkan fitur Artificial Intelligence (AI) yang terintegrasi langsung dengan sistem Ebony.

AI pada Ebony tidak boleh menjadi chatbot umum. AI harus memahami konteks restoran berdasarkan data yang tersedia di sistem Ebony.

Nama fitur AI:

**Ebony AI Dining Concierge**

AI berfungsi sebagai asisten restoran digital yang membantu pelanggan:

1. Menemukan menu yang sesuai dengan kebutuhan.
2. Memberikan rekomendasi kombinasi makanan dan minuman.
3. Membantu menentukan waktu dan kebutuhan reservasi.
4. Memahami kebutuhan khusus pelanggan.
5. Memberikan rekomendasi berdasarkan event yang tersedia.
6. Menjawab pertanyaan mengenai menu dan restoran berdasarkan data Ebony.

---

# 2. PROBLEM STATEMENT

Pelanggan restoran sering mengalami kesulitan ketika:

- Tidak tahu menu yang cocok dengan kebutuhannya.
- Tidak tahu makanan mana yang cocok dipadukan.
- Memiliki alergi atau preferensi makanan tertentu.
- Bingung memilih meja atau waktu reservasi.
- Tidak mengetahui event yang sedang tersedia.
- Harus membaca banyak informasi menu secara manual.

Dari sisi restoran, staf juga perlu memahami special request pelanggan dengan cepat.

Karena itu, Ebony membutuhkan AI yang dapat menjadi penghubung antara pelanggan dengan informasi restoran.

---

# 3. PRODUCT GOALS

## Primary Goal

Membuat AI Dining Concierge yang mampu memberikan rekomendasi personal kepada pelanggan berdasarkan data aktual Ebony Cafe.

## Secondary Goals

AI harus mampu:

- Memahami bahasa natural.
- Menggunakan data menu Ebony Cafe.
- Menggunakan data event Ebony Cafe.
- Membantu proses reservasi.
- Mengenali dietary preference.
- Mengenali alergi.
- Mengenali special occasion.
- Memberikan rekomendasi menu.
- Memberikan rekomendasi pairing.

---

# 4. TARGET USERS

## 4.1 Customer

Customer menggunakan AI untuk:

- Bertanya tentang menu.
- Mencari rekomendasi makanan.
- Mencari makanan berdasarkan dietary preference.
- Mencari pairing.
- Mendapatkan rekomendasi berdasarkan occasion.
- Mendapatkan bantuan reservasi.

## 4.2 Admin / Restaurant Staff

Admin menggunakan hasil AI untuk:

- Melihat special request pelanggan.
- Memahami kebutuhan pelanggan.
- Mendapatkan kategori request secara otomatis.

---

# 5. PRODUCT SCOPE

## INCLUDED

### Customer AI

1. AI Dining Concierge
2. Menu Recommendation
3. Food & Beverage Pairing
4. Dietary Filtering
5. Allergy Awareness
6. Occasion Recommendation
7. Event Recommendation
8. Reservation Assistance

### Staff AI

9. Guest Special Request Analyzer

---

# 6. OUT OF SCOPE

Fitur berikut tidak wajib dibuat pada versi pertama:

- AI voice assistant
- AI image generation
- AI payment processing
- AI autonomous reservation tanpa konfirmasi user
- AI melakukan transaksi pembayaran
- AI menggantikan customer service manusia
- AI membuat data menu baru secara otomatis ke database tanpa persetujuan admin
- AI menentukan diagnosis kesehatan atau rekomendasi medis

---

# 7. AI DINING CONCIERGE

## 7.1 UI

AI harus tersedia pada halaman customer.

Bentuk UI:

**Floating AI Button**

Contoh:

`Ask Ebony AI`

Ketika tombol ditekan, muncul:

### AI Concierge Panel

Header:

**Ebony AI**

Subtitle:

`Your personal dining concierge`

Contoh initial prompt:

> "What are you looking for tonight?"

Quick action:

- 🍽️ Recommend a menu
- ❤️ Romantic dinner
- 🌱 Dietary friendly
- 🥩 Food pairing
- 📅 Help me reserve
- 🎉 Find an event

---

# 8. NATURAL LANGUAGE QUERY

Customer dapat menggunakan bahasa natural.

Contoh:

> Saya mau dinner romantis berdua.

AI harus memahami:

```json
{
  "occasion": "romantic",
  "guest_count": 2
}
```

Contoh lain:

> Aku alergi seafood dan mau makanan yang tidak terlalu pedas.

AI harus memahami:

```json
{
  "allergies": ["seafood"],
  "spicy_level": "low"
}
```

Contoh:

> Aku mau makan malam untuk 4 orang hari Sabtu.

AI harus memahami:

```json
{
  "meal": "dinner",
  "guest_count": 4,
  "date": "Saturday"
}
```

---

# 9. AI CONTEXT

AI tidak boleh memberikan rekomendasi berdasarkan pengetahuan umum saja.

AI harus menggunakan data dari database Ebony Cafe.

Minimal context yang diberikan ke AI:

## Menu

```text
Menu ID
Menu Name
Description
Category
Price
Ingredients
Dietary Tags
Allergens
Spicy Level
Availability
```

## Restaurant

```text
Restaurant Name
Opening Hours
Available Tables
Table Type
Table Capacity
Table Location
```

## Events

```text
Event ID
Event Name
Event Description
Event Date
Event Time
Event Category
Availability
```

---

# 10. MENU RECOMMENDATION

AI harus dapat merekomendasikan menu berdasarkan input user.

### Input

User:

> "Aku mau dinner romantis berdua."

### Processing

AI:

1. Menganalisis intent.
2. Menentukan occasion.
3. Mengambil data menu dari backend.
4. Melakukan filtering.
5. Menentukan beberapa menu relevan.
6. Menghasilkan alasan rekomendasi.

### Output

Contoh:

> Untuk dinner romantis berdua, saya merekomendasikan:
>
> **Starter:** Menu A  
> **Main Course:** Menu B  
> **Drink:** Menu C  
> **Dessert:** Menu D
>
> Kombinasi ini cocok untuk dinner berdua karena memiliki karakter menu yang saling melengkapi.

AI tidak boleh mengarang menu yang tidak terdapat dalam database.

---

# 11. FOOD & BEVERAGE PAIRING

AI harus dapat memberikan rekomendasi pairing.

Contoh:

User:

> "Steak ini cocok dengan apa?"

AI mengambil menu steak dari database.

Kemudian memberikan:

```text
Recommended Pairing

Main:
Steak X

Drink:
Drink Y

Dessert:
Dessert Z
```

AI harus menjelaskan alasan pairing secara singkat.

---

# 12. DIETARY & ALLERGY FILTER

AI harus memperhatikan:

- Vegan
- Vegetarian
- Halal
- Gluten-Free
- Dairy-Free
- Nut Allergy
- Seafood Allergy
- Spicy Level

Jika customer menyebut alergi:

> "Saya alergi kacang."

AI harus mengecualikan menu yang memiliki:

```text
allergen = nuts
```

atau menu yang bahan/komposisinya mengandung kacang.

## IMPORTANT SAFETY RULE

AI tidak boleh memberikan jaminan medis seperti:

> "Menu ini 100% aman untuk alergi Anda."

Gunakan bahasa:

> "Berdasarkan informasi bahan yang tersedia di sistem Ebony, menu ini tidak tercatat mengandung kacang. Namun, silakan konfirmasi kembali kepada staf restoran terkait kemungkinan cross-contamination."

---

# 13. OCCASION RECOMMENDATION

AI harus memahami occasion.

### Romantic

Keyword:

- romantic
- date
- anniversary
- dinner berdua

### Birthday

Keyword:

- birthday
- ulang tahun
- celebration

### Business

Keyword:

- meeting
- business dinner
- client meeting

### Family

Keyword:

- family
- keluarga

AI kemudian dapat memberikan rekomendasi menu/event/table berdasarkan data Ebony Cafe.

---

# 14. EVENT RECOMMENDATION

AI harus dapat membaca event yang tersedia.

Contoh:

User:

> "Ada event apa malam ini?"

AI mengambil event dari database.

Response:

> "Berdasarkan event yang tersedia di Ebony Cafe, malam ini terdapat [EVENT DATA]."

AI tidak boleh mengarang event.

Jika tidak ada event:

> "Saat ini tidak ada event yang tersedia pada waktu tersebut."

---

# 15. RESERVATION ASSISTANT

AI dapat membantu customer menentukan kebutuhan reservasi.

AI harus mampu mengidentifikasi:

```json
{
  "date": "",
  "time": "",
  "guest_count": 0,
  "occasion": "",
  "table_preference": "",
  "special_request": ""
}
```

Contoh:

User:

> "Saya mau reservasi untuk 4 orang, Sabtu jam 7 malam, kalau bisa meja yang tenang."

AI:

```json
{
  "guest_count": 4,
  "date": "Saturday",
  "time": "19:00",
  "table_preference": "quiet_area"
}
```

AI kemudian meminta user melakukan konfirmasi sebelum reservasi dibuat.

---

# 16. RESERVATION CONFIRMATION

AI TIDAK BOLEH langsung membuat reservasi hanya berdasarkan satu pesan.

Flow:

```text
Customer Request
        ↓
AI Extract Information
        ↓
Check Availability
        ↓
Show Reservation Summary
        ↓
Customer Confirmation
        ↓
Create Reservation
```

Contoh confirmation:

> **Reservation Summary**
>
> Date: Saturday, 20 September  
> Time: 19:00  
> Guests: 4  
> Preference: Quiet Area
>
> Apakah Anda ingin melanjutkan reservasi?

Button:

`Confirm Reservation`

`Change Details`

---

# 17. AI CHAT MEMORY

AI harus mempertahankan konteks selama satu sesi chat.

Contoh:

User:

> Saya mau dinner romantis.

AI:

> Tentu. Untuk berapa orang?

User:

> Dua orang.

AI harus memahami bahwa:

```text
occasion = romantic
guest_count = 2
```

AI tidak boleh kehilangan konteks percakapan sebelumnya.

---

# 18. AI RESPONSE RULES

AI harus:

- Bahasa natural.
- Ramah.
- Singkat tetapi informatif.
- Tidak terlalu formal.
- Menggunakan data Ebony Cafe.
- Tidak mengarang data.
- Tidak membuat menu fiktif.
- Tidak membuat event fiktif.
- Tidak membuat harga fiktif.
- Tidak membuat jadwal fiktif.
- Tidak memberikan informasi yang tidak tersedia di database.

Jika informasi tidak tersedia:

> "Maaf, informasi tersebut belum tersedia di sistem Ebony Cafe."

---

# 19. BACKEND ARCHITECTURE

Existing architecture:

```text
React Frontend
      ↓
Laravel REST API
      ↓
Database
```

AI architecture:

```text
React
  ↓
Laravel API
  ↓
AI Service
  ↓
LLM API
  ↓
AI Response
  ↓
Laravel
  ↓
React
```

AI API key TIDAK BOLEH diletakkan di React/frontend.

API key harus disimpan di:

```env
AI_API_KEY=
```

pada Laravel backend.

---

# 20. PROPOSED API ENDPOINTS

## Chat

```http
POST /api/ai/chat
```

Request:

```json
{
  "message": "Saya mau dinner romantis untuk dua orang",
  "conversation_id": "optional-id"
}
```

Response:

```json
{
  "success": true,
  "message": "Untuk dinner romantis berdua...",
  "conversation_id": "abc123",
  "recommendations": []
}
```

---

## Menu Recommendation

```http
POST /api/ai/menu-recommendation
```

Request:

```json
{
  "occasion": "romantic",
  "guest_count": 2,
  "dietary": [],
  "allergies": [],
  "spicy_level": "medium"
}
```

Response:

```json
{
  "success": true,
  "recommendations": [
    {
      "menu_id": 1,
      "reason": "..."
    }
  ]
}
```

---

## Reservation Assistance

```http
POST /api/ai/reservation-assistant
```

Request:

```json
{
  "message": "Saya mau reservasi untuk 4 orang Sabtu jam 7"
}
```

Response:

```json
{
  "guest_count": 4,
  "date": "2026-09-19",
  "time": "19:00",
  "special_request": null
}
```

---

## Guest Request Analyzer

```http
POST /api/ai/analyze-request
```

Request:

```json
{
  "reservation_id": 123,
  "special_request": "Saya sedang anniversary, kalau bisa meja yang tenang dan tolong siapkan ucapan."
}
```

Response:

```json
{
  "category": "anniversary",
  "priority": "medium",
  "detected_request": [
    "quiet_table",
    "celebration"
  ],
  "staff_action": [
    "Prepare quiet table",
    "Prepare anniversary greeting"
  ]
}
```

---

# 21. DATABASE REQUIREMENTS

Jangan mengubah database existing secara besar-besaran.

Gunakan tabel existing jika field yang diperlukan sudah tersedia.

Jika belum tersedia, tambahkan field/tabel secara minimal.

## Recommended menu fields

```text
id
name
description
category
price
ingredients
dietary_tags
allergens
spicy_level
is_available
```

## Recommended reservation fields

```text
id
customer_id
reservation_date
reservation_time
guest_count
table_id
special_request
status
```

## AI Conversation

Jika diperlukan:

```text
ai_conversations
```

Fields:

```text
id
user_id
session_id
created_at
updated_at
```

## AI Messages

```text
ai_messages
```

Fields:

```text
id
conversation_id
role
message
created_at
```

---

# 22. FRONTEND REQUIREMENTS

Framework:

**React.js**

AI component:

```text
components/
└── ai/
    ├── AIChatWidget.jsx
    ├── AIChatMessage.jsx
    ├── AIQuickActions.jsx
    ├── AIRecommendationCard.jsx
    └── AIReservationSummary.jsx
```

API service:

```text
services/
└── aiService.js
```

---

# 23. AI CHAT UI

Chat interface harus memiliki:

### Header

```text
Ebony AI
Your Dining Concierge
```

### Chat Area

User message:

```text
Saya mau dinner romantis berdua.
```

AI message:

```text
Tentu! Saya bisa membantu.
Apakah Anda memiliki preferensi makanan atau alergi tertentu?
```

### Input

Placeholder:

```text
Ask Ebony AI...
```

Button:

```text
Send
```

---

# 24. RECOMMENDATION CARD

AI recommendation harus dapat ditampilkan dalam card.

Card:

```text
[IMAGE]

Menu Name

Category

Rp XX.XXX

Why we recommend it:
...

[View Menu]
```

Jika tersedia:

```text
Dietary:
✓ Vegetarian
✓ Gluten Free
```

---

# 25. ERROR HANDLING

Jika AI API gagal:

```text
Maaf, Ebony AI sedang mengalami gangguan.
Silakan coba lagi beberapa saat.
```

Jika database tidak tersedia:

```text
Maaf, informasi restoran sedang tidak dapat diakses.
```

Jika input tidak jelas:

AI harus bertanya kembali.

Contoh:

> "Saya bisa membantu reservasi. Untuk berapa orang?"

---

# 26. SECURITY

WAJIB:

- AI API key hanya di backend.
- Jangan expose API key di frontend.
- Validasi seluruh request.
- Rate limiting untuk AI endpoint.
- Sanitize user input.
- Jangan mengirim data sensitif yang tidak diperlukan ke LLM.
- Jangan memperbolehkan AI menjalankan arbitrary database query.
- AI hanya dapat menggunakan data yang diberikan oleh backend.

---

# 27. AI HALLUCINATION PREVENTION

AI harus memiliki aturan sistem:

```text
You are Ebony AI, the official dining concierge for Ebony Cafe.

You must only provide information based on the restaurant data supplied by the application.

Never invent:
- menu
- price
- ingredients
- event
- reservation availability
- restaurant policy
- opening hours

If information is unavailable, clearly state that the information is not available.

For allergies, never guarantee that a menu is medically safe.
Recommend confirming with restaurant staff.
```

---

# 28. AI TOOL / FUNCTION CONCEPT

Jika LLM provider mendukung tool/function calling, gunakan function calling.

Recommended tools:

```text
search_menu()
get_menu_details()
search_events()
check_reservation_availability()
get_available_tables()
create_reservation()
```

AI tidak melakukan database query secara langsung.

AI memanggil backend function.

Contoh:

```text
User
 ↓
AI
 ↓
search_menu()
 ↓
Laravel
 ↓
Database
 ↓
Result
 ↓
AI
 ↓
User
```

---

# 29. ADMIN — GUEST SPECIAL REQUEST ANALYZER

Pada halaman detail reservasi, tambahkan:

```text
AI Analysis
```

Contoh special request:

> "Ini anniversary kami. Kalau bisa meja pojok yang tenang dan siapkan ucapan."

AI menghasilkan:

```text
Category:
Anniversary

Priority:
Medium

Detected Requests:
• Quiet table
• Anniversary celebration
• Greeting preparation

Suggested Staff Actions:
• Prepare quiet table
• Prepare anniversary greeting
```

Staff tetap menjadi pihak yang mengambil keputusan akhir.

---

# 30. AI LOGGING

Simpan log minimal:

```text
conversation_id
user_id
request
response
created_at
```

Jangan menyimpan informasi sensitif yang tidak diperlukan.

Logging digunakan untuk:

- debugging
- evaluasi AI
- mengetahui error
- meningkatkan kualitas prompt

---

# 31. PERFORMANCE REQUIREMENTS

Target:

- Frontend tidak freeze ketika AI memproses.
- Gunakan loading state.
- Gunakan streaming response jika provider mendukung.
- API timeout harus ditangani.
- Jangan mengirim seluruh database menu ke LLM jika tidak diperlukan.
- Filter data terlebih dahulu di backend.
- Kirim hanya data yang relevan ke AI.

---

# 32. AI PROCESSING FLOW

```text
Customer
   ↓
Enter Message
   ↓
React AI Chat
   ↓
POST /api/ai/chat
   ↓
Laravel
   ↓
Detect Intent
   ↓
Retrieve Relevant Ebony Cafe Data
   ↓
Build AI Context
   ↓
Send to LLM
   ↓
Receive Response
   ↓
Validate AI Response
   ↓
Return JSON
   ↓
React
   ↓
Display Response
```

---

# 33. INTENT CLASSIFICATION

AI minimal harus dapat mengenali:

```text
MENU_RECOMMENDATION
MENU_INFORMATION
FOOD_PAIRING
DIETARY_REQUEST
ALLERGY_REQUEST
EVENT_INFORMATION
RESERVATION_REQUEST
SPECIAL_OCCASION
GENERAL_RESTAURANT_INFORMATION
UNKNOWN
```

---

# 34. EXAMPLE CONVERSATION

## Example 1

User:

> Aku mau makan malam romantis berdua.

AI:

> Tentu! Untuk dinner romantis berdua, saya bisa merekomendasikan beberapa pilihan menu. Apakah ada alergi atau preferensi makanan tertentu?

---

## Example 2

User:

> Aku alergi seafood.

AI:

> Baik, saya akan menghindari menu yang tercatat mengandung seafood. Berdasarkan data Ebony Cafe, berikut beberapa pilihan yang sesuai...

---

## Example 3

User:

> Ada event malam ini?

AI:

> Berdasarkan event yang tersedia di Ebony Cafe, malam ini terdapat [EVENT DATA].

---

## Example 4

User:

> Saya mau reservasi.

AI:

> Tentu. Untuk berapa orang dan tanggal berapa?

---

# 35. ACCEPTANCE CRITERIA

Fitur dianggap selesai jika:

### AI Chat

- [ ] Customer dapat membuka AI.
- [ ] Customer dapat mengirim pertanyaan.
- [ ] AI dapat menjawab.
- [ ] AI mempertahankan konteks percakapan.
- [ ] Loading state tersedia.
- [ ] Error state tersedia.

### Menu Recommendation

- [ ] AI membaca data menu dari backend.
- [ ] AI dapat merekomendasikan menu.
- [ ] AI tidak membuat menu fiktif.
- [ ] AI dapat memberikan alasan rekomendasi.

### Dietary

- [ ] AI memahami dietary preference.
- [ ] AI memahami alergi.
- [ ] Menu yang memiliki allergen relevan harus difilter.
- [ ] AI tidak memberikan jaminan keamanan medis.

### Pairing

- [ ] AI dapat merekomendasikan pairing.
- [ ] Pairing berasal dari menu yang tersedia.

### Event

- [ ] AI dapat membaca event.
- [ ] AI tidak mengarang event.

### Reservation

- [ ] AI dapat memahami jumlah orang.
- [ ] AI dapat memahami tanggal.
- [ ] AI dapat memahami waktu.
- [ ] AI dapat memahami special request.
- [ ] Availability dicek melalui backend.
- [ ] Customer harus melakukan konfirmasi sebelum reservasi dibuat.

### Guest Request Analyzer

- [ ] AI dapat mengklasifikasikan special request.
- [ ] AI memberikan suggested action.
- [ ] Staff tetap dapat memeriksa hasil AI.

---

# 36. IMPLEMENTATION PRIORITY

## PHASE 1 — FOUNDATION

1. Audit existing Laravel API.
2. Audit existing React structure.
3. Audit existing database.
4. Identifikasi tabel menu.
5. Identifikasi tabel reservation.
6. Identifikasi tabel event.
7. Setup AI service.
8. Setup environment variable.

## PHASE 2 — AI CHAT

1. Create `/api/ai/chat`.
2. Create AI service.
3. Create prompt.
4. Connect LLM.
5. Create React chat widget.
6. Implement conversation context.

## PHASE 3 — RECOMMENDATION

1. Menu retrieval.
2. Menu filtering.
3. Recommendation response.
4. Recommendation card.
5. Dietary filtering.
6. Allergy handling.
7. Pairing.

## PHASE 4 — RESERVATION

1. Extract reservation intent.
2. Check availability.
3. Reservation summary.
4. Confirmation.
5. Create reservation.

## PHASE 5 — STAFF AI

1. Guest Request Analyzer.
2. Category detection.
3. Priority detection.
4. Suggested action.
5. Display on Reservation Detail.

## PHASE 6 — TESTING

Test:

- Normal questions.
- Invalid questions.
- Empty input.
- Allergy request.
- Dietary request.
- Menu recommendation.
- Event request.
- Reservation request.
- API failure.
- AI failure.
- Hallucination prevention.
- Unauthorized access.

---

# 37. DEFINITION OF DONE

Ebony AI dianggap berhasil jika customer dapat melakukan percakapan natural dengan AI dan mendapatkan rekomendasi berdasarkan data aktual Ebony Cafe.

Minimal flow yang harus berhasil:

```text
Customer:
"Saya mau dinner romantis untuk 2 orang,
saya alergi seafood."

        ↓

Ebony AI

        ↓

Backend mengambil menu Ebony Cafe

        ↓

Filter seafood/allergen

        ↓

AI memilih rekomendasi

        ↓

Customer menerima:

Starter
Main Course
Drink
Dessert

        ↓

Customer:
"Sekalian reservasi jam 7 malam."

        ↓

AI mengambil informasi reservasi

        ↓

Backend mengecek availability

        ↓

AI menampilkan reservation summary

        ↓

Customer:
"Confirm"

        ↓

Backend membuat reservation
```

---

# 38. IMPORTANT INSTRUCTION FOR AI CODING AGENT

AI coding agent yang mengerjakan project ini WAJIB mengikuti aturan berikut:

1. Jangan membuat ulang project Ebony dari nol.
2. Jangan menghapus fitur existing.
3. Jangan mengubah struktur database secara besar-besaran tanpa alasan.
4. Audit code existing terlebih dahulu.
5. Identifikasi framework dan struktur folder sebelum melakukan perubahan.
6. Gunakan architecture yang sudah digunakan project.
7. Backend AI harus berada di Laravel.
8. Jangan meletakkan API key di React.
9. Jangan hardcode data menu untuk kebutuhan AI.
10. Gunakan database Ebony Cafe sebagai source of truth.
11. AI tidak boleh mengarang menu, harga, event, availability, atau informasi restoran.
12. Gunakan reusable React components.
13. Gunakan Laravel Service untuk logic AI.
14. Gunakan validation pada setiap AI endpoint.
15. Tambahkan error handling.
16. Tambahkan loading state pada frontend.
17. Jangan merusak endpoint existing.
18. Jangan menghapus fitur existing.
19. Sebelum coding, lakukan audit project dan buat daftar file yang akan diubah.
20. Setelah implementasi, lakukan testing terhadap seluruh flow AI.

---

# 39. EXPECTED TECHNICAL STRUCTURE

Recommended Laravel:

```text
app/
├── Http/
│   └── Controllers/
│       └── AIController.php
│
├── Services/
│   └── AI/
│       ├── AIService.php
│       ├── MenuRecommendationService.php
│       ├── ReservationAIService.php
│       └── GuestRequestAnalyzer.php
│
└── Models/
```

Recommended React:

```text
src/
├── components/
│   └── ai/
│       ├── AIChatWidget.jsx
│       ├── AIChatMessage.jsx
│       ├── AIQuickActions.jsx
│       ├── AIRecommendationCard.jsx
│       └── AIReservationSummary.jsx
│
├── services/
│   └── aiService.js
│
└── pages/
```

Structure tersebut boleh disesuaikan dengan struktur existing project Ebony.

---

# 40. FINAL PRODUCT VISION

Ebony Cafe bukan sekadar restaurant reservation system.

Dengan integrasi AI, Ebony Cafe menjadi:

**AI-Powered Cafe Experience Platform**

Customer tidak hanya datang ke website untuk melihat menu atau melakukan reservasi.

Customer dapat berbicara langsung dengan Ebony AI untuk menemukan pengalaman dining yang sesuai dengan kebutuhan mereka.

Core experience:

```text
ASK
 ↓
UNDERSTAND
 ↓
RECOMMEND
 ↓
RESERVE
 ↓
DINE
```

Tagline fitur:

> **"Your personal dining concierge, powered by Ebony AI."**
---

# 41. IMPLEMENTATION TRACKING (UPDATE)

## YANG SUDAH DIKERJAKAN

### 1. Backend & Database
- Dibuat migration untuk tabel menus (menambahkan ingredients, dietary_tags, llergens, spicy_level).
- Dibuat migration dan model untuk memori AI (i_conversations & i_messages).
- Diperbarui AIController agar bisa menangani conversation_id.
- Disempurnakan AIService untuk menggunakan memori percakapan (Conversation History) secara otomatis ke database.
- Kode query database dibungkus dengan 	ry-catch agar tidak crash saat database belum di-migrate.
- Model API Google diupdate ke versi terbaru (gemini-3.5-flash) yang valid.

### 2. Frontend UI
- Dibuat komponen FloatingAIChat.jsx sebagai interface Asisten Virtual (AI Dining Concierge) bagi customer, lengkap dengan fitur chat, loading state, dan memory ID.
- FloatingAIChat.jsx diinjeksi ke global layout (App.jsx) sehingga tampil di semua halaman publik.
- Ditambahkan antarmuka **AI Guest Request Analyzer** pada sisi Admin di ReservationDetailPage.jsx yang bisa menganalisis request khusus pelanggan menjadi data JSON (kategori, prioritas, daftar permintaan, & action staff).

### 3. UI/UX Responsiveness & Layout
- Memperbaiki layout Navbar.jsx untuk tampilan *mobile* dengan menyembunyikan tombol 'CONTACT' agar ikon *Hamburger menu* dan logo tidak berdesakan/tumpang tindih di layar kecil.
- Menyesuaikan ukuran kotak FloatingAIChat.jsx menggunakan maxWidth dan maxHeight (misal 100vw & 100vh minus padding) agar secara dinamis menyesuaikan diri (responsif) tanpa terpotong baik saat dibuka di *smartphone*, *tablet*, maupun *desktop*.

## YANG BELUM DIKERJAKAN (PENDING/TODO)

1. **AI Reservation Flow (Multi-step Booking)**: Saat ini, AI difokuskan pada tahap *greeting*, rekomendasi menu, dan *Analyzer* internal. Kemampuan AI untuk mengeksekusi secara penuh proses reservasi mandiri (mengumpulkan nama, tanggal, jumlah kursi, lalu menyimpannya sendiri ke database melalui percakapan) belum sepenuhnya terimplementasi secara interaktif di *frontend*.
2. **Error Handling/Feedback dari Google Gemini (Overload Handling)**: Perlu penanganan UI yang lebih elegan ketika API Google Gemini mengalami *Error 503 (High Demand/Overload)* agar user/customer tidak bingung dan diberitahu untuk mencoba beberapa saat lagi dengan *wording* yang bersahabat.
3. **Menu Recommendation UI Card**: Belum ada komponen grafis seperti *Card Carousel* di dalam balasan AI apabila AI merekomendasikan menu tertentu (saat ini masih berbasis teks murni/Markdown).
