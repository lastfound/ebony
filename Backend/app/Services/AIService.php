<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
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
        $this->apiKey = env('AI_API_KEY', '');
        $this->model = 'gemini-3.5-flash';
        $this->baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";
    }

    protected function getContext(): string
    {
        $menus = Menu::where('is_available', true)->get();
        $menuText = "=== MENUS ===\n";
        foreach ($menus as $m) {
            $menuText .= "ID: {$m->id}, Name: {$m->name}, Desc: {$m->description}, Price: {$m->price}, Category: {$m->category}, Ingredients: {$m->ingredients}, Allergens: {$m->allergens}\n";
        }

        $events = Event::where('is_active', true)->get();
        $eventText = "=== EVENTS ===\n";
        foreach ($events as $e) {
            $eventText .= "Title: {$e->title}, Desc: {$e->description}, Date: {$e->date}\n";
        }

        $tables = RestaurantTable::all();
        $tableText = "=== TABLES ===\n";
        foreach ($tables as $t) {
            $tableText .= "Name: {$t->name}, Capacity: {$t->capacity}, Area: {$t->area}\n";
        }

        return "Data Ebony Cafe:\n\n{$menuText}\n{$eventText}\n{$tableText}";
    }

    public function chat(string $message, ?string $conversationId = null): array
    {
        $systemPrompt = "Anda adalah Ebony AI Dining Concierge, asisten AI untuk Ebony Cafe. " .
                        "Gunakan data restoran berikut untuk menjawab pertanyaan customer dengan ramah dan informatif.\n\n" .
                        $this->getContext() . "\n\n" .
                        "Aturan:\n" .
                        "- Jawab dengan bahasa natural dan ramah.\n" .
                        "- Jangan mengarang data menu/event/harga yang tidak ada di konteks.\n" .
                        "- Jika membantu reservasi, kumpulkan info (tanggal, waktu, jumlah tamu) lalu tampilkan ringkasan sebelum konfirmasi.\n" .
                        "- Jika ditanya alergi, jangan jamin 100% aman, sarankan konfirmasi ke staf.\n";

        // Handle conversation history
        $conversation = null;
        $history = [];
        
        try {
            if ($conversationId) {
                $conversation = AIConversation::where('session_id', $conversationId)->first();
            }

            if (!$conversation) {
                $conversationId = $conversationId ?? (string) Str::uuid();
                $conversation = AIConversation::create(['session_id' => $conversationId]);
            }

            if ($conversation) {
                foreach ($conversation->messages()->orderBy('id')->get() as $msg) {
                    $history[] = [
                        'role' => $msg->role === 'model' ? 'model' : 'user',
                        'parts' => [['text' => $msg->content]]
                    ];
                }
            }
        } catch (\Exception $e) {
            // If DB is down or not migrated, just proceed without memory
            $conversation = null;
        }

        // Add current user message
        $history[] = [
            'role' => 'user',
            'parts' => [['text' => $message]]
        ];

        // Save user message to DB
        if ($conversation) {
            try {
                $conversation->messages()->create([
                    'role' => 'user',
                    'content' => $message
                ]);
            } catch (\Exception $e) {}
        }

        $response = Http::post("{$this->baseUrl}?key={$this->apiKey}", [
            'system_instruction' => [
                'parts' => [['text' => $systemPrompt]]
            ],
            'contents' => $history,
            'generationConfig' => [
                'temperature' => 0.7,
            ]
        ]);

        if ($response->successful()) {
            $result = $response->json();
            $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? "Maaf, terjadi kesalahan saat memproses permintaan.";
            
            // Save model response to DB
            if ($conversation) {
                try {
                    $conversation->messages()->create([
                        'role' => 'model',
                        'content' => $text
                    ]);
                } catch (\Exception $e) {}
            }

            return ['success' => true, 'message' => $text, 'conversation_id' => $conversationId, 'recommendations' => []];
        }

        return ['success' => false, 'message' => 'Gagal menghubungi AI Service. Error: ' . $response->body(), 'conversation_id' => $conversationId];
    }

    public function analyzeRequest(string $specialRequest): array
    {
        $prompt = "Sebagai asisten restoran Ebony Cafe, analisis special request berikut dari pelanggan:\n" .
                  "\"{$specialRequest}\"\n\n" .
                  "Format balasan Anda harus berupa JSON murni dengan struktur berikut:\n" .
                  "{\n" .
                  "  \"category\": \"(misal: anniversary, allergy, birthday, romantic)\",\n" .
                  "  \"priority\": \"(low/medium/high)\",\n" .
                  "  \"detected_request\": [\"list of requests\"],\n" .
                  "  \"staff_action\": [\"list of actions staff should take\"]\n" .
                  "}";

        $response = Http::post("{$this->baseUrl}?key={$this->apiKey}", [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [['text' => $prompt]]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.1,
            ]
        ]);

        if ($response->successful()) {
            $result = $response->json();
            $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? "{}";
            
            // Extract JSON
            $text = preg_replace('/```json|```/', '', $text);
            $json = json_decode(trim($text), true);
            
            return $json ?? ['category' => 'general', 'priority' => 'low', 'detected_request' => [], 'staff_action' => []];
        }

        return ['category' => 'general', 'priority' => 'low', 'detected_request' => [], 'staff_action' => []];
    }
}
