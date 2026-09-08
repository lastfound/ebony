# 🎨 PRD Frontend — Ebony Cafe & Gallery
### Stack: React (Frontend) + Laravel (Backend API)
**Versi:** 2.0 | **Tanggal:** September 2026 | **Untuk:** Tim Frontend Developer

---

## DAFTAR ISI

1. [Design System](#1-design-system)
2. [Struktur Project React](#2-struktur-project-react)
3. [Routing (React Router)](#3-routing-react-router)
4. [State Management](#4-state-management)
5. [LANDING PAGE — Komponen & Halaman](#5-landing-page--komponen--halaman)
6. [ADMIN DASHBOARD — Komponen & Halaman](#6-admin-dashboard--komponen--halaman)
7. [Komponen Reusable (Shared Components)](#7-komponen-reusable-shared-components)
8. [Interaksi & Behavior UI](#8-interaksi--behavior-ui)
9. [API Laravel — Routes & Endpoint](#9-api-laravel--routes--endpoint)
10. [Auth & Protected Routes](#10-auth--protected-routes)

---

## 1. DESIGN SYSTEM

### 1.1 Warna (Tailwind Config atau CSS Variables)

Tambahkan ke `tailwind.config.js` jika pakai Tailwind, atau di `src/styles/variables.css`:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'ebony-bg':        '#FAF9F6',
        'ebony-text':      '#1A1A1A',
        'ebony-muted':     '#6B6B6B',
        'ebony-accent':    '#C9A96E',
        'ebony-accent-dk': '#9B7E4F',
        'ebony-border':    '#E8E4DC',
        'ebony-sidebar':   '#F5F2EC',
        'ebony-danger':    '#C0392B',
        'ebony-success':   '#4A7C59',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Inter"', '"DM Sans"', 'sans-serif'],
      },
    }
  }
}
```

### 1.2 Ukuran Font

| Elemen | Size | Weight | Font |
|--------|------|--------|------|
| Hero Title | `clamp(36px, 5vw, 64px)` | 700 | Serif |
| Section Title (h2) | `clamp(28px, 3vw, 42px)` | 600 | Serif |
| Dashboard Page Title | `36–42px` | 400 | Serif |
| Metric Number | `40–48px` | 400 | Serif |
| Card Title | `18–22px` | 600 | Serif |
| Body Paragraph | `14–16px` | 400 | Sans |
| Label / Caption | `11–12px` | 500 | Sans, UPPERCASE, letter-spacing |
| Navbar Link | `12–13px` | 500 | Sans, UPPERCASE |
| Tombol | `12–13px` | 500 | Sans, UPPERCASE |

### 1.3 Spacing & Efek

```css
/* src/styles/variables.css */
:root {
  --color-bg:         #FAF9F6;
  --color-text:       #1A1A1A;
  --color-muted:      #6B6B6B;
  --color-accent:     #C9A96E;
  --color-border:     #E8E4DC;
  --color-sidebar:    #F5F2EC;
  --color-danger:     #C0392B;
  --color-success:    #4A7C59;

  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans:  'Inter', 'DM Sans', sans-serif;

  --shadow-card:  0 2px 12px rgba(0,0,0,0.06);
  --shadow-modal: 0 8px 40px rgba(0,0,0,0.18);
  --transition:   all 0.2s ease;

  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   16px;
  --radius-full: 999px;
}
```

### 1.4 Breakpoints

| Nama | Lebar |
|------|-------|
| Mobile | `< 768px` |
| Tablet | `768px – 1024px` |
| Desktop | `> 1024px` |

---

## 2. STRUKTUR PROJECT REACT

```
ebony-frontend/                   ← Project React (Vite / CRA)
│
├── public/
│   └── assets/
│       ├── images/               ← Foto hero, menu, gallery, events
│       └── fonts/
│
├── src/
│   ├── main.jsx                  ← Entry point
│   ├── App.jsx                   ← Router utama
│   │
│   ├── styles/
│   │   ├── variables.css         ← CSS custom properties
│   │   ├── base.css              ← Reset & global typography
│   │   └── index.css             ← Import semua style
│   │
│   ├── api/
│   │   ├── axiosInstance.js      ← Setup axios (base URL, interceptors)
│   │   ├── publicApi.js          ← API publik (menus, events, reservasi)
│   │   └── adminApi.js           ← API admin (auth + semua CRUD)
│   │
│   ├── hooks/
│   │   ├── useAuth.js            ← Hook cek status login admin
│   │   ├── useFetch.js           ← Generic fetch hook
│   │   └── useToast.js           ← Hook untuk notifikasi toast
│   │
│   ├── context/
│   │   └── AuthContext.jsx       ← Context untuk auth admin
│   │
│   ├── components/               ← Komponen reusable
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Toggle.jsx
│   │   │   ├── FormGroup.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── Spinner.jsx
│   │   │
│   │   ├── landing/
│   │   │   ├── Navbar.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── AboutSection.jsx
│   │   │   ├── FavoritesSection.jsx
│   │   │   ├── MenuCard.jsx
│   │   │   ├── GallerySection.jsx
│   │   │   ├── EventsSection.jsx
│   │   │   ├── EventCard.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   └── admin/
│   │       ├── Sidebar.jsx
│   │       ├── AdminLayout.jsx
│   │       ├── MetricCard.jsx
│   │       ├── TrendingCard.jsx
│   │       ├── ReservationRow.jsx
│   │       ├── MenuAdminCard.jsx
│   │       ├── EventAdminCard.jsx
│   │       └── PageHeader.jsx
│   │
│   └── pages/
│       ├── landing/
│       │   ├── LandingPage.jsx       ← Halaman utama publik
│       │   └── ReservationPage.jsx   ← Form reservasi
│       │
│       └── admin/
│           ├── LoginPage.jsx
│           ├── DashboardPage.jsx
│           ├── ReservationsPage.jsx
│           ├── ReservationDetailPage.jsx
│           └── MenuManagementPage.jsx
│
├── .env                          ← VITE_API_URL=http://localhost:8000/api
├── package.json
└── vite.config.js
```

---

## 3. ROUTING (React Router)

### `src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage           from './pages/landing/LandingPage';
import ReservationPage       from './pages/landing/ReservationPage';
import LoginPage             from './pages/admin/LoginPage';
import DashboardPage         from './pages/admin/DashboardPage';
import ReservationsPage      from './pages/admin/ReservationsPage';
import ReservationDetailPage from './pages/admin/ReservationDetailPage';
import MenuManagementPage    from './pages/admin/MenuManagementPage';
import ProtectedRoute        from './components/admin/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === LANDING PAGE (Publik) === */}
        <Route path="/"            element={<LandingPage />} />
        <Route path="/reservation" element={<ReservationPage />} />

        {/* === ADMIN === */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected — harus login */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route path="dashboard"              element={<DashboardPage />} />
          <Route path="reservations"           element={<ReservationsPage />} />
          <Route path="reservations/:id"       element={<ReservationDetailPage />} />
          <Route path="menu-management"        element={<MenuManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**Daftar Route:**

| Path | Komponen | Akses |
|------|----------|-------|
| `/` | `LandingPage` | Publik |
| `/reservation` | `ReservationPage` | Publik |
| `/admin/login` | `LoginPage` | Publik |
| `/admin/dashboard` | `DashboardPage` | 🔒 Admin |
| `/admin/reservations` | `ReservationsPage` | 🔒 Admin |
| `/admin/reservations/:id` | `ReservationDetailPage` | 🔒 Admin |
| `/admin/menu-management` | `MenuManagementPage` | 🔒 Admin |

---

## 4. STATE MANAGEMENT

Tidak perlu Redux. Cukup gunakan:

| Kebutuhan | Solusi |
|-----------|--------|
| Auth admin (login/logout) | `React Context` + `localStorage` |
| Data dari API | `useState` + `useEffect` (atau React Query) |
| Form state | `useState` atau `react-hook-form` |
| Modal buka/tutup | `useState` (boolean) |
| Notifikasi toast | Custom `useToast` hook |

### `src/api/axiosInstance.js`

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:8000/api
  headers: { 'Content-Type': 'application/json' },
});

// Otomatis sertakan token di setiap request admin
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tangani 401 (token expired/invalid)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

---

## 5. LANDING PAGE — KOMPONEN & HALAMAN

### 5.1 `LandingPage.jsx`

Halaman utama yang menyusun semua section.

```jsx
// src/pages/landing/LandingPage.jsx
import Navbar           from '../../components/landing/Navbar';
import HeroSection      from '../../components/landing/HeroSection';
import AboutSection     from '../../components/landing/AboutSection';
import FavoritesSection from '../../components/landing/FavoritesSection';
import GallerySection   from '../../components/landing/GallerySection';
import EventsSection    from '../../components/landing/EventsSection';
import Footer           from '../../components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <FavoritesSection />
        <GallerySection />
        <EventsSection />
      </main>
      <Footer />
    </>
  );
}
```

---

### 5.2 `Navbar.jsx`

```jsx
// src/components/landing/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__logo">
        <img src="/assets/images/logo-ebony.svg" alt="EBONY" />
      </div>

      <ul className={`navbar__menu ${menuOpen ? 'navbar__menu--open' : ''}`}>
        {['Home','About','Menu','Gallery','Reservation'].map(item => (
          <li key={item}>
            <a href={`#${item.toLowerCase()}`}>{item.toUpperCase()}</a>
          </li>
        ))}
      </ul>

      <a href="#contact" className="btn btn--primary btn--sm">CONTACT</a>

      {/* Hamburger — hanya tampil di mobile */}
      <button
        className="navbar__hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>
    </nav>
  );
}
```

**Style Navbar:**
- Default: `background: transparent`, `position: fixed`, `width: 100%`, `z-index: 100`
- `.navbar--scrolled`: `background: rgba(255,255,255,0.95)`, `backdrop-filter: blur(10px)`, `box-shadow: 0 2px 20px rgba(0,0,0,0.08)`
- Tinggi: `70px`, padding horizontal `40–80px`
- Mobile (`< 768px`): sembunyikan menu list, tampilkan hamburger

---

### 5.3 `HeroSection.jsx`

```jsx
// src/components/landing/HeroSection.jsx
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="hero" id="home">
      <div className="hero__bg">
        <img src="/assets/images/hero-interior.jpg" alt="Ebony Cafe" />
      </div>
      <div className="hero__overlay" />
      <div className="hero__content">
        <span className="hero__label">FRENCH · ASIAN FUSION</span>
        <h1 className="hero__title">
          A culinary experience<br />to remember
        </h1>
        <p className="hero__subtitle">
          Where fine ingredients meet thoughtful technique
          <br />in an intimate setting
        </p>
        <button
          className="btn btn--outline-light btn--lg"
          onClick={() => navigate('/reservation')}
        >
          RESERVE A TABLE
        </button>
      </div>
    </section>
  );
}
```

**Style:**
- `height: 100vh`, `min-height: 600px`, `position: relative`
- `hero__bg img`: `position: absolute`, `inset: 0`, `width: 100%`, `height: 100%`, `object-fit: cover`
- `hero__overlay`: `position: absolute`, `inset: 0`, `background: rgba(0,0,0,0.40)`
- `hero__content`: `position: relative`, `z-index: 1`, `display: flex`, `flex-direction: column`, `align-items: center`, `text-align: center`, `color: white`, `padding: 0 24px`
- `hero__label`: 11px, uppercase, letter-spacing 0.2em, margin-bottom 16px, warna `rgba(255,255,255,0.75)`
- `hero__title`: font serif, clamp(36px, 5vw, 64px), warna putih, line-height 1.15
- `hero__subtitle`: font sans, 15px, warna `rgba(255,255,255,0.75)`, margin 20px 0

---

### 5.4 `FavoritesSection.jsx`

```jsx
// src/components/landing/FavoritesSection.jsx
import { useState, useEffect } from 'react';
import { getMenuFavorites } from '../../api/publicApi';
import MenuCard from './MenuCard';

