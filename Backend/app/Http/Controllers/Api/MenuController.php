<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
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

    public function index(Request $request)
    {
        $query = Menu::query();

        if ($request->filled('category') && $request->category !== 'All Items') {
            $query->where('category', $request->category);
        }

        $menus = $query->orderBy('id', 'desc')->get();

        return response()->json($menus);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:100',
            'badge' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:5120', 
            'image_url' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'is_available' => 'nullable|boolean',
            'is_promo' => 'nullable',
            'promo_badge' => 'nullable|string|max:255',
            'promo_tagline' => 'nullable|string|max:255',
            'promo_subtext' => 'nullable|string|max:255',
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
            'is_promo' => $request->input('is_promo', 0),
            'promo_badge' => $validated['promo_badge'] ?? null,
            'promo_tagline' => $validated['promo_tagline'] ?? null,
            'promo_subtext' => $validated['promo_subtext'] ?? null,
        ]);

        return response()->json([
            'message' => 'Menu berhasil ditambahkan',
            'data' => $menu,
        ], 201);
    }

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
            'is_promo' => 'nullable',
            'promo_badge' => 'nullable|string|max:255',
            'promo_tagline' => 'nullable|string|max:255',
            'promo_subtext' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('menus', 'public');
            $validated['image_url'] = $path;
        }

        $validated['is_promo'] = $request->input('is_promo', 0);

        $menu->update($validated);

        return response()->json([
            'message' => 'Menu berhasil diperbarui',
            'data' => $menu,
        ]);
    }

    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();

        return response()->json([
            'message' => 'Menu berhasil dihapus',
        ]);
    }

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
