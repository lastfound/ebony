import { useState, useEffect, useRef } from 'react';
import { getMenuFavorites } from '../../api/publicApi';
import MenuCard from './MenuCard';
import SAMPLE_MENUS from '../../data/sampleMenus';
import AOS from 'aos';

export default function FavoritesSection() {
  const [menus, setMenus] = useState(SAMPLE_MENUS);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const sectionRef = useRef(null);

  // 1. Link Folder Google Drive (Untuk View Full Menu)
  const folderDriveUrl = "https://drive.google.com/drive/folders/1gb8Bpddjg6qg6FJ18JC8udaQpLIc8Y4F?usp=share_link";

  // 2. Link File PDF Makanan & Minuman (Untuk Download Direct)
  const menuPdfUrl = "https://drive.google.com/file/d/1mc1GxRTcijTjhxtJIaCuVYPiNKd0tc-A/view?usp=sharing";
  const spiritPdfUrl = "https://drive.google.com/file/d/14aIDAeIBA-jg4WkuGylgOunWJRxfSItf/view?usp=sharing";

  useEffect(() => {
    // 🌟 PERFORMANCE: Ambil menu favorit dari backend hanya saat mendekati section
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          getMenuFavorites()
            .then((data) => {
              if (Array.isArray(data) && data.length > 0) {
                setMenus(data);
              }
              setLoadFailed(false);
            })
            .catch(() => {
              // Jika backend belum aktif (misal testing di Vercel), tetap gunakan SAMPLE_MENUS
              setMenus(SAMPLE_MENUS);
              setLoadFailed(false);
            });
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [menus]);

  return (
    <section className="favorites" id="menu" ref={sectionRef}>
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
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-muted)' }}>
          <p style={{ fontSize: '1rem', margin: '0 0 6px', letterSpacing: '0.02em' }}>
            {loadFailed
              ? 'Gagal memuat menu. Periksa koneksi ke server lalu muat ulang halaman.'
              : 'Belum ada menu Best Seller yang ditampilkan saat ini.'}
          </p>
          {!loadFailed && (
            <p style={{ fontSize: '0.85rem', opacity: 0.65 }}>
              Admin dapat memilih dan mengaktifkan hingga 6 menu Best Seller melalui Admin Dashboard.
            </p>
          )}
        </div>
      )}

      <div className="favorites__actions">
        {/* Tombol View Full Menu (Membuka Folder Drive) */}
        <a 
          href={folderDriveUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="btn btn--outline-dark"
        >
          VIEW FULL MENU →
        </a>

        {/* Tombol Download Menu Makanan */}
        <a 
          href={menuPdfUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="btn btn--download"
        >
          ↓ FOOD MENU (PDF)
        </a>

        {/* Tombol Download Menu Minuman */}
        <a 
          href={spiritPdfUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="btn btn--download"
        >
          ↓ DRINKS MENU (PDF)
        </a>
      </div>
    </section>
  );
}