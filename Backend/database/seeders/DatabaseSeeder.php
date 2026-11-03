<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\RestaurantTable;
use App\Models\Menu;
use App\Models\Event;
use App\Models\Reservation;
use App\Models\ReservationItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin User
        User::updateOrCreate(
            ['email' => 'admin@ebony.com'],
            [
                'name' => 'Ebony Admin',
                'password' => Hash::make('password123'),
                'role' => 'manager',
                'avatar' => null,
            ]
        );

        // 2. Restaurant Tables — sesuai sketsa tangan 2 lantai:
        // L1: kiri Tangga+Bar, kanan tembok-luar isi Taman (atas) + Pintu (bawah).
        // L2: kiri Toilet+Tangga, kanan area S penuh meja bulat.
        $tables = [
            // Lantai 1 — Taman (dalam tembok, atas)
            ['name' => 'L1-01', 'capacity' => 2, 'area' => 'Taman'],
            ['name' => 'L1-02', 'capacity' => 2, 'area' => 'Taman'],
            ['name' => 'L1-03', 'capacity' => 4, 'area' => 'Taman'],
            ['name' => 'L1-04', 'capacity' => 4, 'area' => 'Taman'],
            ['name' => 'L1-05', 'capacity' => 4, 'area' => 'Taman'],
            // Lantai 1 — dekat Pintu (bawah)
            ['name' => 'L1-06', 'capacity' => 4, 'area' => 'Indoor'],
            ['name' => 'L1-07', 'capacity' => 4, 'area' => 'Indoor'],
            ['name' => 'L1-08', 'capacity' => 2, 'area' => 'Indoor'],
            ['name' => 'L1-09', 'capacity' => 6, 'area' => 'Indoor'],
            // Lantai 1 — luar tembok (3 meja di luar garis)
            ['name' => 'L1-10', 'capacity' => 4, 'area' => 'Luar Tembok'],
            ['name' => 'L1-11', 'capacity' => 4, 'area' => 'Luar Tembok'],
            ['name' => 'L1-12', 'capacity' => 2, 'area' => 'Luar Tembok'],
            // Lantai 1 — nempel tembok (tambahan, sesuai koreksi)
            ['name' => 'L1-13', 'capacity' => 2, 'area' => 'Taman'],
            ['name' => 'L1-14', 'capacity' => 2, 'area' => 'Indoor'],
            // Lantai 2 — kantong atas S (pinggir tembok, semua @2 kursi + bangku beton)
            ['name' => 'L2-01', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-02', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-03', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-04', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-05', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-06', 'capacity' => 2, 'area' => 'Rooftop'],
            // Lantai 2 — kantong bawah S (pinggir tembok, semua @2 kursi + bangku beton)
            ['name' => 'L2-07', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-08', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-09', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-10', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-11', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-12', 'capacity' => 2, 'area' => 'Rooftop'],
            // Lantai 2 — tambahan nempel tembok (koreksi: kurang meja di tembok)
            ['name' => 'L2-13', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-14', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-15', 'capacity' => 2, 'area' => 'Rooftop'],
            ['name' => 'L2-16', 'capacity' => 2, 'area' => 'Rooftop'],
        ];

        foreach ($tables as $tbl) {
            RestaurantTable::updateOrCreate(['name' => $tbl['name']], $tbl);
        }

        // Bersihkan meja lama / tidak ada di lokasi asli (tidak ada VIP Suite).
        RestaurantTable::whereIn('name', [
            'Window 01', 'Window 02', 'Window 04',
            'Table 01', 'Table 02', 'Outdoor 01', 'VIP Suite',
            'IN-01', 'IN-02', 'IN-03', 'IN-04', 'IN-05', 'IN-06',
            'OUT-01', 'OUT-02', 'OUT-03', 'OUT-04', 'OUT-05', 'OUT-06',
            'TG-01', 'TG-02',
        ])->delete();

        // 3. Menus (French-Asian Fusion)
        $menus = [
            [
                'name' => 'Pan-Seared Scallops',
                'description' => 'Hokkaido scallops, saffron emulsion, micro greens, and crispy parsnip chips.',
                'price' => 125000,
                'category' => 'Starters',
                'badge' => 'SIGNATURE DISH',
                'image_url' => 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
                'is_available' => true,
            ],
            [
                'name' => 'Truffle Beef Carpaccio',
                'description' => 'Thinly sliced wagyu tenderloin, white truffle oil, shaved parmesan, capers, arugula.',
                'price' => 95000,
                'category' => 'Starters',
                'badge' => 'CHEF PICK',
                'image_url' => 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
                'is_available' => true,
            ],
            [
                'name' => 'Wagyu Ribeye MB7+',
                'description' => 'Charcoal-grilled premium wagyu, roasted bone marrow, pomme purée, red wine jus.',
                'price' => 385000,
                'category' => 'Mains',
                'badge' => 'SIGNATURE DISH',
                'image_url' => 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
                'is_available' => true,
            ],
            [
                'name' => 'Duck Breast à l’Orange',
                'description' => 'Crispy skin duck magret, spiced blood orange glaze, braised endive, carrot purée.',
                'price' => 185000,
                'category' => 'Mains',
                'badge' => null,
                'image_url' => 'https://images.unsplash.com/photo-1514944298350-01990c0fd398?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
                'is_available' => true,
            ],
            [
                'name' => 'Lobster Thermidor',
                'description' => 'Fresh baby lobster baked with cognac cream, gruyère cheese, and fresh tarragon.',
                'price' => 320000,
                'category' => 'Mains',
                'badge' => 'SEASONAL',
                'image_url' => 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
                'is_featured' => false,
                'is_available' => true,
            ],
            [
                'name' => 'Valrhona Chocolate Lava',
                'description' => 'Molten warm 70% dark chocolate cake, Madagascar vanilla bean gelato, raspberry coulis.',
                'price' => 75000,
                'category' => 'Desserts',
                'badge' => 'FAVORITE',
                'image_url' => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
                'is_available' => true,
            ],
            [
                'name' => 'Matcha Mille-Feuille',
                'description' => 'Layers of caramelized puff pastry, Uji ceremonial matcha diplomat cream, gold leaf.',
                'price' => 70000,
                'category' => 'Desserts',
                'badge' => null,
                'image_url' => 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
                'is_available' => true,
            ],
            [
                'name' => 'Artisan Smoky Charcoal Latte',
                'description' => 'Activated charcoal infused espresso, steamed oat milk, organic honeycomb crumble.',
                'price' => 45000,
                'category' => 'Beverages',
                'badge' => 'POPULAR',
                'image_url' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
                'is_featured' => false,
                'is_available' => true,
            ],
            [
                'name' => 'Signature Ebony Mocktail',
                'description' => 'Blackcurrant reduction, butterfly pea tea, elderflower tonic, rosemary smoke mist.',
                'price' => 52000,
                'category' => 'Beverages',
                'badge' => 'SIGNATURE',
                'image_url' => 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
                'is_featured' => false,
                'is_available' => true,
            ],
        ];

        foreach ($menus as $menu) {
            Menu::updateOrCreate(['name' => $menu['name']], $menu);
        }

        // 4. Events
        $events = [
            [
                'title' => 'Wine & Dine Night: Bordeaux Vintage',
                'description' => 'An exclusive 5-course curated dinner paired with premier grand cru wines selected by our master sommelier.',
                'date' => Carbon::now()->addDays(7)->setTime(19, 0),
                'image_url' => 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'title' => 'Acoustic Jazz Evening under the Stars',
                'description' => 'Intimate live jazz performance featuring Jakarta Jazz Quartet, outdoor cocktail specials, and tasting platters.',
                'date' => Carbon::now()->addDays(14)->setTime(20, 0),
                'image_url' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'title' => 'French Pastry & Culinary Masterclass',
                'description' => 'Hands-on session with Executive Chef Jean-Paul on the art of French pastry dough, croissants, and ganache.',
                'date' => Carbon::now()->addDays(21)->setTime(10, 0),
                'image_url' => 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
        ];

        foreach ($events as $evt) {
            Event::updateOrCreate(['title' => $evt['title']], $evt);
        }

        // 5. Sample Reservations
        $windowTable = RestaurantTable::where('name', 'L1-03')->first();

        $reservation = Reservation::updateOrCreate(
            ['booking_number' => '8291'],
            [
                'guest_name' => 'Eleanor Vance',
                'phone' => '+62 812-3456-7890',
                'email' => 'eleanor.vance@example.com',
                'date' => Carbon::today(),
                'time' => '19:30',
                'party_size' => 4,
                'table_id' => $windowTable ? $windowTable->id : null,
                'occasion' => 'Anniversary',
                'dietary_notes' => 'One guest has a mild shellfish allergy.',
                'seating_notes' => 'Quiet corner table near the window if possible.',
                'is_arrived' => false,
                'status' => 'confirmed',
            ]
        );

        // Preorder for this reservation
        $scallop = Menu::where('name', 'Pan-Seared Scallops')->first();
        $wagyu   = Menu::where('name', 'Wagyu Ribeye MB7+')->first();

        if ($scallop) {
            ReservationItem::updateOrCreate(
                ['reservation_id' => $reservation->id, 'menu_id' => $scallop->id],
                ['qty' => 2, 'price' => $scallop->price]
            );
        }

        if ($wagyu) {
            ReservationItem::updateOrCreate(
                ['reservation_id' => $reservation->id, 'menu_id' => $wagyu->id],
                ['qty' => 2, 'price' => $wagyu->price]
            );
        }
    }
}
