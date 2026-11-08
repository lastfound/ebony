<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Throwable;

class SiteSettingController extends Controller
{
    private function defaults(): array
    {
        return [
            'about_title' => "The Essence\nof Ebony",
            'about_subtitle' => 'Simple Elegance',
            'about_description' => "Ebony is conceived as a sanctuary of culinary artistry, an escape from the ordinary where every detail is meticulously curated. We believe that true luxury lies in simple elegance, stripping away the superfluous to reveal the profound and authentic soul of our ingredients.\n\nOur philosophy is deeply rooted in our terroir. We journey across seasons to source the finest produce, treating each element with unwavering respect and innovative technique. It is a continuous dialogue between cherished traditions and refined modernity.\n\nStep into our gallery, where the meticulously designed ambiance, the unobtrusive service, and the exquisite, artful creations on your plate merge into a singular, unforgettable narrative. Welcome to a space where flavors tell stories.",
            'about_image_url' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
            'menu_pdf_url' => 'https://drive.google.com/',
        ];
    }

    private function getSettings(): array
    {
        $settings = $this->defaults();

        // 1. Try DB
        try {
            $dbRows = SiteSetting::all();
            foreach ($dbRows as $row) {
                if ($row->value !== null && $row->value !== '') {
                    $settings[$row->key] = $row->value;
                }
            }
            return $settings;
        } catch (Throwable $e) {
            // DB maybe not migrated or down, try file
        }

        // 2. Try JSON file in storage
        try {
            if (Storage::disk('local')->exists('site_settings.json')) {
                $raw = Storage::disk('local')->get('site_settings.json');
                $parsed = json_decode($raw, true);
                if (is_array($parsed)) {
                    $settings = array_merge($settings, $parsed);
                }
            }
        } catch (Throwable $e) {
            // fallback to defaults
        }

        return $settings;
    }

    /**
     * Public get site settings.
     */
    public function publicIndex()
    {
        $data = Cache::remember('site_settings_public', 3600, function () {
            return $this->getSettings();
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }

    /**
     * Admin update site settings.
     */
    public function update(Request $request)
    {
        try {
            Cache::forget('site_settings_public');
        } catch (Throwable $e) {
            // ignore
        }
        $current = $this->getSettings();
        $updates = [];

        // Text inputs
        if ($request->has('about_title')) {
            $updates['about_title'] = $request->input('about_title');
        }
        if ($request->has('about_subtitle')) {
            $updates['about_subtitle'] = $request->input('about_subtitle');
        }
        if ($request->has('about_description')) {
            $updates['about_description'] = $request->input('about_description');
        }
        if ($request->has('about_image_url')) {
            $updates['about_image_url'] = $request->input('about_image_url');
        }
        if ($request->has('menu_pdf_url')) {
            $updates['menu_pdf_url'] = $request->input('menu_pdf_url');
        }

        // Handle uploaded image
        if ($request->hasFile('about_image')) {
            $file = $request->file('about_image');
            $path = $file->store('settings', 'public');
            $updates['about_image_url'] = url('storage/' . $path);
        }

        // Handle uploaded PDF
        if ($request->hasFile('menu_pdf_file')) {
            $file = $request->file('menu_pdf_file');
            $path = $file->store('menus_pdf', 'public');
            $updates['menu_pdf_url'] = url('storage/' . $path);
        }

        $merged = array_merge($current, $updates);

        // Save to DB if possible
        try {
            foreach ($updates as $k => $v) {
                SiteSetting::updateOrCreate(['key' => $k], ['value' => $v]);
            }
        } catch (Throwable $e) {
            // DB error logged, file will persist
        }

        // Save to storage file as resilient cache
        try {
            Storage::disk('local')->put('site_settings.json', json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        } catch (Throwable $e) {
            // ignore
        }

        return response()->json([
            'message' => 'Pengaturan halaman utama & menu PDF berhasil diperbarui',
            'data' => $merged,
        ]);
    }
}
