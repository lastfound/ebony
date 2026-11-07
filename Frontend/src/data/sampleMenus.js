// Sample fallback data when API is not available (e.g. testing on Vercel)
const SAMPLE_MENUS = [
  {
    id: 1,
    name: 'Wagyu Tenderloin Steak',
    description: 'Grilled Australian Wagyu with truffle butter, asparagus, and red wine reduction',
    image_url: '/assets/images/menu/stk.jfif',
    category: 'Mains',
    badge: 'SIGNATURE DISH',
  },
  {
    id: 2,
    name: 'Classic Margherita Pizza',
    description: 'Artisan hand-stretched dough, San Marzano tomato sauce, fresh mozzarella, and basil',
    image_url: '/assets/images/menu/pizaputih.jfif',
    category: 'Mains',
    badge: 'CHEF RECOMMENDATION',
  },
  {
    id: 3,
    name: 'French Butter Croissant & Pastry',
    description: 'Freshly baked flaky artisanal croissants served with homemade berry compote',
    image_url: '/assets/images/menu/pastry.jfif',
    category: 'Desserts',
    badge: 'BEST SELLER',
  },
  {
    id: 4,
    name: 'Creamy Truffle Mushroom Soup',
    description: 'Rich forest mushroom velouté finished with white truffle oil and herb croutons',
    image_url: '/assets/images/menu/soup.jfif',
    category: 'Starters',
    badge: 'STARTERS',
  },
  {
    id: 5,
    name: 'Artisan Coffee & Latte Blend',
    description: 'Single-origin espresso roast with silky textured milk and subtle hazelnut notes',
    image_url: '/assets/images/menu/c.jfif',
    category: 'Beverages',
    badge: 'BEVERAGES',
  },
  {
    id: 6,
    name: 'Signature Roasted Duck Breasts',
    description: 'Tender spiced duck breast with orange glaze and seasonal roasted baby roots',
    image_url: '/assets/images/menu/b2.jpeg',
    category: 'Mains',
    badge: 'SPECIALTY',
  },
];

export default SAMPLE_MENUS;
