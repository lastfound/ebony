<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AIService;

class AIController extends Controller
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'conversation_id' => 'nullable|string'
        ]);

        $response = $this->aiService->chat($request->input('message'), $request->input('conversation_id'));
        
        return response()->json($response);
    }

    public function menuRecommendation(Request $request)
    {
        // For simplicity, we route to chat with a formulated prompt
        $occasion = $request->input('occasion', '');
        $guestCount = $request->input('guest_count', 1);
        
        $msg = "Tolong berikan rekomendasi menu untuk occasion: {$occasion} dengan {$guestCount} orang.";
        $response = $this->aiService->chat($msg);
        return response()->json($response);
    }

    public function reservationAssistant(Request $request)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        $msg = "Tolong ekstrak informasi reservasi (date, time, guest_count, table_preference, special_request) dari pesan ini: " . $request->input('message');
        
        $response = $this->aiService->chat($msg);
        return response()->json($response);
    }

    public function analyzeRequest(Request $request)
    {
        $request->validate([
            'special_request' => 'required|string'
        ]);

        $analysis = $this->aiService->analyzeRequest($request->input('special_request'));
        
        return response()->json($analysis);
    }
}