export default function FavoritesSection() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenuFavorites()
      .then(data => setMenus(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="favorites" id="menu">
      <div className="section-header">
        <span className="section-label">THE GALLERY MENU</span>
        <h2 className="section-title">Our favorites</h2>
      </div>

      {loading ? (
        <div className="loading-grid">
          {/* Skeleton loading: 6 placeholder card */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="menu-card-skeleton" />
          ))}
        </div>
      ) : (
        <div className="favorites__grid">
          {menus.slice(0, 6).map(menu => (
            <MenuCard key={menu.id} menu={menu} />
          ))}
        </div>
      )}

      <div className="favorites__actions">
        <a href="/menu" className="btn btn--outline-dark">
          VIEW FULL MENU →
        </a>
        <a href="/menu.pdf" className="btn btn--download" download>
          ↓ DOWNLOAD FULL MENU (PDF)
        </a>
      </div>
    </section>
  );
}
```

---

### 5.5 `MenuCard.jsx`

```jsx
// src/components/landing/MenuCard.jsx
export default function MenuCard({ menu }) {
  return (
    <div className="menu-card">
      <div className="menu-card__image-wrap">
        <img src={menu.image_url} alt={menu.name} loading="lazy" />
        <span className="menu-card__badge">{menu.badge || menu.category}</span>
      </div>
      <div className="menu-card__body">
        <h3 className="menu-card__name">{menu.name}</h3>
        <p className="menu-card__desc">{menu.description}</p>
      </div>
    </div>
  );
}
```

**Props `menu`:**
```js
{
  id:          Number,
  name:        String,   // "Seared Scallops"
  description: String,   // "Saffron emulsion, micro greens..."
  image_url:   String,   // URL foto
  category:    String,   // "Starters" | "Mains" | "Desserts" | "Beverages"
  badge:       String,   // "SIGNATURE DISH" (opsional)
  is_featured: Boolean,  // tampil di landing page atau tidak
  is_available: Boolean,
}
```

---

### 5.6 `EventsSection.jsx`

```jsx
// src/components/landing/EventsSection.jsx
import { useState, useEffect } from 'react';
import { getEvents } from '../../api/publicApi';
import EventCard from './EventCard';

