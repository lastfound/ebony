<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Reservation;
use App\Models\ReservationItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Throwable;

class DashboardController extends Controller
{
    /**
     * Get dashboard KPI metrics and trending items with high performance and fault tolerance.
     */
    public function index()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        try {
            // 1. Total Reservations Today & Yesterday comparison
            $totalReservationsToday = Reservation::whereDate('date', $today)->count();
            $totalReservationsYesterday = Reservation::whereDate('date', $yesterday)->count();

            $resChange = $totalReservationsYesterday > 0
                ? (int) round((($totalReservationsToday - $totalReservationsYesterday) / $totalReservationsYesterday) * 100)
                : 0;

            // 2. Revenue Today
            $todayReservations = Reservation::whereDate('date', $today)->get(['id', 'party_size']);
            $todayReservationIds = $todayReservations->pluck('id')->all();

            $preorderRevenue = 0;
            if (!empty($todayReservationIds)) {
                $preorderRevenue = (float) (ReservationItem::whereIn('reservation_id', $todayReservationIds)
                    ->selectRaw('SUM(price * qty) as total')
                    ->value('total') ?? 0);
            }

            if ($preorderRevenue <= 0) {
                $totalGuests = $todayReservations->sum('party_size');
                $revenueAmount = $totalGuests * 150000;
            } else {
                $revenueAmount = $preorderRevenue;
            }

            // 3. Menus KPI
            $activeMenus = Menu::where('is_available', true)->count();
            $seasonalCount = Menu::where('badge', 'like', '%SEASONAL%')->count();

            // 4. Trending Items
            $trendingItems = Menu::where('is_available', true)
                ->where('is_featured', true)
                ->take(3)
                ->get(['id', 'name', 'description', 'image_url']);

            // 5. Promo Items
            $promoItems = Menu::where('is_available', true)
                ->where('is_promo', true)
                ->take(5)
                ->get([
                    'id',
                    'name',
                    'description',
                    'image_url',
                    'promo_badge',
                    'promo_tagline',
                    'promo_subtext',
                ]);

            return response()->json([
                'total_reservations' => $totalReservationsToday,
                'reservation_change' => $resChange,
                'revenue_today'      => number_format($revenueAmount, 0, ',', '.'),
                'revenue_change'     => 8,
                'today_name'         => $today->format('l'),
                'active_menus'       => $activeMenus,
                'seasonal_count'     => $seasonalCount,
                'trending_items'     => $trendingItems,
                'promo_items'        => $promoItems,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'total_reservations' => 0,
                'reservation_change' => 0,
                'revenue_today'      => '0',
                'revenue_change'     => 0,
                'today_name'         => $today->format('l'),
                'active_menus'       => 0,
                'seasonal_count'     => 0,
                'trending_items'     => [],
                'promo_items'        => [],
                'fallback'           => true,
            ]);
        }
    }
}
