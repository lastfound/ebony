<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    /**
     * Public list of menus (supports ?featured=true and category filtering).
     */
    public function publicIndex(Request $request)
    {
        $query = Menu::where('is_available', true);

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->filled('category') && $request->category !== 'All Items') {
            $query->where('category', $request->category);
        }

        $menus = $query->orderBy('is_featured', 'desc')
                       ->orderBy('id', 'asc')
                       ->get();

        return response()->json($menus);
    }

    /**
     * Admin list of all menus.
     */
    public function index(Request $request)
    {
        $query = Menu::query();

        if ($request->filled('category') && $request->category !== 'All Items') {
            $query->where('category', $request->category);
        }

        $menus = $query->orderBy('id', 'desc')->get();

        return response()->json($menus);
    }

    /**
     * Admin store new menu.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:100',
            'badge' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:5120', // max 5MB
            'image_url' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'is_available' => 'nullable|boolean',
        ]);

        $imageUrl = $validated['image_url'] ?? null;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('menus', 'public');
            $imageUrl = $path;
        }

        $menu = Menu::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'category' => $validated['category'],
            'badge' => $validated['badge'] ?? null,
            'image_url' => $imageUrl,
            'is_featured' => $request->boolean('is_featured', false),
            'is_available' => $request->boolean('is_available', true),
        ]);

        return response()->json([
            'message' => 'Menu berhasil ditambahkan',
            'data' => $menu,
        ], 201);
    }

    /**
     * Admin update existing menu.
     */
    public function update(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'category' => 'sometimes|required|string|max:100',
            'badge' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:5120',
            'image_url' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'is_available' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('menus', 'public');
            $validated['image_url'] = $path;
        }

        $menu->update($validated);

        return response()->json([
            'message' => 'Menu berhasil diperbarui',
            'data' => $menu,
        ]);
    }

    /**
     * Admin delete menu.
     */
    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();

        return response()->json([
            'message' => 'Menu berhasil dihapus',
        ]);
    }

    /**
     * Admin toggle available / sold out status.
     */
    public function toggleStatus($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->is_available = !$menu->is_available;
        $menu->save();

        return response()->json([
            'message' => 'Status menu berhasil diubah',
            'is_available' => $menu->is_available,
            'data' => $menu,
        ]);
    }
}
