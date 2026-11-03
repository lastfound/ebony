import { useState, useEffect } from 'react';
import { getMenuFavorites } from '../../api/publicApi';
import { getSiteSettings, getLocalSiteSettings } from '../../services/siteSettings';
import MenuCard from './MenuCard';
import AOS from 'aos';

export default function FavoritesSection() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(() => getLocalSiteSettings().menu_pdf_url || 'https://drive.google.com/');

  useEffect(() => {
    getMenuFavorites()
      .then((data) => {
        // Tampilkan HANYA menu asli dari database
        setMenus(Array.isArray(data) ? data : []);
        setLoadFailed(false);
      })
      .catch(() => {
        setMenus([]);
        setLoadFailed(true);
      })
      .finally(() => setLoading(false));

    // Ambil URL PDF Menu yang dikonfigurasi admin
    getSiteSettings().then((s) => {
      if (s?.menu_pdf_url) setPdfUrl(s.menu_pdf_url);
    });

    const handleUpdate = (e) => {
      if (e.detail?.menu_pdf_url) setPdfUrl(e.detail.menu_pdf_url);
    };
    window.addEventListener('site-settings-updated', handleUpdate);
    return () => window.removeEventListener('site-settings-updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (!loading) {
      AOS.refresh();
    }
  }, [loading]);

  return (
    <section className="favorites" id="menu">
      <div className="section-header" data-aos="fade-up">
        <span className="section-label">THE GALLERY MENU</span>
        <h2 className="section-title">Our favorites</h2>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="menu-card-skeleton" />
          ))}
        </div>
      ) : menus.length > 0 ? (
        <div className="favorites__grid">
          {menus.slice(0, 6).map((menu, index) => (
            <div key={menu.id} data-aos="fade-up" data-aos-delay={index * 100}>
              <MenuCard menu={menu} />
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
          {loadFailed
            ? 'Gagal memuat menu. Periksa koneksi ke server lalu muat ulang halaman.'
            : 'Belum ada menu favorit saat ini.'}
        </p>
      )}

      <div className="favorites__actions">
        <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn btn--outline-dark">
          VIEW FULL MENU →
        </a>
        <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn btn--download" download>
          ↓ DOWNLOAD FULL MENU (PDF)
        </a>
      </div>
    </section>
  );
}
