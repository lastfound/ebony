import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import MetricCard from '../../components/admin/MetricCard';
import TrendingCard from '../../components/admin/TrendingCard';
import { getDashboardData } from '../../api/adminApi';

const SAMPLE_DASHBOARD = {
  total_reservations: 42,
  reservation_change: 12,
  revenue_today: '3.450.000',
  revenue_change: 5,
  today_name: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  active_menus: 86,
  seasonal_count: 2,
  trending_items: [
    {
      id: 1,
      name: 'Pan-Seared Scallops',
      description: 'Hokkaido scallops, saffron emulsion, micro greens, and crispy parsnip chips.',
      image_url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      name: 'Wagyu Ribeye MB7+',
      description: 'Charcoal-grilled premium wagyu, roasted bone marrow, pomme purée, red wine jus.',
      image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      name: 'Valrhona Chocolate Lava',
      description: 'Molten warm 70% dark chocolate cake, Madagascar vanilla bean gelato, raspberry coulis.',
      image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    },
  ],
};

function getInitialDashboardData() {
  try {
    const cached = localStorage.getItem('admin_dashboard_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        return {
          ...SAMPLE_DASHBOARD,
          ...parsed,
          trending_items: Array.isArray(parsed.trending_items) && parsed.trending_items.length > 0
            ? parsed.trending_items
            : SAMPLE_DASHBOARD.trending_items,
        };
      }
    }
  } catch {
    // fallback
  }
  return SAMPLE_DASHBOARD;
}

export default function DashboardPage() {
  // Langsung tampilkan data awal/cache seketika (0 ms) agar TIDAK loading lama / blank
  const [data, setData] = useState(getInitialDashboardData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => {
    try {
      return localStorage.getItem('admin_dashboard_updated') || '';
    } catch {
      return '';
    }
  });

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const d = await getDashboardData();
      if (d && typeof d === 'object') {
        const normalized = {
          total_reservations: Number(d.total_reservations ?? 0),
          reservation_change: Number(d.reservation_change ?? 0),
          revenue_today: d.revenue_today || '0',
          revenue_change: Number(d.revenue_change ?? 0),
          today_name: d.today_name || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          active_menus: Number(d.active_menus ?? 0),
          seasonal_count: Number(d.seasonal_count ?? 0),
          trending_items: Array.isArray(d.trending_items) && d.trending_items.length > 0
            ? d.trending_items
            : SAMPLE_DASHBOARD.trending_items,
        };

        setData(normalized);
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setLastUpdated(timeStr);

        try {
          localStorage.setItem('admin_dashboard_cache', JSON.stringify(normalized));
          localStorage.setItem('admin_dashboard_updated', timeStr);
        } catch {
          // ignore storage limit
        }
      }
    } catch {
      // Jika server backend offline/lambat, tetap gunakan data cache/default dengan lancar
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  return (
    <AdminLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Metrik utama operasional, reservasi, dan performa menu Ebony Cafe.</p>
        </div>

        {/* Status Indikator & Tombol Refresh Cepat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '12px',
            color: isRefreshing ? '#d97706' : '#15803d',
            background: isRefreshing ? '#fef3c7' : '#dcfce7',
            padding: '4px 10px',
            borderRadius: '12px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isRefreshing ? '#d97706' : '#16a34a',
              display: 'inline-block',
            }} />
            {isRefreshing ? 'Memperbarui...' : (lastUpdated ? `Terkini ${lastUpdated}` : 'Aktif')}
          </span>

          <button
            type="button"
            className="btn btn--outline-dark btn--sm"
            onClick={() => loadData(false)}
            disabled={isRefreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '13px' }}
            title="Muat ulang metrik terbaru"
          >
            <span style={{ display: 'inline-block', transform: isRefreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s ease' }}>
              ⟳
            </span>
            Refresh
          </button>
        </div>
      </div>

      {/* METRIC CARDS — Tampil Seketika */}
      <div className="metrics-grid">
        <MetricCard
          label="TOTAL RESERVATIONS"
          icon="🪑"
          value={data.total_reservations}
          trend={`${data.reservation_change >= 0 ? '+' : ''}${data.reservation_change}% dari kemarin`}
          trendUp={data.reservation_change >= 0}
        />
        <MetricCard
          label="REVENUE (TODAY)"
          icon="💳"
          value={`Rp ${data.revenue_today}`}
          trend={`${data.revenue_change >= 0 ? '+' : ''}${data.revenue_change}% vs rata-rata ${data.today_name}`}
          trendUp={data.revenue_change >= 0}
        />
        <MetricCard
          label="ACTIVE MENU ITEMS"
          icon="🍴"
          value={data.active_menus}
          info={`${data.seasonal_count} menu bertanda seasonal`}
        />
      </div>

      {/* QUICK SHORTCUTS UNTUK MEMPERMUDAH ADMIN */}
      <div style={{
        margin: '28px 0',
        padding: '18px 24px',
        background: 'var(--color-card, #ffffff)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg, 16px)',
        boxShadow: 'var(--shadow-card, 0 2px 12px rgba(0,0,0,0.04))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          <div>
            <strong style={{ fontSize: '14px', display: 'block', color: 'var(--color-text, #1a1a1a)' }}>Akses Cepat Pengelolaan</strong>
            <span style={{ fontSize: '12px', color: 'var(--color-muted, #666666)' }}>Kelola reservasi tamu, penyesuaian menu kuliner, atau tautan menu PDF</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/admin/reservations" className="btn btn--outline-dark btn--sm">
            📅 Cek Reservasi
          </Link>
          <Link to="/admin/menu-management" className="btn btn--outline-dark btn--sm">
            🍴 Kelola Menu &amp; PDF
          </Link>
          <Link to="/admin/events" className="btn btn--outline-dark btn--sm">
            🎟 Kelola Event
          </Link>
          <Link to="/admin/gallery" className="btn btn--outline-dark btn--sm">
            🖼 Kelola Galeri
          </Link>
          <Link to="/admin/settings" className="btn btn--outline-dark btn--sm">
            ⚙ Konten Web
          </Link>
        </div>
      </div>

      {/* SECTION TRENDING ITEMS */}
      <div style={{ marginTop: '20px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Trending Dishes &amp; Chef's Picks</h2>
      </div>

      <div className="trending-grid">
        {data.trending_items?.map((item) => (
          <TrendingCard key={item.id} item={item} />
        ))}
      </div>
    </AdminLayout>
  );
}
