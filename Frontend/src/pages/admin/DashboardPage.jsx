import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import MetricCard from '../../components/admin/MetricCard';
import TrendingCard from '../../components/admin/TrendingCard';
import { getDashboardData } from '../../api/adminApi';

const SAMPLE_DASHBOARD = {
  total_reservations: 42,
  reservation_change: 12,
  revenue_today: "3JT",
  revenue_change: 5,
  today_name: "Tuesday",
  active_menus: 86,
  seasonal_count: 2,
  trending_items: [
    {
      id: 1,
      name: "Pan-Seared Scallops",
      description: "A guest favorite from our signature menu, served with cauliflower purée.",
      image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80"
    },
    {
      id: 2,
      name: "Truffle Risotto",
      description: "Most ordered item this week, featuring seasonal Alba truffles.",
      image_url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80"
    }
  ]
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, use the actual API call
    // getDashboardData().then(d => setData(d)).finally(() => setLoading(false));
    
    // Using sample data for layout demonstration based on the design
    setTimeout(() => {
      setData(SAMPLE_DASHBOARD);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Key metrics for today's service.</p>
        </div>
        <button className="btn btn--icon" aria-label="Notifications" style={{ border: 'none' }}>🔔</button>
      </div>

      {loading ? <p>Loading data...</p> : (
        <>
          {/* Metrik Cards */}
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
