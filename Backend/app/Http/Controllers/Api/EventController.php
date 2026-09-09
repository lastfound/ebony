<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Public list of upcoming events.
     */
    public function publicIndex()
    {
        $events = Event::where('is_active', true)
                       ->orderBy('date', 'asc')
                       ->get();

        return response()->json($events);
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
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
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
            'image_url' => $imageUrl,
            'is_active' => $request->boolean('is_active', true),
        ]);

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

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'sometimes|required|date',
            'image' => 'nullable|image|max:5120',
            'image_url' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $validated['image_url'] = $path;
        }

        $event->update($validated);

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

        return response()->json([
            'message' => 'Event berhasil dihapus',
        ]);
    }
}
