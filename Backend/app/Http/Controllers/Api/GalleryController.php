<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    private function clearGalleryCache(): void
    {
        try {
            Cache::forget('galleries_public');
        } catch (\Throwable $e) {
            // Ignore cache clear error
        }
    }

    /**
     * Public index: tampilkan foto galeri yang aktif untuk landing page.
     */
    public function publicIndex()
    {
        $galleries = Cache::remember('galleries_public', 3600, function () {
            return Gallery::where('is_active', true)
                ->orderBy('order', 'asc')
                ->orderBy('id', 'desc')
                ->get();
        });

        return response()->json([
            'status' => 'success',
            'data' => $galleries,
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }

    /**
     * Admin index: tampilkan semua foto galeri untuk dashboard admin.
     */
    public function index()
    {
        $galleries = Gallery::orderBy('order', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $galleries,
        ]);
    }

    /**
     * Admin store: tambah foto galeri baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:10240', // Maks 10MB
            'image_url' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $imageUrl = $validated['image_url'] ?? null;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('gallery', 'public');
            $imageUrl = $path;
        }

        if (!$imageUrl) {
            return response()->json([
                'message' => 'File gambar wajib diunggah.',
            ], 422);
        }

        $gallery = Gallery::create([
            'title' => $validated['title'] ?? null,
            'caption' => $validated['caption'] ?? null,
            'image_url' => $imageUrl,
            'order' => (int) ($validated['order'] ?? 0),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $this->clearGalleryCache();

        return response()->json([
            'message' => 'Foto galeri berhasil ditambahkan.',
            'data' => $gallery,
        ], 201);
    }

    /**
     * Admin update: perbarui data atau foto galeri.
     */
    public function update(Request $request, $id)
    {
        $gallery = Gallery::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:10240',
            'image_url' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika tersimpan di public storage
            $rawOld = $gallery->getRawOriginal('image_url');
            if ($rawOld && !str_starts_with($rawOld, 'http') && !str_starts_with($rawOld, '/assets/')) {
                Storage::disk('public')->delete($rawOld);
            }

            $path = $request->file('image')->store('gallery', 'public');
            $gallery->image_url = $path;
        } elseif ($request->filled('image_url')) {
            $gallery->image_url = $request->input('image_url');
        }

        if ($request->has('title')) {
            $gallery->title = $validated['title'];
        }
        if ($request->has('caption')) {
            $gallery->caption = $validated['caption'];
        }
        if ($request->has('order')) {
            $gallery->order = (int) $validated['order'];
        }
        if ($request->has('is_active')) {
            $gallery->is_active = $request->boolean('is_active');
        }

        $gallery->save();
        $this->clearGalleryCache();

        return response()->json([
            'message' => 'Foto galeri berhasil diperbarui.',
            'data' => $gallery,
        ]);
    }

    /**
     * Admin destroy: hapus foto galeri.
     */
    public function destroy($id)
    {
        $gallery = Gallery::findOrFail($id);

        $rawImage = $gallery->getRawOriginal('image_url');
        if ($rawImage && !str_starts_with($rawImage, 'http') && !str_starts_with($rawImage, '/assets/')) {
            Storage::disk('public')->delete($rawImage);
        }

        $gallery->delete();
        $this->clearGalleryCache();

        return response()->json([
            'message' => 'Foto galeri berhasil dihapus.',
        ]);
    }

    /**
     * Admin toggle status active.
     */
    public function toggleStatus($id)
    {
        $gallery = Gallery::findOrFail($id);
        $gallery->is_active = !$gallery->is_active;
        $gallery->save();
        $this->clearGalleryCache();

        return response()->json([
            'message' => 'Status galeri berhasil diubah.',
            'is_active' => $gallery->is_active,
            'data' => $gallery,
        ]);
    }
}

