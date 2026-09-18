<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Menu;
use App\Models\Event;
use App\Models\RestaurantTable;
use App\Models\AIConversation;
use Illuminate\Support\Str;

class AIService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.groq.api_key') ?? env('GROQ_API_KEY', env('AI_API_KEY', ''));
        $this->model = config('services.groq.model') ?? env('GROQ_MODEL', 'openai/gpt-oss-20b');
        $this->baseUrl = config('services.groq.base_url', 'https://api.groq.com/openai/v1/chat/completions');
    }

    protected function getContext(): string
    {
        $ctx = "";

        try {
            $menus = Menu::where('is_available', true)->get();
            if ($menus->count() > 0) {
                $ctx .= "MENU UTAMA:\n";
                foreach ($menus->take(8) as $m) {
                    $ctx .= "- {$m->name} (Rp" . number_format($m->price, 0, ',', '.') . ") [{$m->category}]\n";
                }
            }
        } catch (\Exception $e) {}

        try {
            $tables = RestaurantTable::all();
            if ($tables->count() > 0) {
                $ctx .= "AREA MEJA:\n";
                foreach ($tables as $t) {
                    $ctx .= "- {$t->name} ({$t->area}, kap: {$t->capacity})\n";
                }
            }
        } catch (\Exception $e) {}

        return $ctx;
    }

    protected function extractReservationState(array $historyMessages, string $currentMessage, \Carbon\Carbon $now): array
    {
        $daysMap = [
            'senin' => 1, 'selasa' => 2, 'rabu' => 3, 'kamis' => 4,
            'jumat' => 5, 'sabtu' => 6, 'minggu' => 7, 'ahad' => 7,
            'monday' => 1, 'tuesday' => 2, 'wednesday' => 3, 'thursday' => 4,
            'friday' => 5, 'saturday' => 6, 'sunday' => 7,
        ];

        $monthNames = [
            'jan' => 1, 'januari' => 1, 'feb' => 2, 'februari' => 2,
            'mar' => 3, 'maret' => 3, 'apr' => 4, 'april' => 4,
            'mei' => 5, 'may' => 5, 'jun' => 6, 'juni' => 6,
            'jul' => 7, 'juli' => 7, 'agu' => 8, 'agustus' => 8,
            'sep' => 9, 'september' => 9, 'okt' => 10, 'oktober' => 10,
            'nov' => 11, 'november' => 11, 'des' => 12, 'desember' => 12
        ];

        $userTexts = [];
        foreach ($historyMessages as $m) {
            if (is_string($m)) {
                $userTexts[] = strtolower($m);
            } elseif (is_array($m) && ($m['role'] ?? '') === 'user') {
                $userTexts[] = strtolower($m['content'] ?? '');
            }
        }
        $userTexts[] = strtolower($currentMessage);

        $lastText = strtolower(trim($currentMessage));
        $allText = implode(' | ', $userTexts);

        $state = [
            'wants_reservation' => false,
            'is_pilih_sendiri' => false,
            'is_weekend_clicked' => false,
            'is_monday_rejected' => false,
            'is_confirmed' => false,
            'tanggal' => null,
            'jam' => null,
            'jumlah_tamu' => null,
            'area' => null,
        ];

        // 1. Check Intent
        if (preg_match('/reservasi|pesan\s*meja|booking|meja/i', $allText)) {
            $state['wants_reservation'] = true;
        }

        // 2. Check "Pilih Sendiri" or "Tanggal Lain"
        if (preg_match('/pilih\s*(tanggal)?\s*sendiri|tanggal\s*lain/i', $lastText)) {
            $state['is_pilih_sendiri'] = true;
            $state['wants_reservation'] = true;
        }

        // 3. Check "Weekend Ini"
        if (preg_match('/weekend\s*ini|akhir\s*pekan/i', $lastText)) {
            $state['is_weekend_clicked'] = true;
            $state['wants_reservation'] = true;
        }

        // 4. Check Confirmation
        if (preg_match('/(ya[,\s]+)?(sudah\s*)?benar|✅|setuju|oke\s*fix|konfirmasi|deal/i', $lastText)) {
            $state['is_confirmed'] = true;
            $state['wants_reservation'] = true;
        }

        // 5. Date Extraction
        foreach ($userTexts as $text) {
            // Ignore command words
            if (preg_match('/^📅?\s*(pilih\s*sendiri|weekend\s*ini|minggu\s*depan)/i', trim($text))) {
                continue;
            }

            if (preg_match('/\bhari\s*ini\b/i', $text)) {
                $state['tanggal'] = $now->translatedFormat('l, d F Y');
            } elseif (preg_match('/\bbesok\b/i', $text)) {
                $d = $now->copy()->addDay();
                if ($d->dayOfWeekIso === 1) {
                    $state['is_monday_rejected'] = true;
                } else {
                    $state['tanggal'] = $d->translatedFormat('l, d F Y');
                }
            } elseif (preg_match('/\blusa\b/i', $text)) {
                $d = $now->copy()->addDays(2);
                if ($d->dayOfWeekIso === 1) {
                    $state['is_monday_rejected'] = true;
                } else {
                    $state['tanggal'] = $d->translatedFormat('l, d F Y');
                }
            } elseif (preg_match('/(\d{1,2})\s*(jan|feb|mar|apr|mei|may|jun|jul|agu|aug|sep|okt|oct|nov|des|dec)[a-z]*\s*(\d{2,4})?/i', $text, $match)) {
                $day = (int)$match[1];
                $monthStr = strtolower(substr($match[2], 0, 3));
                $month = $monthNames[$monthStr] ?? $now->month;
                $year = !empty($match[3]) ? (int)$match[3] : $now->year;
                if ($year < 100) $year += 2000;
                if (checkdate($month, $day, $year)) {
                    $d = \Carbon\Carbon::createFromDate($year, $month, $day, 'Asia/Jakarta');
                    if ($d->dayOfWeekIso === 1) {
                        $state['is_monday_rejected'] = true;
                        $state['tanggal'] = null;
                    } else {
                        $state['tanggal'] = $d->translatedFormat('l, d F Y');
                        $state['is_monday_rejected'] = false;
                        $state['wants_reservation'] = true;
                    }
                }
            } elseif (preg_match('/\b(senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b/i', $text, $dMatch)) {
                $dayName = strtolower($dMatch[1]);
                $targetIso = $daysMap[$dayName];
                if ($targetIso === 1) {
                    $state['is_monday_rejected'] = true;
                    $state['tanggal'] = null;
                } else {
                    $diff = $targetIso - $now->dayOfWeekIso;
                    if ($diff < 0) $diff += 7;
                    $d = $now->copy()->addDays($diff);
                    $state['tanggal'] = $d->translatedFormat('l, d F Y');
                    $state['is_monday_rejected'] = false;
                    $state['wants_reservation'] = true;
                }
            }
        }

        // 6. Time Extraction
        foreach ($userTexts as $text) {
            if (preg_match('/(?:jam|pukul|at)\s*(\d{1,2})(?:[\:\.]([\d]{2}))?\s*(pagi|siang|sore|malam)?/i', $text, $tMatch)) {
                $h = (int)$tMatch[1];
                $m = !empty($tMatch[2]) ? (int)$tMatch[2] : 0;
                $mod = !empty($tMatch[3]) ? strtolower($tMatch[3]) : '';
                if ($mod === 'malam' && $h < 12) $h += 12;
                elseif ($mod === 'sore' && $h < 12 && $h >= 1) $h += 12;
                elseif ($mod === 'siang' && $h < 12 && $h <= 4) $h += 12;
                $state['jam'] = sprintf('%02d:%02d WIB', $h, $m);
                $state['wants_reservation'] = true;
            } elseif (preg_match('/\b(\d{1,2})[\:\.](\d{2})\s*(wib)?\b/i', $text, $tMatch)) {
                $state['jam'] = sprintf('%02d:%02d WIB', (int)$tMatch[1], (int)$tMatch[2]);
                $state['wants_reservation'] = true;
            } elseif (preg_match('/brunch|siang/i', $text) && !$state['jam']) {
                $state['jam'] = '12:30 WIB';
            } elseif (preg_match('/sore/i', $text) && !$state['jam']) {
                $state['jam'] = '16:00 WIB';
            } elseif (preg_match('/malam|dinner/i', $text) && !$state['jam']) {
                $state['jam'] = '19:00 WIB';
            }
        }

        // 7. Guest Count Extraction
        foreach ($userTexts as $text) {
            if (preg_match('/(\d+)\s*(?:-\s*(\d+))?\s*(?:orang|pax|tamu)/i', $text, $gMatch)) {
                $state['jumlah_tamu'] = !empty($gMatch[2]) ? "{$gMatch[1]}-{$gMatch[2]} Orang" : "{$gMatch[1]} Orang";
                $state['wants_reservation'] = true;
            } elseif (preg_match('/rombongan|lebih\s*dari\s*6/i', $text)) {
                $state['jumlah_tamu'] = "7+ Orang (Rombongan)";
                $state['wants_reservation'] = true;
            }
        }

        // 8. Area Extraction
        foreach ($userTexts as $text) {
            if (preg_match('/vip(\s*lounge)?/i', $text)) {
                $state['area'] = 'VIP Lounge';
                $state['wants_reservation'] = true;
            } elseif (preg_match('/terrace|outdoor/i', $text)) {
                $state['area'] = 'Terrace (Outdoor)';
                $state['wants_reservation'] = true;
            } elseif (preg_match('/main\s*hall|indoor/i', $text)) {
                $state['area'] = 'Main Hall (Indoor)';
                $state['wants_reservation'] = true;
            }
        }

        return $state;
    }

    public function chat(string $message, ?string $conversationId = null): array
    {
        \Carbon\Carbon::setLocale('id');
        $now = \Carbon\Carbon::now('Asia/Jakarta');

        $conversation = null;
        $historyMessages = [];

        try {
            if ($conversationId) {
                $conversation = AIConversation::where('session_id', $conversationId)->first();
            }

            if (!$conversation) {
                $conversationId = $conversationId ?? (string) Str::uuid();
                $conversation = AIConversation::create(['session_id' => $conversationId]);
            }

            if ($conversation) {
                // Take last 4 messages to send to Groq to save tokens
                $history = $conversation->messages()->orderBy('id', 'desc')->take(4)->get()->reverse();
                foreach ($history as $msg) {
                    $historyMessages[] = [
                        'role' => ($msg->role === 'model' || $msg->role === 'assistant') ? 'assistant' : 'user',
                        'content' => $msg->content
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::warning('AI Conversation load error: ' . $e->getMessage());
            $conversation = null;
            if (!$conversationId) {
                $conversationId = (string) Str::uuid();
            }
        }

        // Get all user messages from DB so state across long conversations is never lost
        $allUserTexts = [];
        if ($conversation) {
            try {
                $allUserTexts = $conversation->messages()->where('role', 'user')->orderBy('id')->pluck('content')->toArray();
            } catch (\Exception $e) {}
        }

        // Extract reservation state from conversation history + current message
        $state = $this->extractReservationState($allUserTexts, $message, $now);

        // Precompute dynamic date strings from current real time
        $besok = $now->copy()->addDay();
        $besokStr = $besok->translatedFormat('l, d M');
        $lusa = $now->copy()->addDays(2);
        $lusaStr = $lusa->translatedFormat('l, d M');

        // Next Tuesday (if Monday is closed)
        $diffToTuesday = (2 - $now->dayOfWeekIso + 7) % 7;
        if ($diffToTuesday === 0) $diffToTuesday = 7;
        $nextSelasa = $now->copy()->addDays($diffToTuesday);
        $selasaStr = $nextSelasa->translatedFormat('l, d M');

        // Saturday & Sunday of this weekend
        $diffToSat = (6 - $now->dayOfWeekIso + 7) % 7;
        $weekendSat = $now->copy()->addDays($diffToSat);
        $weekendSun = $weekendSat->copy()->addDay();
        $satStr = $weekendSat->translatedFormat('l, d M');
        $sunStr = $weekendSun->translatedFormat('l, d M');

        // Determine step & options dynamically
        $targetStep = 'GENERAL';
        $suggestedOptions = [];
        $stepGuidance = "";

        if ($state['is_monday_rejected']) {
            $targetStep = 'REJECT_MONDAY';
            $stepGuidance = "Tamu menyebut hari Senin atau tanggal yang jatuh pada hari Senin. Jelaskan dengan sangat ramah bahwa setiap hari Senin Ebony Cafe LIBUR/TUTUP. Tawarkan hari alternatif (Selasa s/d Minggu). JANGAN tampilkan opsi 'Pilih sendiri'.";
            $suggestedOptions = ["📅 {$selasaStr}", "📅 {$satStr}", "📅 {$sunStr}"];
        } elseif ($state['is_confirmed'] && $state['tanggal'] && $state['jam'] && $state['jumlah_tamu'] && $state['area']) {
            $targetStep = 'CONFIRMED';
            $stepGuidance = "Semua detail reservasi LENGKAP dan tamu sudah KONFIRMASI setuju/benar. Balas dengan ucapan antusias bahwa data reservasi sudah siap. Wajib set reservation_confirmed=true dan isi reservation_data lengkap! Arahkan tamu mengklik tombol hijau WhatsApp di bawah.";
            $suggestedOptions = ["📋 Reservasi Baru", "🍽️ Rekomendasi Menu"];
        } elseif ($state['tanggal'] && $state['jam'] && $state['jumlah_tamu'] && $state['area']) {
            $targetStep = 'ASK_CONFIRMATION';
            $stepGuidance = "Semua 4 detail reservasi sudah terkumpul: Tanggal={$state['tanggal']}, Jam={$state['jam']}, Tamu={$state['jumlah_tamu']}, Area={$state['area']}. Rangkum keempat detail tersebut dengan rapi dan tanyakan apakah datanya sudah benar.";
            $suggestedOptions = ["✅ Ya, sudah benar!", "✏️ Mau ubah detail", "❌ Batalkan"];
        } elseif ($state['tanggal'] && $state['jam'] && $state['jumlah_tamu']) {
            $targetStep = 'ASK_AREA';
            $stepGuidance = "Data tanggal ({$state['tanggal']}), jam ({$state['jam']}), dan jumlah tamu ({$state['jumlah_tamu']}) sudah ada. Sekarang tanyakan pilihan area meja yang diinginkan (Main Hall Indoor, Terrace Outdoor, atau VIP Lounge).";
            $suggestedOptions = ["🏠 Main Hall (Indoor)", "🌿 Terrace (Outdoor)", "✨ VIP Lounge"];
        } elseif ($state['tanggal'] && $state['jam']) {
            $targetStep = 'ASK_GUEST_COUNT';
            $stepGuidance = "Data tanggal ({$state['tanggal']}) dan jam ({$state['jam']}) sudah ada. Sekarang tanyakan reservasinya untuk berapa orang.";
            $suggestedOptions = ["👫 2 Orang", "👨‍👩‍👧 3 - 4 Orang", "👨‍👩‍👧‍👦 5 - 6 Orang", "🎉 7+ Orang"];
        } elseif ($state['tanggal']) {
            $targetStep = 'ASK_TIME';
            $stepGuidance = "Tanggal kunjungan sudah dicatat: {$state['tanggal']}. Sekarang konfirmasi tanggalnya dan tanyakan mau datang jam berapa. Sebutkan jam operasional (Selasa-Jumat 12:00-22:00, Sabtu-Minggu 11:00-22:00).";
            $suggestedOptions = ["🕐 Siang (12:30 WIB)", "🌆 Sore (16:00 WIB)", "🌙 Malam (19:00 WIB)", "🌙 Malam (20:30 WIB)"];
        } elseif ($state['is_weekend_clicked']) {
            $targetStep = 'ASK_WEEKEND_DAY';
            $stepGuidance = "Tamu ingin datang saat weekend. Tanyakan apakah mereka ingin berkunjung di hari Sabtu atau Minggu.";
            $suggestedOptions = ["📅 {$satStr}", "📅 {$sunStr}"];
        } elseif ($state['is_pilih_sendiri']) {
            $targetStep = 'ASK_CUSTOM_DATE';
            $stepGuidance = "Tamu memilih 'Pilih sendiri'. Jelaskan dengan hangat bahwa mereka bebas mengetik tanggal yang diinginkan langsung di kolom chat (misal: 25 September atau besok lusa). JANGAN tampilkan opsi 'Pilih sendiri' lagi!";
            $suggestedOptions = ["📅 Besok ({$besokStr})", "📅 Akhir Pekan", "📅 {$selasaStr}"];
        } elseif ($state['wants_reservation']) {
            $targetStep = 'ASK_DATE';
            $stepGuidance = "Tamu ingin melakukan reservasi meja. Tanyakan kapan rencana kunjungannya dengan hangat. Tamu bebas mengetik tanggal sendiri atau memilih dari tombol.";
            $suggestedOptions = ["📅 Besok ({$besokStr})", "📅 Akhir Pekan", "📅 {$selasaStr}", "📅 Mau Pilih Tanggal Lain"];
        }

        // Build concise, token-efficient system prompt (< 400 tokens)
        $systemPrompt = "Kamu adalah Ebony AI, asisten ramah Ebony Cafe & Gallery.\n"
            . "Waktu Server: {$now->translatedFormat('l, d F Y')}. Operasional: Senin=TUTUP, Sel-Jum 12:00-22:00, Sab-Min 11:00-22:00.\n"
            . "Gaya bahasa santai, hangat, elegan, JANGAN pakai nomor 1, 2, 3.\n"
            . "Format JSON MURNI:\n"
            . "{\"reply\":\"teks balasan\",\"options\":[\"opsi 1\",\"opsi 2\"],\"reservation_confirmed\":false,\"reservation_data\":null}\n\n";

        if ($targetStep !== 'GENERAL') {
            $systemPrompt .= "STATUS RESERVASI TERKUMPUL:\n"
                . "- Tanggal: " . ($state['tanggal'] ?: 'belum ada') . "\n"
                . "- Jam: " . ($state['jam'] ?: 'belum ada') . "\n"
                . "- Tamu: " . ($state['jumlah_tamu'] ?: 'belum ada') . "\n"
                . "- Area: " . ($state['area'] ?: 'belum ada') . "\n\n"
                . "PETUNJUK LANGKAH INI:\n{$stepGuidance}\n"
                . "Gunakan opsi berikut jika relevan: " . json_encode($suggestedOptions, JSON_UNESCAPED_UNICODE);
        } else {
            $systemPrompt .= "Jawab pertanyaan tamu dengan ramah dan tawarkan bantuan reservasi meja atau info menu.";
        }

        $apiMessages = [
            ['role' => 'system', 'content' => $systemPrompt]
        ];

        // Add history (last 2 turns)
        foreach ($historyMessages as $hMsg) {
            $apiMessages[] = $hMsg;
        }

        // Add current user message
        $apiMessages[] = [
            'role' => 'user',
            'content' => $message
        ];

        // Save user message to DB
        if ($conversation) {
            try {
                $conversation->messages()->create([
                    'role' => 'user',
                    'content' => $message
                ]);
            } catch (\Exception $e) {
                Log::warning('Failed saving user message: ' . $e->getMessage());
            }
        }

        // Call Groq API with retries
        $maxRetries = 2;
        $aiResponse = null;

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])->timeout(35)->post($this->baseUrl, [
                    'model' => $this->model,
                    'messages' => $apiMessages,
                    'response_format' => ['type' => 'json_object'],
                    'max_completion_tokens' => 300,
                    'temperature' => 0.5,
                ]);

                if ($response->successful()) {
                    $result = $response->json();
                    $rawContent = $result['choices'][0]['message']['content'] ?? "{}";
                    $cleanJson = preg_replace('/^```(?:json)?\s*|```\s*$/i', '', trim($rawContent));
                    $parsed = json_decode($cleanJson, true);

                    if (is_array($parsed) && !empty($parsed['reply'])) {
                        $aiResponse = $parsed;
                        break;
                    }
                } else {
                    $statusCode = $response->status();
                    Log::warning("Groq attempt {$attempt}: HTTP {$statusCode}");
                    if ($statusCode === 429 && $attempt < $maxRetries) {
                        sleep(8);
                        continue;
                    }
                }
            } catch (\Exception $e) {
                Log::error("Groq attempt {$attempt} Exception: " . $e->getMessage());
                if ($attempt < $maxRetries) {
                    sleep(4);
                    continue;
                }
            }
        }

        // Smart Fallback if API fails or rate limited
        if (!$aiResponse) {
            $aiResponse = $this->generateSmartFallback($targetStep, $state, $suggestedOptions, $now);
        }

        $replyText = $aiResponse['reply'] ?? 'Halo! Ada yang bisa saya bantu hari ini?';
        $options = !empty($aiResponse['options']) && is_array($aiResponse['options']) 
            ? array_values(array_filter(array_map('trim', $aiResponse['options'])))
            : $suggestedOptions;

        // Ensure "Pilih sendiri" is NEVER shown if user already selected it
        if ($state['is_pilih_sendiri']) {
            $options = array_values(array_filter($options, function($opt) {
                return !preg_match('/pilih\s*sendiri/i', $opt);
            }));
            if (empty($options)) {
                $options = $suggestedOptions;
            }
        }

        $whatsappLink = null;
        $reservationData = null;

        // Check if reservation is confirmed
        $isConfirmedInAI = !empty($aiResponse['reservation_confirmed']) && !empty($aiResponse['reservation_data']);
        if ($isConfirmedInAI || ($targetStep === 'CONFIRMED')) {
            $aiData = is_array($aiResponse['reservation_data'] ?? null) ? $aiResponse['reservation_data'] : [];
            $reservationData = [
                'tanggal' => $aiData['tanggal'] ?? $state['tanggal'] ?? $now->translatedFormat('l, d F Y'),
                'jam' => $aiData['jam'] ?? $state['jam'] ?? '19:00 WIB',
                'jumlah_tamu' => $aiData['jumlah_tamu'] ?? $aiData['tamu'] ?? $state['jumlah_tamu'] ?? '2 Orang',
                'area' => $aiData['area'] ?? $state['area'] ?? 'Main Hall (Indoor)',
                'nama_tamu' => $aiData['nama_tamu'] ?? 'Tamu'
            ];
            $whatsappLink = $this->generateWhatsAppLink($reservationData);
        }

        // Save assistant response to DB
        if ($conversation) {
            try {
                $conversation->messages()->create([
                    'role' => 'model',
                    'content' => $replyText
                ]);
            } catch (\Exception $e) {
                Log::warning('Failed saving assistant response: ' . $e->getMessage());
            }
        }

        $payload = [
            'success' => true,
            'message' => $replyText,
            'options' => $options,
            'conversation_id' => $conversationId,
        ];

        if ($whatsappLink) {
            $payload['whatsapp_link'] = $whatsappLink;
            $payload['reservation_data'] = $reservationData;
        }

        return $payload;
    }

    protected function generateSmartFallback(string $targetStep, array $state, array $suggestedOptions, \Carbon\Carbon $now): array
    {
        switch ($targetStep) {
            case 'REJECT_MONDAY':
                return [
                    'reply' => "Mohon maaf Kak, setiap hari Senin Ebony Cafe libur operasional 🙏 Kami buka kembali hari Selasa sampai Minggu. Mau reservasi untuk hari Selasa atau akhir pekan ini?",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => false,
                    'reservation_data' => null
                ];
            case 'ASK_CUSTOM_DATE':
                return [
                    'reply' => "Boleh banget! Silakan langsung ketik tanggal yang kamu inginkan di kolom pesan bawah ya (misal: 25 September atau besok lusa), atau pilih opsi hari berikut 😊",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => false,
                    'reservation_data' => null
                ];
            case 'ASK_WEEKEND_DAY':
                return [
                    'reply' => "Asyik! Mau mampir di hari Sabtu atau Minggu nih, Kak?",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => false,
                    'reservation_data' => null
                ];
            case 'ASK_TIME':
                return [
                    'reply' => "Noted untuk tanggal {$state['tanggal']}! Mau datang sekitar jam berapa? (Kami buka hingga pukul 22:00 WIB).",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => false,
                    'reservation_data' => null
                ];
            case 'ASK_GUEST_COUNT':
                return [
                    'reply' => "Sip, jam {$state['jam']} ya! Untuk reservasinya rencananya berapa orang nih?",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => false,
                    'reservation_data' => null
                ];
            case 'ASK_AREA':
                return [
                    'reply' => "Siap untuk {$state['jumlah_tamu']}! Mau duduk di area mana nih? Kami punya Main Hall (Indoor), Terrace (Outdoor), dan VIP Lounge.",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => false,
                    'reservation_data' => null
                ];
            case 'ASK_CONFIRMATION':
                return [
                    'reply' => "Rangkuman reservasi kamu sudah siap:\n📅 Tanggal: {$state['tanggal']}\n🕐 Jam: {$state['jam']}\n👥 Tamu: {$state['jumlah_tamu']}\n📍 Area: {$state['area']}\n\nApakah detail di atas sudah benar semua?",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => false,
                    'reservation_data' => null
                ];
            case 'CONFIRMED':
                return [
                    'reply' => "Mantap! Detail reservasi kamu sudah lengkap 🎉 Silakan klik tombol hijau WhatsApp di bawah untuk langsung mengirimkan data ke Admin Ebony Cafe ya!",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => true,
                    'reservation_data' => [
                        'tanggal' => $state['tanggal'] ?? $now->translatedFormat('l, d F Y'),
                        'jam' => $state['jam'] ?? '19:00 WIB',
                        'jumlah_tamu' => $state['jumlah_tamu'] ?? '2 Orang',
                        'area' => $state['area'] ?? 'Main Hall (Indoor)',
                        'nama_tamu' => 'Tamu'
                    ]
                ];
            default:
                return [
                    'reply' => "Halo! Kapan rencana kamu mau berkunjung ke Ebony Cafe & Gallery? Kamu bisa pilih hari di bawah atau langsung ketik tanggalnya ya 😊",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => false,
                    'reservation_data' => null
                ];
        }
    }

    protected function generateWhatsAppLink(array $data): string
    {
        $adminPhone = '6288239386759';

        $tanggal = $data['tanggal'] ?? '-';
        $jam = $data['jam'] ?? '-';
        $jumlahTamu = $data['jumlah_tamu'] ?? $data['tamu'] ?? $data['guest_count'] ?? '-';
        $area = $data['area'] ?? '-';
        $namaTamu = !empty($data['nama_tamu']) ? $data['nama_tamu'] : 'Tamu';

        $message = "Halo Admin Ebony Cafe! 👋\n\n"
                 . "Saya ingin melakukan *reservasi meja* dengan detail berikut:\n\n"
                 . "📅 *Tanggal*: {$tanggal}\n"
                 . "🕐 *Jam*: {$jam}\n"
                 . "👥 *Jumlah Tamu*: {$jumlahTamu}\n"
                 . "📍 *Area*: {$area}\n"
                 . "👤 *Nama*: {$namaTamu}\n\n"
                 . "Mohon konfirmasi ketersediaan meja ya. Terima kasih! 🙏\n\n"
                 . "_(Pesan ini dikirim melalui Ebony AI Chatbot)_";

        return 'https://wa.me/' . $adminPhone . '?text=' . rawurlencode($message);
    }

    public function analyzeRequest(string $specialRequest): array
    {
        $messages = [
            [
                'role' => 'system',
                'content' => "Anda adalah asisten AI restoran Ebony Cafe. Analisis permintaan khusus (special request) dari tamu reservasi dan berikan output dalam format JSON murni tanpa markdown."
            ],
            [
                'role' => 'user',
                'content' => "Analisis special request berikut:\n\"{$specialRequest}\"\n\n" .
                             "Wajib kembalikan format JSON murni dengan struktur persis berikut:\n" .
                             "{\n" .
                             "  \"category\": \"(kategori singkat, misal: anniversary, allergy, birthday, romantic, business, dll)\",\n" .
                             "  \"priority\": \"(low / medium / high)\",\n" .
                             "  \"detected_request\": [\"daftar hal spesifik yang diminta\"],\n" .
                             "  \"staff_action\": [\"daftar tindakan konkret yang perlu disiapkan staf\"]\n" .
                             "}"
            ]
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->baseUrl, [
                'model' => $this->model,
                'messages' => $messages,
                'response_format' => ['type' => 'json_object'],
                'max_completion_tokens' => 250,
                'temperature' => 0.2,
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $rawText = $result['choices'][0]['message']['content'] ?? "{}";

                $cleanJson = preg_replace('/^```(?:json)?\s*|```\s*$/i', '', trim($rawText));
                $json = json_decode(trim($cleanJson), true);

                if (is_array($json)) {
                    $detectedRequest = $json['detected_request'] ?? [];
                    if (!is_array($detectedRequest)) {
                        $detectedRequest = [$detectedRequest];
                    }

                    $staffAction = $json['staff_action'] ?? [];
                    if (!is_array($staffAction)) {
                        $staffAction = [$staffAction];
                    }

                    return [
                        'category' => (string)($json['category'] ?? 'general'),
                        'priority' => strtolower((string)($json['priority'] ?? 'low')),
                        'detected_request' => array_values($detectedRequest),
                        'staff_action' => array_values($staffAction),
                    ];
                }
            } else {
                Log::error('Groq Analyze Error: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Groq Analyze Exception: ' . $e->getMessage());
        }

        return [
            'category' => 'general',
            'priority' => 'low',
            'detected_request' => [$specialRequest],
            'staff_action' => ['Konfirmasi preferensi tamu saat kedatangan']
        ];
    }
}
