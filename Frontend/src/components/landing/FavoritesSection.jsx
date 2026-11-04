import { useState, useEffect } from 'react';
import { getMenuFavorites } from '../../api/publicApi';
import MenuCard from './MenuCard';
import AOS from 'aos';

export default function FavoritesSection() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  // 1. Link Folder Google Drive (Untuk View Full Menu)
  const folderDriveUrl = "https://drive.google.com/drive/folders/1gb8Bpddjg6qg6FJ18JC8udaQpLIc8Y4F?usp=share_link";

  // 2. Link File PDF Makanan & Minuman (Untuk Download Direct)
  const menuPdfUrl = "https://drive.google.com/file/d/1mc1GxRTcijTjhxtJIaCuVYPiNKd0tc-A/view?usp=sharing";
  const spiritPdfUrl = "https://drive.google.com/file/d/14aIDAeIBA-jg4WkuGylgOunWJRxfSItf/view?usp=sharing";

  useEffect(() => {
    getMenuFavorites()
      .then((data) => {
        setMenus(Array.isArray(data) ? data : []);
        setLoadFailed(false);
      })
      .catch(() => {
        setMenus([]);
        setLoadFailed(true);
      })
      .finally(() => setLoading(false));
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