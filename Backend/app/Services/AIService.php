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

    /**
     * Konteks menu & area meja dari database — diperkaya dengan harga & deskripsi singkat.
     */
    protected function getContext(): string
    {
        $ctx = "";

        try {
            $menus = Menu::where('is_available', true)->get();
            if ($menus->count() > 0) {
                $ctx .= "MENU TERSEDIA SAAT INI:\n";
                foreach ($menus->take(18) as $m) {
                    $line = "- {$m->name} (Rp" . number_format($m->price, 0, ',', '.') . ") [{$m->category}]";
                    if (!empty($m->description)) {
                        $line .= " — " . \Illuminate\Support\Str::limit($m->description, 60);
                    }
                    if (!empty($m->spicy_level) && $m->spicy_level > 0) {
                        $line .= " [Pedas: " . str_repeat('🌶', min($m->spicy_level, 3)) . "]";
                    }
                    if (!empty($m->dietary_tags)) {
                        $tags = is_array($m->dietary_tags) ? implode(', ', $m->dietary_tags) : $m->dietary_tags;
                        if ($tags) $line .= " [{$tags}]";
                    }
                    $ctx .= $line . "\n";
                }
            }
        } catch (\Exception $e) {}

        try {
            $tables = RestaurantTable::all();
            if ($tables->count() > 0) {
                $ctx .= "\nAREA & MEJA TERSEDIA:\n";
                foreach ($tables as $t) {
                    $ctx .= "- {$t->name} (area: {$t->area}, kapasitas: {$t->capacity} orang)\n";
                }
            }
        } catch (\Exception $e) {}

        return $ctx;
    }

    /**
     * Knowledge base statis Ebony Cafe — info lokasi, fasilitas, dll.
     * Digunakan untuk menjawab pertanyaan umum tamu tanpa perlu panggil API.
     */
    protected function getCafeKnowledge(): string
    {
        return <<<KNOWLEDGE
PROFIL EBONY CAFE & GALLERY:
- Konsep: Fine dining + art gallery — tempat makan, berkarya, dan bersantai yang elegan
- Tagline: "A place to Dine, Gallery, and Unwind"
- Filosofi: Simple Elegance — bahan-bahan terbaik, teknik inovatif, pengalaman tak terlupakan
- Suasana: Hangat, intim, artistik — cocok untuk kencan, anniversary, ulang tahun, business dinner

LOKASI & KONTAK:
- Alamat: Jl. Raya Baturaden Km. 10, Karang Mangu, Baturaden, Banyumas, Jawa Tengah 53151
- Area: Baturaden, Jawa Tengah (dekat wisata Baturaden/Purwokerto)
- WhatsApp: +62 855-1188-868
- Instagram: @ebonyindonesia
- Google Maps: tersedia (cari "Ebony Cafe Baturaden")

JAM OPERASIONAL:
- Senin: TUTUP / LIBUR
- Selasa – Jumat: 12:00 – 22:00 WIB
- Sabtu – Minggu & Hari Libur: 11:00 – 22:00 WIB
- Last order: 30 menit sebelum tutup (pukul 21:30 WIB)

FASILITAS:
- Area parkir luas (mobil & motor)
- Free WiFi untuk pelanggan
- Area indoor (Main Hall) ber-AC
- Area outdoor (Terrace) dengan pemandangan alam Baturaden
- VIP Lounge untuk acara private / eksklusif
- Art Gallery — pameran karya seni yang berganti secara berkala
- Live music di hari-hari tertentu (info lebih lanjut via Instagram)
- Photo-friendly spots / instagrammable areas
- Toilet bersih
- Kursi roda accessible (area utama)

AREA MEJA:
- Main Hall (Indoor): nyaman, ber-AC, cocok untuk keluarga, makan siang bisnis, atau saat cuaca panas
- Terrace (Outdoor): pemandangan alam Baturaden yang asri, cocok untuk makan malam romantis atau foto-foto
- VIP Lounge: privat, eksklusif, cocok untuk anniversary, ulang tahun, lamaran, business meeting

PEMESANAN & PEMBAYARAN:
- Reservasi: via AI chatbot (langsung di website), WhatsApp, atau form online
- Pembayaran: cash, transfer bank, QRIS, kartu debit/kredit (Visa & Mastercard)
- Tanpa biaya reservasi / no reservation fee
- Cancellation: hubungi admin minimal 2 jam sebelum waktu reservasi

DRESS CODE:
- Smart casual hingga formal — tidak ada aturan ketat
- Disarankan berpakaian rapi dan sopan untuk kenyamanan bersama

CATATAN KHUSUS:
- Bisa request dekorasi spesial (ulang tahun, anniversary, lamaran) — hubungi admin minimal 1 hari sebelumnya
- Bisa bawa kue sendiri dari luar (dengan pemberitahuan sebelumnya)
- Menu bisa disesuaikan untuk alergi/pantangan makanan — informasikan saat reservasi
- Tersedia kursi bayi (baby chair) — minta saat reservasi
- Kapasitas total: hubungi admin untuk event/gathering besar (30+ orang)
KNOWLEDGE;
    }

    /**
     * Deteksi bahasa pesan: 'id' = Bahasa Indonesia, 'en' = English, 'mix' = campuran
     */
    protected function detectLanguage(string $message): string
    {
        $enWords = preg_match_all('/\b(i|you|we|the|is|are|want|table|menu|book|reserve|hello|hi|please|can|could|how|what|when|where|food|drink|available|closed|open|price|help|thanks|thank)\b/i', $message);
        $idWords = preg_match_all('/\b(saya|aku|mau|ingin|meja|menu|reservasi|pesan|halo|hai|kapan|berapa|dimana|bagaimana|makanan|minuman|bisa|tolong|terima\s*kasih|oke|ada|tidak|harga|buka|tutup|bantu)\b/i', $message);

        if ($enWords > 0 && $idWords === 0) return 'en';
        if ($enWords > 0 && $idWords > 0) return 'mix';
        return 'id';
    }

    /**
     * Deteksi occasion dari percakapan untuk rekomendasi yang lebih personal.
     */
    protected function detectOccasion(array $userTexts, string $currentMessage): ?string
    {
        $allText = strtolower(implode(' ', $userTexts) . ' ' . $currentMessage);

        if (preg_match('/ulang\s*tahun|birthday|hbd|happy\s*birthday|bday/i', $allText)) return 'birthday';
        if (preg_match('/anniversary|ulang\s*tahun\s*(pernikahan|nikah)|peringatan/i', $allText)) return 'anniversary';
        if (preg_match('/lamaran|tunangan|proposal|nikah|menikah|akan\s*menikah/i', $allText)) return 'proposal';
        if (preg_match('/kencan|date\s*night|romantis|romantic|pasangan|berdua|pacar|kekasih/i', $allText)) return 'romantic';
        if (preg_match('/bisnis|business|meeting|rapat|klien|client|rekan\s*kerja|kolega/i', $allText)) return 'business';
        if (preg_match('/keluarga|family|anak|ortu|orang\s*tua|gathering|kumpul/i', $allText)) return 'family';
        if (preg_match('/arisan|komunitas|group|grup|rombongan|banyak\s*orang/i', $allText)) return 'group';
        if (preg_match('/wisuda|lulus|graduation|kelulusan/i', $allText)) return 'graduation';
        if (preg_match('/brunch|sarapan|makan\s*siang|lunch|nongkrong|santai|casual/i', $allText)) return 'casual';

        return null;
    }

    /**
     * Kembalikan rekomendasi menu + area berdasarkan occasion.
     */
    protected function getOccasionRecommendation(string $occasion, string $lang = 'id'): string
    {
        $recs = [
            'birthday' => [
                'id' => "🎂 Untuk perayaan ulang tahun, saya rekomendasikan area *VIP Lounge* yang privat dan bisa didekorasi khusus! Bisa request balon, bunga, atau lilin ulang tahun ke admin kami minimal 1 hari sebelumnya ya. Menu dessert spesial kami juga cocok banget untuk momen ini 🥂",
                'en' => "🎂 For a birthday celebration, I recommend our *VIP Lounge* — it's private and can be specially decorated! You can request balloons, flowers, or birthday candles via our admin at least 1 day in advance. Our special dessert menu pairs perfectly too 🥂",
            ],
            'anniversary' => [
                'id' => "💑 Anniversary yang berkesan butuh suasana yang tepat! Kami rekomendasikan *Terrace (Outdoor)* di malam hari — pemandangan alam Baturaden yang romantis sambil menikmati hidangan istimewa. Mau kami siapkan dekorasi spesial? Hubungi admin sehari sebelumnya 🌹",
                'en' => "💑 For a special anniversary, we recommend our *Terrace (Outdoor)* in the evening — the natural Baturaden scenery is simply romantic. Would you like special decorations? Contact our admin at least a day before 🌹",
            ],
            'proposal' => [
                'id' => "💍 Wow, momen lamaran yang spesial! Kami sangat bisa membantu membuat momen ini sempurna. *VIP Lounge* adalah pilihan terbaik — privat, eksklusif, dan bisa didekorasi dengan bunga & lilin. Hubungi admin kami secepatnya untuk koordinasi dekorasi ya 🤫",
                'en' => "💍 A proposal! How special! Our *VIP Lounge* is the perfect choice — private, exclusive, and can be decorated with flowers & candles. Please contact our admin ASAP to coordinate the surprise 🤫",
            ],
            'romantic' => [
                'id' => "🌙 Untuk date night yang romantis, *Terrace (Outdoor)* di malam hari adalah pilihan terbaik! Udara sejuk Baturaden, pemandangan alam, dan menu dinner kami yang istimewa. Atau kalau mau yang lebih privat, *VIP Lounge* juga sangat cocok 🕯️",
                'en' => "🌙 For a romantic date, our *Terrace (Outdoor)* at night is ideal! The cool Baturaden breeze, natural scenery, and our special dinner menu. For more privacy, the *VIP Lounge* is also perfect 🕯️",
            ],
            'business' => [
                'id' => "💼 Untuk business dinner atau meeting, kami rekomendasikan *Main Hall (Indoor)* yang tenang dan kondusif, atau *VIP Lounge* untuk diskusi yang lebih privat. Jam terbaik: 12:00–15:00 (makan siang) atau 18:00–20:00 (dinner). WiFi gratis tersedia 📶",
                'en' => "💼 For a business dinner or meeting, we recommend our quiet *Main Hall (Indoor)* or the private *VIP Lounge* for sensitive discussions. Best time: 12:00–15:00 (lunch) or 18:00–20:00 (dinner). Free WiFi available 📶",
            ],
            'family' => [
                'id' => "👨‍👩‍👧‍👦 Untuk kumpul keluarga, *Main Hall (Indoor)* yang luas dan nyaman adalah pilihan ideal! Ber-AC, tersedia kursi bayi (baby chair), dan menu beragam yang cocok untuk semua usia. Jika 10+ orang, sebaiknya reservasi lebih awal ya 😊",
                'en' => "👨‍👩‍👧‍👦 For a family gathering, our spacious *Main Hall (Indoor)* is ideal! Air-conditioned, baby chairs available, and a diverse menu suitable for all ages. For 10+ people, please reserve well in advance 😊",
            ],
            'group' => [
                'id' => "🎉 Untuk rombongan atau gathering, kami sarankan hubungi admin kami langsung via WhatsApp (+62 855-1188-868) untuk koordinasi tempat duduk, menu, dan kemungkinan set menu khusus rombongan. Kapasitas besar bisa diatur!",
                'en' => "🎉 For group events or gatherings, we suggest contacting our admin directly via WhatsApp (+62 855-1188-868) to coordinate seating, menu, and possible group set menus. Large capacities can be arranged!",
            ],
            'graduation' => [
                'id' => "🎓 Selamat atas kelulusannya! Rayakan di Ebony — *VIP Lounge* atau *Main Hall* sama-sama cocok. Mau ada dekorasi atau foto bersama yang berkesan? Hubungi admin untuk koordinasi 🥂",
                'en' => "🎓 Congratulations on graduating! Celebrate at Ebony — both *VIP Lounge* or *Main Hall* work great. Want special decorations or a memorable photo session? Contact our admin 🥂",
            ],
            'casual' => [
                'id' => "☕ Untuk santai atau nongkrong, *Terrace (Outdoor)* kami sangat recommended! Udara segar Baturaden, sambil menikmati minuman dan snack favorit. Kalau weekend, buka dari jam 11 pagi lho 😊",
                'en' => "☕ For a casual hangout, our *Terrace (Outdoor)* is highly recommended! Fresh Baturaden air while enjoying your favorite drinks and snacks. On weekends, we open from 11am! 😊",
            ],
        ];

        $rec = $recs[$occasion] ?? null;
        if (!$rec) return '';

        return $lang === 'en' ? ($rec['en'] ?? $rec['id']) : $rec['id'];
    }

    public function getSoldOutMenus(): array
    {
        try {
            return Menu::where('is_available', false)
                ->select('id', 'name', 'category', 'price')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    protected function hasCoreReservationData(array $state): bool
    {
        return !empty($state['tanggal_iso'])
            && !empty($state['jam'])
            && !empty($state['jumlah_tamu'])
            && !empty($state['nama'])
            && !empty($state['no_hp']);
    }

    protected function createReservationFromState(array $state): array
    {
        if (!$this->hasCoreReservationData($state)) {
            return ['created' => false];
        }

        // Normalisasi jam: "19:00 WIB" → "19:00"
        $time = '19:00';
        if (preg_match('/(\d{1,2}):(\d{2})/', $state['jam'], $t)) {
            $time = sprintf('%02d:%02d', max(0, min(23, (int)$t[1])), max(0, min(59, (int)$t[2])));
        }

        // Jumlah tamu integer: "3 - 4 Orang" / "7+ Orang" / "2 Orang"
        $partySize = 2;
        if (preg_match('/(\d{1,2})/', $state['jumlah_tamu'], $g)) {
            $partySize = max(1, min(100, (int)$g[1]));
        }

        $date = $state['tanggal_iso'];

        // Idempotent: reservasi yang sama tidak boleh dibuat dua kali
        $existing = \App\Models\Reservation::where('guest_name', $state['nama'])
            ->where('phone', $state['no_hp'])
            ->where('date', $date)
            ->where('time', $time)
            ->where('status', '!=', 'cancelled')
            ->first();

        if ($existing) {
            return ['created' => true, 'booking_number' => $existing->booking_number, 'duplicate' => true];
        }

        // Quota: maksimal 25 tamu per slot waktu (sama seperti reservasi manual)
        $currentBookedGuests = \App\Models\Reservation::where('date', $date)
            ->where('time', 'like', substr($time, 0, 2) . '%')
            ->where('status', '!=', 'cancelled')
            ->sum('party_size');

        if (($currentBookedGuests + $partySize) > 25) {
            return ['created' => false, 'slot_full' => true];
        }

        do {
            $bookingNumber = (string) mt_rand(1000, 9999);
        } while (\App\Models\Reservation::where('booking_number', $bookingNumber)->exists());

        \App\Models\Reservation::create([
            'booking_number' => $bookingNumber,
            'guest_name'     => $state['nama'],
            'phone'          => $state['no_hp'],
            'email'          => $state['email'] ?? '',
            'date'           => $date,
            'time'           => $time,
            'party_size'     => $partySize,
            'table_id'       => null,
            'occasion'       => 'Reservasi AI',
            'dietary_notes'  => null,
            'seating_notes'  => $state['area'] ?? null,
            'is_arrived'     => false,
            'status'         => 'pending',
        ]);

        return ['created' => true, 'booking_number' => $bookingNumber];
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
            'tanggal_iso' => null,
            'jam' => null,
            'jumlah_tamu' => null,
            'area' => null,
            'nama' => null,
            'no_hp' => null,
            'email' => null,
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
                $state['tanggal_iso'] = $now->format('Y-m-d');
            } elseif (preg_match('/\bbesok\b/i', $text)) {
                $d = $now->copy()->addDay();
                if ($d->dayOfWeekIso === 1) {
                    $state['is_monday_rejected'] = true;
                } else {
                    $state['tanggal'] = $d->translatedFormat('l, d F Y');
                    $state['tanggal_iso'] = $d->format('Y-m-d');
                }
            } elseif (preg_match('/\blusa\b/i', $text)) {
                $d = $now->copy()->addDays(2);
                if ($d->dayOfWeekIso === 1) {
                    $state['is_monday_rejected'] = true;
                } else {
                    $state['tanggal'] = $d->translatedFormat('l, d F Y');
                    $state['tanggal_iso'] = $d->format('Y-m-d');
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
                        $state['tanggal_iso'] = $d->format('Y-m-d');
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
                    $state['tanggal_iso'] = $d->format('Y-m-d');
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

        // 9. Nama, No HP, Email
        foreach ($userTexts as $text) {
            if (!$state['email'] && preg_match('/([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,})/i', $text, $eMatch)) {
                $state['email'] = strtolower($eMatch[1]);
            }

            if (!$state['no_hp'] && preg_match('/(?:\+?62|0)\s?8\d[\d\s\-]{7,13}/', $text, $pMatch)) {
                $state['no_hp'] = preg_replace('/[\s\-]/', '', $pMatch[0]);
            }

            if (!$state['nama']) {
                if (preg_match('/(?:nama\s*(?:saya|aku|ku|gue)?\s*(?:adalah|:)?\s*|atas\s*nama\s*|an\.\s*|panggil\s*(?:aku|saya|gue|guwe)?\s*)([A-Za-z][A-Za-z\s\.\']{1,60})/i', $text, $nMatch)) {
                    $state['nama'] = ucwords(trim($nMatch[1]));
                }
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
        } elseif ($state['is_confirmed'] && $state['tanggal'] && $state['jam'] && $state['jumlah_tamu'] && $state['area'] && $state['nama'] && $state['no_hp'] && $state['email']) {
            $targetStep = 'CONFIRMED';
            $stepGuidance = "Semua detail reservasi LENGKAP (tanggal, jam, jumlah tamu, area, nama, no HP, email) dan tamu sudah KONFIRMASI setuju/benar. Balas dengan ucapan antusias bahwa data reservasi sudah otomatis tersimpan di sistem Ebony Cafe dan konfirmasi dikirim langsung ke nomor WhatsApp tamu. Wajib set reservation_confirmed=true dan isi reservation_data lengkap (tanggal, jam, jumlah_tamu, area, nama_tamu, no_hp, email). Sampaikan ada tombol WhatsApp untuk kirim detail ke Admin. DILARANG menyebut konfirmasi dikirim ke EMAIL — konfirmasi dikirim via WhatsApp ke nomor HP tamu.";
            $suggestedOptions = ["📋 Reservasi Baru", "🍽️ Rekomendasi Menu"];
        } elseif ($state['tanggal'] && $state['jam'] && $state['jumlah_tamu'] && $state['area'] && $state['nama'] && $state['no_hp'] && $state['email']) {
            $targetStep = 'ASK_CONFIRMATION';
            $stepGuidance = "Semua 7 detail reservasi sudah terkumpul: Tanggal={$state['tanggal']}, Jam={$state['jam']}, Tamu={$state['jumlah_tamu']}, Area={$state['area']}, Nama={$state['nama']}, No HP={$state['no_hp']}, Email={$state['email']}. Rangkum ketujuh detail tersebut dengan rapi dan tanyakan apakah datanya sudah benar.";
            $suggestedOptions = ["✅ Ya, sudah benar!", "✏️ Mau ubah detail", "❌ Batalkan"];
        } elseif ($state['tanggal'] && $state['jam'] && $state['jumlah_tamu'] && $state['area'] && $state['nama'] && $state['no_hp']) {
            $targetStep = 'ASK_EMAIL';
            $stepGuidance = "Semua data reservasi sudah ada, tinggal tanyakan alamat email tamu (OPSIONAL, untuk pencatatan saja). Jika tamu tidak mau mengisi, tutup saja dengan ramah dan lanjut ke konfirmasi data.";
            $suggestedOptions = [];
        } elseif ($state['tanggal'] && $state['jam'] && $state['jumlah_tamu'] && $state['area'] && $state['nama']) {
            $targetStep = 'ASK_PHONE';
            $stepGuidance = "Tanyakan nomor WhatsApp/telepon tamu yang bisa dihubungi untuk konfirmasi reservasi.";
            $suggestedOptions = [];
        } elseif ($state['tanggal'] && $state['jam'] && $state['jumlah_tamu'] && $state['area']) {
            $targetStep = 'ASK_NAME';
            $stepGuidance = "Semua detail kunjungan sudah lengkap. Sekarang tanyakan nama lengkap tamu untuk keperluan reservasi.";
            $suggestedOptions = [];
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

        // Tangkap data diri (nama/no HP/email) dari pesan terbaru sesuai langkah aktif
        if ($targetStep === 'ASK_NAME' && empty($state['nama'])) {
            $cleaned = trim(preg_replace('/^(iya|ya|oke|ok|baiklah|siap|baik|nama\s*(saya|aku|ku|gue|gw)?|saya|namaku|aku|panggil|panggil\s*(aku|saya))\s*[:,\-]?\s*/i', '', $message));
            $cleaned = preg_replace('/[^A-Za-z \.\']+/', ' ', $cleaned);
            $cleaned = trim(preg_replace('/\s+/', ' ', $cleaned));
            if ($cleaned !== '' && strlen($cleaned) >= 2) {
                $state['nama'] = ucwords(strtolower($cleaned));
            }
        } elseif ($targetStep === 'ASK_PHONE' && empty($state['no_hp'])) {
            if (preg_match('/(?:\+?62|0)\s?8\d[\d\s\-]{7,13}/', $message, $pMatch)) {
                $state['no_hp'] = preg_replace('/[\s\-]/', '', $pMatch[0]);
            }
        } elseif ($targetStep === 'ASK_EMAIL' && empty($state['email'])) {
            if (preg_match('/([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,})/i', $message, $eMatch)) {
                $state['email'] = strtolower($eMatch[1]);
            } elseif (preg_match('/(tidak\s+.*(?:email|isikan|isi)|gak\s+.*(?:email|isi)|nggak|ga\s+usah|no|skip|tanpa\s+email|tidak\s+ada|ga\s+ada|ngga\s+ada)/i', $message)) {
                $state['email'] = 'belum diisi';
            }
        }

        // Lanjut ke langkah berikutnya jika data diri baru saja tertangkap
        if ($targetStep === 'ASK_NAME' && !empty($state['nama'])) {
            $targetStep = empty($state['no_hp']) ? 'ASK_PHONE' : (empty($state['email']) ? 'ASK_EMAIL' : 'ASK_CONFIRMATION');
        } elseif ($targetStep === 'ASK_PHONE' && !empty($state['no_hp']) && empty($state['email'])) {
            $targetStep = 'ASK_EMAIL';
        } elseif ($targetStep === 'ASK_PHONE' && !empty($state['no_hp'])) {
            $targetStep = 'ASK_CONFIRMATION';
        } elseif ($targetStep === 'ASK_EMAIL' && !empty($state['email'])) {
            $targetStep = 'ASK_CONFIRMATION';
        }

        if ($targetStep === 'ASK_NAME') {
            $stepGuidance = "Semua detail kunjungan sudah lengkap. Sekarang tanyakan nama lengkap tamu untuk keperluan reservasi.";
            $suggestedOptions = [];
        } elseif ($targetStep === 'ASK_PHONE') {
            $stepGuidance = "Tanyakan nomor WhatsApp/telepon tamu yang bisa dihubungi untuk konfirmasi reservasi.";
            $suggestedOptions = [];
        } elseif ($targetStep === 'ASK_EMAIL') {
            $stepGuidance = "Tanyakan alamat email tamu (OPSIONAL, untuk pencatatan saja). Jika tamu tidak mau mengisi, lanjut saja ke konfirmasi data.";
            $suggestedOptions = [];
        }

        // Ambil daftar menu habis untuk dimasukkan ke system prompt
        $soldOutMenus = $this->getSoldOutMenus();
        $soldOutInfo = "";
        if (!empty($soldOutMenus)) {
            $soldOutInfo = "\nMENU YANG SEDANG HABIS HARI INI:\n";
            foreach ($soldOutMenus as $sm) {
                $soldOutInfo .= "- {$sm['name']} [{$sm['category']}] → HABIS/TIDAK TERSEDIA\n";
            }
            $soldOutInfo .= "PENTING: Jika tamu menyebut atau menanyakan menu di atas, wajib beritahu dengan sopan bahwa menu tersebut sedang habis dan tawarkan menu lain dari daftar yang tersedia.\n";
        }

        // Deteksi bahasa dan occasion
        $lang = $this->detectLanguage($message);
        $occasion = $this->detectOccasion($allUserTexts, $message);
        $occasionRec = $occasion ? $this->getOccasionRecommendation($occasion, $lang) : '';

        // Instruksi bahasa
        $langInstruction = match($lang) {
            'en'  => "BAHASA: Tamu menulis dalam Bahasa Inggris. Balas dalam Bahasa Inggris yang hangat dan elegan. Boleh sisipkan kata Indonesia sesekali untuk nuansa lokal.",
            'mix' => "BAHASA: Tamu menggunakan campuran Bahasa Indonesia dan Inggris. Ikuti gaya bahasa mereka — balas bilingual yang natural.",
            default => "BAHASA: Balas dalam Bahasa Indonesia yang santai, hangat, dan elegan. JANGAN kaku atau terlalu formal.",
        };

        // Instruksi occasion (jika terdeteksi)
        $occasionInstruction = $occasion
            ? "\nOCCASION TERDETEKSI: Tamu datang untuk '{$occasion}'. Gunakan rekomendasi ini dalam balasanmu jika relevan:\n{$occasionRec}\n"
            : "";

        // Build system prompt yang kaya dan personal
        $systemPrompt = <<<PROMPT
Kamu adalah **Ebony AI** 🍷 — dining concierge pribadi Ebony Cafe & Gallery yang cerdas, hangat, dan berpengetahuan luas.

KEPRIBADIAN KAMU:
- Hangat seperti teman lama, elegan seperti sommelier bintang lima
- Antusias saat membahas makanan, suasana, atau pengalaman dining
- Selalu fokus pada pengalaman tamu, bukan sekadar menjawab pertanyaan
- Gunakan emoji secukupnya untuk membuat percakapan lebih hidup
- JANGAN pernah gunakan format nomor (1, 2, 3) dalam balasan
- JANGAN mengarang menu/harga yang tidak ada di database

{$langInstruction}
{$occasionInstruction}
WAKTU SEKARANG: {$now->translatedFormat('l, d F Y H:i')} WIB
JAM OPERASIONAL: Senin=TUTUP, Selasa–Jumat 12:00–22:00, Sabtu–Minggu 11:00–22:00 WIB (last order 21:30 WIB)

PENGETAHUAN TENTANG EBONY CAFE:
{$this->getCafeKnowledge()}

DATA MENU & MEJA REAL-TIME (hanya gunakan data ini!):
{$this->getContext()}
{$soldOutInfo}
ATURAN PENTING:
- Jika tamu tanya lokasi/parkir/fasilitas/WiFi/dress code/pembayaran → jawab dari pengetahuan di atas
- Jika tamu tanya menu yang tidak ada di daftar → jujur bahwa kamu tidak punya info tersebut dan sarankan menu yang ada
- Jika tamu mau reservasi → masuk ke flow reservasi dengan ramah
- Jika tamu menyapa dalam Bahasa Inggris → balas dalam Bahasa Inggris
- Selalu tawarkan langkah selanjutnya yang berguna bagi tamu

FORMAT RESPONS (JSON MURNI, tanpa markdown, tanpa komentar):
{"reply":"teks balasan yang natural","options":["opsi 1","opsi 2"],"reservation_confirmed":false,"reservation_data":null}
PROMPT;

        if ($targetStep !== 'GENERAL') {
            $systemPrompt .= "\n\nSTATUS RESERVASI TERKUMPUL:\n"
                . "- Tanggal: " . ($state['tanggal'] ?: 'belum ada') . "\n"
                . "- Jam: " . ($state['jam'] ?: 'belum ada') . "\n"
                . "- Tamu: " . ($state['jumlah_tamu'] ?: 'belum ada') . "\n"
                . "- Area: " . ($state['area'] ?: 'belum ada') . "\n"
                . "- Nama: " . ($state['nama'] ?: 'belum ada') . "\n"
                . "- No HP: " . ($state['no_hp'] ?: 'belum ada') . "\n"
                . "- Email: " . ($state['email'] ?: 'belum ada') . "\n\n"
                . "PETUNJUK LANGKAH INI:\n{$stepGuidance}\n"
                . "Gunakan opsi berikut jika relevan: " . json_encode($suggestedOptions, JSON_UNESCAPED_UNICODE);
        } else {
            $occasionHint = $occasionRec ? "\nInfo untuk occasion '{$occasion}':\n{$occasionRec}" : '';
            $systemPrompt .= "\n\nJawab pertanyaan tamu dengan ramah, informasi dari knowledge base di atas, dan tawarkan bantuan reservasi meja atau rekomendasi menu.{$occasionHint}";
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
                    'model'                 => $this->model,
                    'messages'              => $apiMessages,
                    'response_format'       => ['type' => 'json_object'],
                    'max_completion_tokens' => 450,   // lebih banyak ruang untuk jawaban kaya
                    'temperature'           => 0.65,  // lebih natural & variatif
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
        $bookingNumber = null;

        // Konfirmasi final → simpan otomatis ke database + kirim konfirmasi WhatsApp ke nomor tamu
        $isAiConfirmed = !empty($aiResponse['reservation_confirmed'] ?? false);
        $shouldPersist = $this->hasCoreReservationData($state)
            && ($targetStep === 'CONFIRMED' || !empty($state['is_confirmed']) || $isAiConfirmed);

        if ($shouldPersist) {
            $createResult = $this->createReservationFromState($state);

            if (($createResult['created'] ?? false) && ($createResult['booking_number'] ?? null)) {
                $bookingNumber = $createResult['booking_number'];

                $reservationData = [
                    'tanggal'      => $state['tanggal'] ?? $now->translatedFormat('l, d F Y'),
                    'jam'          => $state['jam'] ?? '19:00 WIB',
                    'jumlah_tamu'  => $state['jumlah_tamu'] ?? '2 Orang',
                    'area'         => $state['area'] ?? 'Main Hall (Indoor)',
                    'nama_tamu'    => $state['nama'] ?? 'Tamu',
                    'no_hp'        => $state['no_hp'] ?? '',
                    'email'        => $state['email'] ?? '',
                    'booking_number' => $bookingNumber,
                ];
                $whatsappLink = $this->generateWhatsAppLink($reservationData);

                if (empty($createResult['duplicate'])) {
                    $replyText .= "\n\n✅ Reservasi kamu sudah tersimpan otomatis di sistem Ebony Cafe! Kode Booking: *#{$bookingNumber}*.";

                    $waResult = app(\App\Services\WhatsAppService::class)
                        ->send($state['no_hp'], $this->buildConfirmationMessage($reservationData));

                    if (!empty($waResult['ok'])) {
                        $replyText .= "\n📲 Konfirmasi juga sudah terkirim langsung ke nomor WhatsApp kamu ya!";
                    } else {
                        Log::warning('Kirim konfirmasi WA gagal: ' . ($waResult['error'] ?? 'unknown'));
                        $replyText .= "\n\n⚠️ Konfirmasi WhatsApp belum terkirim (periksa FONNTE_TOKEN/WABLAS_TOKEN di .env ya), tapi data reservasi tetap tersimpan.";
                    }
                } else {
                    $replyText .= "\n\n🎟️ Kode Booking kamu: *#{$bookingNumber}* (data sudah tersimpan di sistem). Bisa juga dikirim ulang via tombol WhatsApp di bawah.";
                }
            } elseif (($createResult['slot_full'] ?? false)) {
                $replyText .= "\n\nMohon maaf, kuota reservasi pada tanggal/jam tersebut sudah penuh. Silakan pilih tanggal atau jam lain ya 🙏";
            }
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

        if ($bookingNumber) {
            $payload['booking_number'] = $bookingNumber;
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
                    'reply' => "Rangkuman reservasi kamu sudah siap:\n📅 Tanggal: {$state['tanggal']}\n🕐 Jam: {$state['jam']}\n👥 Tamu: {$state['jumlah_tamu']}\n📍 Area: {$state['area']}\n👤 Nama: {$state['nama']}\n📱 No. HP: {$state['no_hp']}\n📧 Email: {$state['email']}\n\nApakah detail di atas sudah benar semua?",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => false,
                    'reservation_data' => null
                ];
            case 'ASK_NAME':
                return [
                    'reply' => "Terima kasih! Sebelum reservasi diproses, boleh tahu nama lengkap kamu dulu nih?",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => false,
                    'reservation_data' => null
                ];
            case 'ASK_PHONE':
                return [
                    'reply' => "Siap Kak {$state['nama']}! Boleh kasih nomor WhatsApp kamu yang bisa dihubungi ya?",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => false,
                    'reservation_data' => null
                ];
            case 'ASK_EMAIL':
                return [
                    'reply' => "Terakhir, alamat email kamu berapa ya? (opsional, untuk pencatatan saja 😊 — kalau tidak mau diisi juga tidak apa-apa)",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => false,
                    'reservation_data' => null
                ];
            case 'CONFIRMED':
                return [
                    'reply' => "Mantap! Detail reservasi kamu sudah lengkap 🎉 Data sudah otomatis tersimpan di sistem Ebony Cafe, dan konfirmasinya akan dikirim langsung ke nomor WhatsApp kamu. Kamu juga bisa klik tombol hijau WhatsApp di bawah untuk kirim detailnya ke Admin!",
                    'options' => $suggestedOptions,
                    'reservation_confirmed' => true,
                    'reservation_data' => [
                        'tanggal' => $state['tanggal'] ?? $now->translatedFormat('l, d F Y'),
                        'jam' => $state['jam'] ?? '19:00 WIB',
                        'jumlah_tamu' => $state['jumlah_tamu'] ?? '2 Orang',
                        'area' => $state['area'] ?? 'Main Hall (Indoor)',
                        'nama_tamu' => $state['nama'] ?? 'Tamu',
                        'no_hp' => $state['no_hp'] ?? '',
                        'email' => $state['email'] ?? ''
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

    protected function buildConfirmationMessage(array $data): string
    {
        $namaTamu = !empty($data['nama_tamu']) ? $data['nama_tamu'] : 'Tamu';

        return "Halo {$namaTamu}! 🌟\n\n"
             . "Reservasi kamu di *Ebony Cafe & Gallery* sudah kami terima:\n\n"
             . "🎟️ *Kode Booking*: {$data['booking_number']}\n"
             . "📅 *Tanggal*: {$data['tanggal']}\n"
             . "🕐 *Jam*: {$data['jam']}\n"
             . "👥 *Jumlah Tamu*: {$data['jumlah_tamu']}\n"
             . "📍 *Area*: {$data['area']}\n\n"
             . "Mohon datang 15 menit sebelum jadwal ya. Terima kasih dan sampai jumpa! 👋\n\n"
             . "_(Pesan ini dikirim otomatis oleh Ebony AI)_";
    }

    protected function generateWhatsAppLink(array $data): string
    {
        $adminPhone = '6288239386759';

        $tanggal = $data['tanggal'] ?? '-';
        $jam = $data['jam'] ?? '-';
        $jumlahTamu = $data['jumlah_tamu'] ?? $data['tamu'] ?? $data['guest_count'] ?? '-';
        $area = $data['area'] ?? '-';
        $namaTamu = !empty($data['nama_tamu']) ? $data['nama_tamu'] : 'Tamu';
        $noHp = $data['no_hp'] ?? $data['phone'] ?? '-';
        $email = $data['email'] ?? '-';
        $booking = $data['booking_number'] ?? null;

        $bookingLine = $booking ? "🎟️ *Kode Booking*: {$booking}\n" : "";

        $message = "Halo Admin Ebony Cafe! 👋\n\n"
                 . "Saya ingin melakukan *reservasi meja* dengan detail berikut:\n\n"
                 . $bookingLine
                 . "📅 *Tanggal*: {$tanggal}\n"
                 . "🕐 *Jam*: {$jam}\n"
                 . "👥 *Jumlah Tamu*: {$jumlahTamu}\n"
                 . "📍 *Area*: {$area}\n"
                 . "👤 *Nama*: {$namaTamu}\n"
                 . "📱 *No. HP / WhatsApp*: {$noHp}\n"
                 . "📧 *Email*: {$email}\n\n"
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
