<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class EventController extends Controller
{
    private function clearEventCache(): void
    {
        try {
            Cache::forget('events_public');
        } catch (\Throwable $e) {
            // Ignore cache clear error
        }
    }

    /**
     * Public list of upcoming events.
     */
    public function publicIndex()
    {
        $events = Cache::remember('events_public', 3600, function () {
            return Event::where('is_active', true)
                           ->orderBy('date', 'asc')
                           ->get();
        });

        return response()->json($events)
            ->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }

    /**
     * Public single event detail.
     */
    public function show($id)
    {
        $event = Event::findOrFail($id);

        return response()->json($event);
    }

    /**
     * Admin list of events.
     */
    public function index()
    {
        $events = Event::orderBy('date', 'desc')->get();

        return response()->json($events);
    }

    /**
     * Admin store event.
     */
    public function store(Request $request)
    {
        // String kosong (dari input opsional) dinormalkan jadi null.
        $request->merge(['end_date' => $request->input('end_date') ?: null]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'end_date' => 'nullable|date',
            'has_time' => 'nullable|boolean',
            'image' => 'nullable|image|max:5120',
            'image_url' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $imageUrl = $validated['image_url'] ?? null;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $imageUrl = $path;
        }

        $event = Event::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'date' => $validated['date'],
            'end_date' => $validated['end_date'] ?? null,
            'has_time' => $request->boolean('has_time', true),
            'image_url' => $imageUrl,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $this->clearEventCache();

        return response()->json([
            'message' => 'Event berhasil ditambahkan',
            'data' => $event,
        ], 201);
    }

    /**
     * Admin update event.
     */
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $request->merge(['end_date' => $request->input('end_date') ?: null]);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'sometimes|required|date',
            'end_date' => 'nullable|date',
            'has_time' => 'nullable|boolean',
            'image' => 'nullable|image|max:5120',
            'image_url' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $validated['image_url'] = $path;
        }

        // Checkbox yang tidak dicentang tidak terkirim FormData —
        // hanya timpa has_time kalau field-nya memang dikirim.
        if ($request->has('has_time')) {
            $validated['has_time'] = $request->boolean('has_time');
        }
        // Admin boleh mengosongkan jam selesai (kirim string kosong).
        if ($request->has('end_date') && $request->input('end_date') === '') {
            $validated['end_date'] = null;
        }

        $event->update($validated);
        $this->clearEventCache();

        return response()->json([
            'message' => 'Event berhasil diperbarui',
            'data' => $event,
        ]);
    }

    /**
     * Admin delete event.
     */
    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();
        $this->clearEventCache();

        return response()->json([
            'message' => 'Event berhasil dihapus',
        ]);
    }
}