export default function EventsSection() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents().then(data => setEvents(data));
  }, []);

  return (
    <section className="events" id="events">
      <div className="section-header">
        <span className="section-label">EVENT MENDATANG</span>
        <h2 className="section-title">Upcoming Events</h2>
      </div>
      <div className="events__grid">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
```

---

### 5.7 `EventCard.jsx`

```jsx
// src/components/landing/EventCard.jsx
export default function EventCard({ event }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric', weekday: 'short'
  });

  return (
    <div className="event-card">
      <div className="event-card__image">
        <img src={event.image_url} alt={event.title} loading="lazy" />
        <span className="event-card__tag">UPCOMING</span>
      </div>
      <div className="event-card__body">
        <span className="event-card__date">{formattedDate.toUpperCase()}</span>
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__desc">{event.description}</p>
        <a href="#" className="btn btn--link">VIEW DETAILS →</a>
      </div>
    </div>
  );
}
```

**Props `event`:**
```js
{
  id:          Number,
  title:       String,  // "Wine & Dine Night"
  description: String,
  date:        String,  // "2026-10-12T19:00:00"
  image_url:   String,
}
```

---

### 5.8 `ReservationPage.jsx` — Form Reservasi

```jsx
// src/pages/landing/ReservationPage.jsx
import { useState } from 'react';
import { submitReservation } from '../../api/publicApi';

const INITIAL = {
  name: '', phone: '', email: '',
  date: '', time: '', party_size: 1,
  occasion: '', table_id: '',
  dietary_notes: '', seating_notes: '',
};

export default function ReservationPage() {
  const [form, setForm]       = useState(INITIAL);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingNo, setBookingNo] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Nama minimal 2 karakter';
    if (!form.phone || form.phone.length < 8)       errs.phone = 'Nomor telepon tidak valid';
    if (!/\S+@\S+\.\S+/.test(form.email))           errs.email = 'Format email tidak valid';
    if (!form.date)                                  errs.date = 'Pilih tanggal reservasi';
    if (!form.time)                                  errs.time = 'Pilih jam reservasi';
    if (form.party_size < 1 || form.party_size > 20) errs.party_size = 'Jumlah tamu 1–20 orang';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setLoading(true);
    try {
      const res = await submitReservation(form);
      setBookingNo(res.booking_number);
      setSuccess(true);
    } catch {
      setErrors({ general: 'Terjadi kesalahan. Coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reservation-success">
        <h2>Reservasi Berhasil! 🎉</h2>
        <p>Nomor booking Anda: <strong>#{bookingNo}</strong></p>
        <p>Kami akan menghubungi Anda melalui nomor telepon atau email yang didaftarkan.</p>
        <a href="/" className="btn btn--primary">Kembali ke Beranda</a>
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <h1 className="reservation-page__title">Reserve a Table</h1>
      <p className="reservation-page__subtitle">
        Isi form di bawah untuk melakukan reservasi di Ebony Cafe & Gallery.
      </p>

      {errors.general && (
        <div className="alert alert--error">{errors.general}</div>
      )}

      <form onSubmit={handleSubmit} className="reservation-form" noValidate>
        {/* Baris 1: Nama + Telepon */}
        <div className="form-row">
          <FormField label="Nama Lengkap" name="name" type="text"
            value={form.name} onChange={handleChange} error={errors.name}
            placeholder="Masukkan nama lengkap" required />
          <FormField label="Nomor Telepon" name="phone" type="tel"
            value={form.phone} onChange={handleChange} error={errors.phone}
            placeholder="+62..." required />
        </div>

        {/* Baris 2: Email */}
        <FormField label="Email" name="email" type="email"
          value={form.email} onChange={handleChange} error={errors.email}
          placeholder="email@domain.com" required />

        {/* Baris 3: Tanggal + Jam */}
        <div className="form-row">
          <FormField label="Tanggal Reservasi" name="date" type="date"
            value={form.date} onChange={handleChange} error={errors.date}
            min={new Date().toISOString().split('T')[0]} required />
          <FormField label="Jam Reservasi" name="time" type="time"
            value={form.time} onChange={handleChange} error={errors.time}
            min="11:00" max="21:00" required />
        </div>

        {/* Baris 4: Jumlah Tamu + Occasion */}
        <div className="form-row">
          <FormField label="Jumlah Tamu" name="party_size" type="number"
            value={form.party_size} onChange={handleChange} error={errors.party_size}
            min={1} max={20} required />
          <div className="form-group">
            <label className="form-label">Occasion <span>(Opsional)</span></label>
            <select name="occasion" value={form.occasion} onChange={handleChange}
              className="form-input">
              <option value="">-- Pilih Occasion --</option>
              {['Birthday','Anniversary','Business Dinner','Date Night',
                'Family Gathering','Other'].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Catatan khusus */}
        <div className="form-group">
          <label className="form-label">Catatan Dietary <span>(Opsional)</span></label>
          <textarea name="dietary_notes" value={form.dietary_notes}
            onChange={handleChange} className="form-input form-textarea"
            placeholder="Alergi makanan, pantangan, dll." rows={3} />
        </div>

        <div className="form-group">
          <label className="form-label">Preferensi Tempat Duduk <span>(Opsional)</span></label>
          <textarea name="seating_notes" value={form.seating_notes}
            onChange={handleChange} className="form-input form-textarea"
            placeholder="Contoh: kursi dekat jendela, area yang tenang, dll." rows={3} />
        </div>

        <button type="submit" className="btn btn--primary btn--full btn--lg"
          disabled={loading}>
          {loading ? <Spinner /> : 'SUBMIT RESERVASI'}
        </button>
      </form>
    </div>
  );
}

// Sub-komponen FormField
function FormField({ label, error, required, ...props }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="form-required">*</span>}
      </label>
      <input className={`form-input ${error ? 'is-error' : ''}`} {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
```

---

## 6. ADMIN DASHBOARD — KOMPONEN & HALAMAN

### 6.1 `AdminLayout.jsx`

Dipakai di semua halaman admin sebagai wrapper.

```jsx
// src/components/admin/AdminLayout.jsx
import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
```

**Style:**
```css
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}
.admin-content {
  flex: 1;
  padding: 48px;
  overflow-y: auto;
}
```

---

### 6.2 `Sidebar.jsx`

```jsx
// src/components/admin/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/admin/dashboard',        icon: '⊞', label: 'DASHBOARD' },
  { to: '/admin/reservations',     icon: '📅', label: 'RESERVATIONS' },
  { to: '/admin/menu-management',  icon: '✕', label: 'MENU MANAGEMENT' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <span className="sidebar__brand-name">EBONY CAFE &<br />GALLERY</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer links */}
      <div className="sidebar__footer-links">
        <a href="#" className="sidebar__link">⚙ SETTINGS</a>
        <a href="#" className="sidebar__link">ℹ HELP CENTER</a>
        <button onClick={handleLogout} className="sidebar__link sidebar__link--logout">
          → LOGOUT
        </button>
      </div>

      {/* Admin profile */}
      <div className="sidebar__profile">
        <img src={admin?.avatar || '/assets/images/avatar-default.png'} alt="Admin" />
        <div>
          <span className="sidebar__profile-name">{admin?.name || 'Ebony Admin'}</span>
          <span className="sidebar__profile-role">{admin?.role || 'MANAGER'}</span>
        </div>
      </div>
    </aside>
  );
}
```

**Style Sidebar:**
```css
.sidebar {
  width: 260px;
  min-height: 100vh;
  background: var(--color-sidebar);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  padding: 32px 0;
}
.sidebar__brand { padding: 0 24px 32px; }
.sidebar__brand-name { font-family: var(--font-sans); font-size: 13px; font-weight: 700; letter-spacing: 0.08em; }
.sidebar__nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.sidebar__link {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 24px;
  font-size: 12px; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--color-muted);
  text-decoration: none;
  transition: var(--transition);
}
.sidebar__link:hover { color: var(--color-text); background: rgba(0,0,0,0.03); }
.sidebar__link--active {
  color: var(--color-text);
  border-left: 3px solid var(--color-text);
  background: rgba(0,0,0,0.04);
}
.sidebar__profile {
  margin: 16px;
  padding: 12px;
  background: white;
  border-radius: var(--radius-md);
  display: flex; align-items: center; gap: 10px;
}
.sidebar__profile img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.sidebar__profile-name { display: block; font-size: 13px; font-weight: 600; }
.sidebar__profile-role  { display: block; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-muted); }
```

---

### 6.3 `DashboardPage.jsx`

```jsx
// src/pages/admin/DashboardPage.jsx
import { useState, useEffect } from 'react';
import AdminLayout  from '../../components/admin/AdminLayout';
import MetricCard   from '../../components/admin/MetricCard';
import TrendingCard from '../../components/admin/TrendingCard';
import { getDashboardData } from '../../api/adminApi';

export default function DashboardPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData().then(d => setData(d)).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Key metrics for today's service.</p>
        </div>
        <button className="btn btn--icon" aria-label="Notifications">🔔</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <>
          {/* Kartu Metrik */}
          <div className="metrics-grid">
            <MetricCard
              label="TOTAL RESERVATIONS"
              icon="🪑"
              value={data.total_reservations}
              trend={`+${data.reservation_change}% from yesterday`}
              trendUp={data.reservation_change >= 0}
            />
            <MetricCard
              label="REVENUE (TODAY)"
              icon="💳"
              value={`Rp ${data.revenue_today}`}
              trend={`+${data.revenue_change}% vs avg ${data.today_name}`}
              trendUp={data.revenue_change >= 0}
            />
            <MetricCard
              label="ACTIVE MENU ITEMS"
              icon="🍴"
              value={data.active_menus}
              info={`${data.seasonal_count} items marked seasonal`}
            />
          </div>

          {/* Trending Items */}
          <div className="trending-grid">
            {data.trending_items?.map(item => (
              <TrendingCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
```

---

### 6.4 `MetricCard.jsx`

```jsx
// src/components/admin/MetricCard.jsx
export default function MetricCard({ label, icon, value, trend, trendUp, info }) {
  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <span className="metric-card__label">{label}</span>
        <span className="metric-card__icon">{icon}</span>
      </div>
      <div className="metric-card__value">{value}</div>
      {trend && (
        <div className={`metric-card__trend ${trendUp ? 'trend--up' : 'trend--down'}`}>
          {trendUp ? '↗' : '↘'} {trend}
        </div>
      )}
      {info && <div className="metric-card__info">⏱ {info}</div>}
    </div>
  );
}
```

---

### 6.5 `ReservationsPage.jsx`

```jsx
// src/pages/admin/ReservationsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout      from '../../components/admin/AdminLayout';
import ReservationRow   from '../../components/admin/ReservationRow';
import Modal            from '../../components/ui/Modal';
import { getReservations, exportReservationsCSV } from '../../api/adminApi';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [page, setPage]                 = useState(1);
  const [total, setTotal]               = useState(0);
  const [showModal, setShowModal]       = useState(false);
  const PER_PAGE = 4;

  useEffect(() => {
    getReservations({ page, per_page: PER_PAGE }).then(res => {
      setReservations(res.data);
      setTotal(res.total);
    });
  }, [page]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="page-header">
        <div>
          <span className="page-label">MANAGEMENT</span>
          <h1 className="page-title page-title--italic">Reservations</h1>
          <p className="page-subtitle">
            Manage upcoming bookings, review guest details...
          </p>
        </div>
        <button className="btn btn--outline-dark" onClick={() => setShowModal(true)}>
          + ADD NEW RESERVATION
        </button>
      </div>
      <hr className="divider" />

      {/* List */}
      <div className="list-header">
        <h2 className="list-title">Upcoming Today</h2>
        <button className="btn btn--outline-dark btn--sm" onClick={exportReservationsCSV}>
          ↓ EXPORT CSV
        </button>
      </div>

      <div className="reservation-list">
        {reservations.map(r => (
          <ReservationRow key={r.id} reservation={r} />
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span className="pagination__info">
          SHOWING {reservations.length} OF {total} RESERVATIONS
        </span>
        <div className="pagination__controls">
          <button className="btn btn--link"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}>
            ← Previous
          </button>
          <button className="btn btn--link"
            disabled={page * PER_PAGE >= total}
            onClick={() => setPage(p => p + 1)}>
            Next →
          </button>
        </div>
      </div>

      {/* Modal Add Reservation */}
      {showModal && (
        <Modal title="Add New Reservation" onClose={() => setShowModal(false)}>
          {/* Form reservasi manual di sini */}
        </Modal>
      )}
    </AdminLayout>
  );
}
```

---

### 6.6 `ReservationRow.jsx`

```jsx
// src/components/admin/ReservationRow.jsx
import { useNavigate } from 'react-router-dom';

export default function ReservationRow({ reservation }) {
  const navigate = useNavigate();
  const [hour, minute] = reservation.time.split(':');
  const isPM = parseInt(hour) >= 12;
  const displayHour = parseInt(hour) > 12 ? parseInt(hour) - 12 : hour;

  return (
    <div className="reservation-row">
      <div className="reservation-row__time">
        <span className="row-label">TIME</span>
        <span className="row-value row-value--time">
          {displayHour}:{minute} <small>{isPM ? 'PM' : 'AM'}</small>
        </span>
      </div>
      <div className="reservation-row__guest">
        <span className="row-label">GUEST</span>
        <span className="row-value">{reservation.guest_name}</span>
      </div>
      <div className="reservation-row__party">
        <span className="row-label">PARTY</span>
        <span className="row-value">👥 {reservation.party_size} Guests</span>
      </div>
      <div className="reservation-row__table">
        <span className="row-label">TABLE</span>
        <span className="row-value">🪑 {reservation.table_name}</span>
      </div>
      <button
        className="btn btn--link"
        onClick={() => navigate(`/admin/reservations/${reservation.id}`)}>
        Detail
      </button>
    </div>
  );
}
```

---

### 6.7 `ReservationDetailPage.jsx`

```jsx
// src/pages/admin/ReservationDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Badge from '../../components/ui/Badge';
import { getReservationDetail, confirmArrival } from '../../api/adminApi';

export default function ReservationDetailPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const [data, setData]       = useState(null);
  const [arrived, setArrived] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReservationDetail(id)
      .then(d => { setData(d); setArrived(d.is_arrived); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirmArrival = async () => {
    await confirmArrival(id);
    setArrived(true);
  };

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>;

  const subtotal = data.preorders.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax      = subtotal * 0.25;
  const total    = subtotal + tax;

  return (
    <AdminLayout>
      {/* Header */}
      <button className="back-link" onClick={() => navigate('/admin/reservations')}>
        ← Back to Reservations
      </button>

      <div className="detail-header">
        <div>
          <h1 className="page-title">
            Reservation Detail{' '}
            <span className="detail-number">#{data.booking_number}</span>
          </h1>
          <p className="page-subtitle">
            Review guest details, special requests, and pre-ordered menu items...
          </p>
        </div>
        <div className="detail-header__actions">
          <button className="btn btn--outline-dark">Edit Booking</button>
          <button
            className="btn btn--primary"
            onClick={handleConfirmArrival}
            disabled={arrived}>
            {arrived ? 'Arrived ✓' : 'Confirm Arrival'}
          </button>
        </div>
      </div>

      {/* Body: 2 panel */}
      <div className="detail-body">

        {/* Panel Kiri */}
        <div className="detail-panel detail-panel--left">
          {/* Guest Info */}
          <div className="detail-card">
            <div className="detail-card__header">
              <span>👤 Guest Information</span>
            </div>
            <div className="guest-info">
              <img src={data.guest.avatar || '/assets/images/avatar-default.png'} alt="Guest" />
              <div>
                <h3>{data.guest.name}</h3>
                {data.guest.is_vip && <Badge variant="vip">VIP MEMBER</Badge>}
              </div>
            </div>
            <div className="guest-contacts">
              <p><span className="label">Phone</span> {data.guest.phone}</p>
              <p><span className="label">Email</span> {data.guest.email}</p>
            </div>
          </div>

          <a href="/" target="_blank" className="btn btn--outline-dark btn--full">
            View Live Site
          </a>

          {/* Booking Details */}
          <div className="detail-card">
            <div className="detail-card__header">📅 Booking Details</div>
            <div className="booking-grid">
              <div>
                <span className="label">Date & Time</span>
                <span className="booking-date">{data.date}</span>
                <span className="booking-time">{data.time}</span>
              </div>
              <div>
                <span className="label">Party Size</span>
                <span>{data.party_size} Guests</span>
              </div>
              <div>
                <span className="label">Table Assignment</span>
                <span>{data.table_name} <small>({data.table_area})</small></span>
              </div>
              <div>
                <span className="label">Occasion</span>
                <span>{data.occasion || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Kanan */}
        <div className="detail-panel detail-panel--right">
          {/* Pre-Order Summary */}
          <div className="preorder-section">
            <div className="preorder-section__header">
              <h2>Pre-Order Summary</h2>
              <Badge variant="confirmed">Confirmed</Badge>
            </div>

            {data.preorders.map(item => (
              <div className="preorder-item" key={item.id}>
                <img src={item.image_url} alt={item.name} />
                <div className="preorder-item__info">
                  <span className="name">{item.name}</span>
                  <span className="desc">{item.description}</span>
                </div>
                <div className="preorder-item__price-qty">
                  <span className="price">Rp {item.price.toLocaleString('id-ID')}</span>
                  <span className="qty">Qty {item.qty}</span>
                </div>
              </div>
            ))}

            {/* Kalkulasi total */}
            <div className="preorder-summary">
              <div className="preorder-summary__row">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="preorder-summary__row">
                <span>Estimated Tax & Gratuity (25%)</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="preorder-summary__row preorder-summary__row--total">
                <span>Estimated Total</span>
                <span className="total-value">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Special Notes */}
          {(data.dietary_notes || data.seating_notes) && (
            <div className="special-notes">
              <div className="special-notes__header">📋 Special Notes & Requests</div>
              {data.dietary_notes && (
                <div className="special-notes__item">
                  <span className="tag">DIETARY</span>
                  <p>"{data.dietary_notes}"</p>
                </div>
              )}
              {data.seating_notes && (
                <div className="special-notes__item">
                  <span className="tag">SEATING</span>
                  <p>"{data.seating_notes}"</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
```

---

### 6.8 `MenuManagementPage.jsx`

```jsx
// src/pages/admin/MenuManagementPage.jsx
import { useState, useEffect } from 'react';
import AdminLayout    from '../../components/admin/AdminLayout';
import MenuAdminCard  from '../../components/admin/MenuAdminCard';
import EventAdminCard from '../../components/admin/EventAdminCard';
import Modal          from '../../components/ui/Modal';
import {
  getAdminMenus, toggleMenuStatus, deleteMenu,
  getAdminEvents, deleteEvent,
} from '../../api/adminApi';

const CATEGORIES = ['All Items', 'Starters', 'Mains', 'Desserts', 'Beverages'];

export default function MenuManagementPage() {
  const [menus, setMenus]           = useState([]);
  const [events, setEvents]         = useState([]);
  const [activeTab, setActiveTab]   = useState('All Items');
  const [showMenuModal, setShowMenuModal]   = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editItem, setEditItem]     = useState(null);

  useEffect(() => {
    getAdminMenus().then(setMenus);
    getAdminEvents().then(setEvents);
  }, []);

  const filteredMenus = activeTab === 'All Items'
    ? menus
    : menus.filter(m => m.category === activeTab);

  const handleToggle = async (id, currentStatus) => {
    await toggleMenuStatus(id, !currentStatus);
    setMenus(prev => prev.map(m =>
      m.id === id ? { ...m, is_available: !currentStatus } : m
    ));
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Yakin hapus menu ini?')) return;
    await deleteMenu(id);
    setMenus(prev => prev.filter(m => m.id !== id));
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Yakin hapus event ini?')) return;
    await deleteEvent(id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <AdminLayout>
      {/* === SECTION A: MENU === */}
      <div className="page-header">
        <div>
          <span className="page-label">MANAGEMENT</span>
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">Add, edit, or adjust the status of our culinary offerings.</p>
        </div>
        <button className="btn btn--primary" onClick={() => { setEditItem(null); setShowMenuModal(true); }}>
          + Add New
        </button>
      </div>
      <hr className="divider" />

      {/* Tab Filter */}
      <div className="tab-filter">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`tab-filter__btn ${activeTab === cat ? 'tab-filter__btn--active' : ''}`}
            onClick={() => setActiveTab(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Menu */}
      <div className="menu-admin-grid">
        {filteredMenus.map(menu => (
          <MenuAdminCard
            key={menu.id}
            menu={menu}
            onToggle={() => handleToggle(menu.id, menu.is_available)}
            onEdit={() => { setEditItem(menu); setShowMenuModal(true); }}
            onDelete={() => handleDeleteMenu(menu.id)}
          />
        ))}
      </div>

      {/* === SECTION B: EVENTS === */}
      <hr className="divider divider--section" style={{ marginTop: '64px' }} />

      <div className="events-admin-section">
        <div className="events-admin-section__header">
          <h2 className="section-title">Upcoming Events</h2>
          <button className="btn btn--outline-dark"
            onClick={() => { setEditItem(null); setShowEventModal(true); }}>
            + Add New Event
          </button>
        </div>

        <div className="events-admin-grid">
          {events.map(event => (
            <EventAdminCard
              key={event.id}
              event={event}
              onEdit={() => { setEditItem(event); setShowEventModal(true); }}
              onDelete={() => handleDeleteEvent(event.id)}
            />
          ))}
        </div>
      </div>

      {/* Modal Menu */}
      {showMenuModal && (
        <Modal
          title={editItem ? 'Edit Menu' : 'Add New Menu'}
          onClose={() => setShowMenuModal(false)}>
          {/* Form add/edit menu */}
        </Modal>
      )}

      {/* Modal Event */}
      {showEventModal && (
        <Modal
          title={editItem ? 'Edit Event' : 'Add New Event'}
          onClose={() => setShowEventModal(false)}>
          {/* Form add/edit event */}
        </Modal>
      )}
    </AdminLayout>
  );
}
```

---

## 7. KOMPONEN REUSABLE (SHARED COMPONENTS)

### `Button.jsx`
```jsx
export default function Button({ children, variant = 'primary', size = 'md',
  full = false, disabled = false, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${full ? 'btn--full' : ''}`}
      disabled={disabled}
      onClick={onClick}>
      {children}
    </button>
  );
}
// variant: 'primary' | 'outline-dark' | 'outline-light' | 'link' | 'danger'
// size: 'sm' | 'md' | 'lg'
```

### `Badge.jsx`
```jsx
export default function Badge({ children, variant = 'default' }) {
  return (
    <span className={`badge badge--${variant}`}>{children}</span>
  );
}
// variant: 'vip' | 'confirmed' | 'pending' | 'outline' | 'category'
```

### `Modal.jsx`
```jsx
import { useEffect } from 'react';

export default function Modal({ title, children, onClose }) {
  // Tutup modal saat tekan Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay is-open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
```

### `Toggle.jsx`
```jsx
export default function Toggle({ checked, onChange, label }) {
  return (
    <div className="toggle-wrap">
      <span className={`toggle-label ${!checked ? 'toggle-label--soldout' : ''}`}>
        {checked ? 'Available' : 'Sold Out'}
      </span>
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={onChange} className="toggle__input" />
        <span className="toggle__slider" />
      </label>
    </div>
  );
}
```

### `Toast.jsx` + `useToast.js`
```jsx
// hooks/useToast.js
import { useState } from 'react';
export function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, showToast };
}

// components/ui/Toast.jsx
export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast toast--${toast.type}`}>
      {toast.message}
    </div>
  );
}
```

---

## 8. INTERAKSI & BEHAVIOR UI

| Elemen | Behavior | Implementasi |
|--------|----------|-------------|
| Navbar scroll | Background muncul | `useEffect` listen `window.scroll`, `useState scrolled` |
| Hamburger menu | Buka/tutup nav mobile | `useState menuOpen`, kondisional class |
| Menu card hover | Naik + shadow | CSS `transition: transform 0.2s`, `:hover { transform: translateY(-4px) }` |
| Gallery foto hover | Zoom in | CSS `overflow: hidden` + `img:hover { transform: scale(1.03) }` |
| Tab filter menu | Filter tampilan | `useState activeTab`, filter array `.filter()` |
| Toggle available | Update status real-time | Panggil API PATCH, update state lokal langsung (optimistic update) |
| Modal buka/tutup | Fade + slide | CSS `.is-open` dengan opacity & transform |
| Klik overlay modal | Tutup modal | `onClick={onClose}` di overlay, `stopPropagation` di konten modal |
| Tekan Escape | Tutup modal | `useEffect` dengan event listener keyboard |
| Delete menu/event | Konfirmasi dulu | `window.confirm()` atau custom confirm modal |
| Confirm Arrival | Tombol berubah | `useState arrived`, tombol disabled setelah klik |
| Form submit | Loading state | `useState loading`, tombol disabled + Spinner |
| Error validasi | Highlight field merah | `useState errors`, class `is-error` pada input |
| Toast notifikasi | Muncul 3 detik lalu hilang | `useToast` hook dengan `setTimeout` |
| Pagination | Ambil data baru | `useState page`, `useEffect` dengan `page` sebagai dependency |

---

## 9. API LARAVEL — ROUTES & ENDPOINT

### Setup `.env` Laravel
```env
# .env Laravel
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# CORS sudah di-handle Laravel Sanctum / config/cors.php
```

### `routes/api.php` Laravel
```php
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    AuthController,
    ReservationController,
    MenuController,
    EventController,
    DashboardController,
};

// ===== PUBLIK (Tanpa Auth) =====
Route::get('/menus',      [MenuController::class, 'publicIndex']);   // Ambil menu favorites
Route::get('/events',     [EventController::class, 'publicIndex']);  // Ambil events aktif
Route::post('/reservations', [ReservationController::class, 'store']); // Submit reservasi baru

// ===== ADMIN LOGIN =====
Route::post('/admin/login',  [AuthController::class, 'login']);
Route::post('/admin/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// ===== ADMIN (Protected - Butuh Token) =====
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Reservations
    Route::get('/reservations',              [ReservationController::class, 'index']);
    Route::post('/reservations',             [ReservationController::class, 'adminStore']);
    Route::get('/reservations/export-csv',   [ReservationController::class, 'exportCsv']);
    Route::get('/reservations/{id}',         [ReservationController::class, 'show']);
    Route::put('/reservations/{id}',         [ReservationController::class, 'update']);
    Route::patch('/reservations/{id}/confirm', [ReservationController::class, 'confirmArrival']);

    // Menus
    Route::get('/menus',          [MenuController::class, 'index']);
    Route::post('/menus',         [MenuController::class, 'store']);
    Route::put('/menus/{id}',     [MenuController::class, 'update']);
    Route::delete('/menus/{id}',  [MenuController::class, 'destroy']);
    Route::patch('/menus/{id}/toggle', [MenuController::class, 'toggleStatus']);

    // Events
    Route::get('/events',          [EventController::class, 'index']);
    Route::post('/events',         [EventController::class, 'store']);
    Route::put('/events/{id}',     [EventController::class, 'update']);
    Route::delete('/events/{id}',  [EventController::class, 'destroy']);
});
```

---

### Tabel Lengkap API

| Method | Endpoint | Deskripsi | Dipakai Di |
|--------|----------|-----------|-----------|
| `GET` | `/api/menus?featured=true` | 6 menu favorit untuk landing | `FavoritesSection` |
| `GET` | `/api/events` | Semua event aktif | `EventsSection` |
| `POST` | `/api/reservations` | Submit reservasi publik | `ReservationPage` |
| `POST` | `/api/admin/login` | Login admin, return token | `LoginPage` |
| `POST` | `/api/admin/logout` | Logout, revoke token | Sidebar logout |
| `GET` | `/api/admin/dashboard` | Metrik & trending items | `DashboardPage` |
| `GET` | `/api/admin/reservations?page=1` | List reservasi (paginated) | `ReservationsPage` |
| `POST` | `/api/admin/reservations` | Tambah reservasi manual | Modal Add Reservation |
| `GET` | `/api/admin/reservations/export-csv` | Download CSV | Tombol Export CSV |
| `GET` | `/api/admin/reservations/{id}` | Detail satu reservasi | `ReservationDetailPage` |
| `PUT` | `/api/admin/reservations/{id}` | Edit reservasi | Modal Edit Booking |
| `PATCH` | `/api/admin/reservations/{id}/confirm` | Tandai tamu datang | Tombol Confirm Arrival |
| `GET` | `/api/admin/menus` | Semua menu (admin) | `MenuManagementPage` |
| `POST` | `/api/admin/menus` | Tambah menu baru | Modal Add Menu |
| `PUT` | `/api/admin/menus/{id}` | Edit menu | Modal Edit Menu |
| `DELETE` | `/api/admin/menus/{id}` | Hapus menu | Tombol Hapus |
| `PATCH` | `/api/admin/menus/{id}/toggle` | Toggle available/soldout | `Toggle` component |
| `GET` | `/api/admin/events` | Semua event (admin) | `MenuManagementPage` |
| `POST` | `/api/admin/events` | Tambah event baru | Modal Add Event |
| `PUT` | `/api/admin/events/{id}` | Edit event | Modal Edit Event |
| `DELETE` | `/api/admin/events/{id}` | Hapus event | Tombol Hapus Event |

---

### Contoh Response API

**`GET /api/admin/dashboard`**
```json
{
  "total_reservations": 42,
  "reservation_change": 12,
  "revenue_today": "3.000.000",
  "revenue_change": 5,
  "today_name": "Tuesday",
  "active_menus": 86,
  "seasonal_count": 2,
  "trending_items": [
    {
      "id": 1,
      "name": "Pan-Seared Scallops",
      "description": "A guest favorite from our signature menu...",
      "image_url": "http://localhost:8000/storage/menus/scallops.jpg"
    }
  ]
}
```

**`GET /api/admin/reservations?page=1`**
```json
{
  "data": [
    {
      "id": 1,
      "booking_number": "8291",
      "guest_name": "Eleanor Vance",
      "time": "11:30",
      "party_size": 2,
      "table_name": "Window 04"
    }
  ],
  "total": 12,
  "per_page": 4,
  "current_page": 1
}
```

**`GET /api/admin/reservations/{id}`**
```json
{
  "id": 1,
  "booking_number": "8291",
  "date": "Oct 24, 2026",
  "time": "7:30 PM",
  "party_size": 4,
  "table_name": "Table 12",
  "table_area": "Window",
  "occasion": "Anniversary",
  "is_arrived": false,
  "dietary_notes": "One guest has a severe shellfish allergy...",
  "seating_notes": "Would strongly prefer a quiet corner table...",
  "guest": {
    "name": "Eleanor Vance",
    "phone": "+62 XXXX XXX",
    "email": "e.vance@example.com",
    "is_vip": true,
    "avatar": null
  },
  "preorders": [
    {
      "id": 1,
      "name": "Choco Crunchy Toast",
      "description": "Toast dengan toping coklat...",
      "price": 30000,
      "qty": 2,
      "image_url": "http://localhost:8000/storage/menus/choco-toast.jpg"
    }
  ]
}
```

---

## 10. AUTH & PROTECTED ROUTES

### `src/context/AuthContext.jsx`
```jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });

*PRD Frontend — React + Laravel | Ebony Cafe & Gallery*
*Versi 2.0 — September 2026*

---

## 11. STATUS REPORT & DEVELOPER HANDOFF 🚀

Bagian ini ditambahkan sebagai panduan estafet untuk Developer (Backend/Fullstack) selanjutnya yang akan melanjutkan project ini.

### ✅ APA YANG SUDAH DIKERJAKAN (DONE)
1. **Frontend Architecture & Scaffolding:** Setup React + Vite, React Router DOM, dan struktur folder.
2. **Global Styling & Theming:** Custom CSS variables (`variables.css`), Reset CSS (`base.css`), dan BEM methodology styling (`index.css`).
3. **Dark Mode Support:** Telah dibuat toggle Dark Mode di halaman *Settings* admin yang bekerja mengatur CSS `--color-card`, `--color-bg`, dll dan tersimpan di `localStorage`.
4. **Public Landing Page (UI/UX Lengkap):** 
   - *Hero Section* (Video Background)
   - *About Section*
   - *Favorites/Menu Section*
   - *Gallery Section*
   - *Upcoming Events Section*
   - *Event Detail Page* (Routing dinamis `/events/:id`)
   - *Footer* (dengan SVG Icons & Google Maps Embed)
   - Animasi *Scroll* terintegrasi menggunakan `AOS` (Animate On Scroll).
5. **Reservation System (UI):** Form reservasi dengan validasi, navigasi cerdas (menyimpan context form jika diakses dari Event Page -> mengunci input `Occasion` dengan judul Event), serta simulasi pesan error "Kuota Penuh" (Simulasi frontend jika jumlah tamu > 15).
6. **Admin Portal (UI/UX Lengkap):**
   - Halaman Login (Simulasi Auth dengan `AuthContext`).
   - Dashboard Analytics (Metrics Card, Trending Cards).
   - Menu Management (List menu & event, Modal form Create/Edit dengan *File Input*).
   - Reservations Management (List table, fitur form tambah reservasi manual, detail halaman reservasi dengan tombol confirm arrival).
   - Settings Page (Ganti Username, Ganti Password, Dark Mode).

### 🚧 APA YANG MASIH BELUM / PENDING (TO DO)
1. **Koneksi Backend (API Laravel):** Saat ini semua *fetching* data dilakukan melalui mock API (data statis) di dalam folder `src/api/publicApi.js`. Ini **harus diganti** dengan panggilan Axios asli ke server Laravel.
2. **JWT Authentication:** Login saat ini menggunakan token statis *dummy*. Harus disambungkan dengan Laravel Sanctum / JWT.
3. **Penggantian Foto/Placeholder:** Beberapa gambar Menu, Event, dan Gallery masih menggunakan URL *Unsplash* (dummy images). Harus diganti dengan URL asli dari Storage backend (e.g. AWS S3 / public storage Laravel).
4. **Upload File Aktual:** Pada form *Menu Management*, input gambar sudah menggunakan `<input type="file" />`, namun pengiriman `FormData` (Multipart) ke server belum diimplementasikan di layer API.
5. **Pagination & Filtering:** Backend perlu mengimplementasikan pagination sesungguhnya untuk tabel list reservasi dan list menu di halaman Admin.

### 📝 CATATAN UNTUK BACKEND DEVELOPER
Bagi Backend Developer yang akan melanjutkan, berikut adalah daftar integrasi yang harus Anda siapkan:

#### 1. AUTHENTICATION
- Buat endpoint `POST /api/admin/login` yang mereturn token JWT/Sanctum dan object `user` (minimal field `name`).
- Buat endpoint middleware untuk verifikasi token admin.

#### 2. RESERVATIONS API
- **Endpoint:** `POST /api/reservations`
- **Fields Expected:** `name`, `phone`, `email`, `date`, `time`, `party_size` (int), `table_id` (opsional), `occasion` (string), `dietary_notes` (opsional), `seating_notes` (opsional).
- **Logika "FULL":** Jika kapasitas / kuota di waktu tersebut habis, *return* respon HTTP 400/422 dengan JSON `{ "message": "Maaf, kuota reservasi pada waktu tersebut sudah penuh." }`. Frontend sudah dikonfigurasi untuk menangkap atribut `.message` tersebut dan menampilkannya sebagai alert merah.
- PENTING: Field `occasion` dapat bernilai string "Event: [Nama Event]" (jika pengunjung memesan melalui halaman Event). Jangan batasi enum occasion hanya untuk "Birthday" dll, atau buat kolom khusus `event_id` pada tabel *Reservations* di Database Anda.

#### 3. PUBLIC DATA API (Tanpa Auth)
- `GET /api/menu` -> Return JSON list menu (butuh key: `id`, `name`, `description`, `price`, `category`, `image_url`, `is_featured`).
- `GET /api/events` -> Return JSON list event (butuh key: `id`, `title`, `description`, `date` (datetime), `image_url`).

#### 4. ADMIN DATA API (Dengan Auth)
- Buat endpoint CRUD (Create, Read, Update, Delete) lengkap untuk tabel **Menu**, **Events**, dan **Reservations**.
- Buat sistem upload gambar untuk Menu dan Event, agar admin dapat mengunggah file gambar melalui `multipart/form-data` dari Dashboard.
- `GET /api/admin/dashboard-stats` -> Untuk menyuplai data KPI (Total Reservations, Revenue, dll) di halaman *DashboardPage.jsx*.

Selamat melanjutkan *coding*! Semua kerangka tampilan dan pengalaman pengguna (UX) sudah disiapkan dengan matang di sisi Frontend. 🚀
