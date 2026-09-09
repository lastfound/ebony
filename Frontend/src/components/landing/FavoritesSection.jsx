import { useState, useEffect } from 'react';
import { getMenuFavorites } from '../../api/publicApi';
import MenuCard from './MenuCard';
import SAMPLE_MENUS from '../../data/sampleMenus';

import AOS from 'aos';

export default function FavoritesSection() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenuFavorites()
      .then((data) => {
        if (data && data.length > 0) {
          setMenus(data);
        } else {
          // Fallback to sample data
          setMenus(SAMPLE_MENUS);
        }
      })
      .catch(() => {
        setMenus(SAMPLE_MENUS);
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
      ) : (
        <div className="favorites__grid">
          {menus.slice(0, 6).map((menu, index) => (
            <div key={menu.id} data-aos="fade-up" data-aos-delay={index * 100}>
              <MenuCard menu={menu} />
            </div>
          ))}
        </div>
      )}

      <div className="favorites__actions">
        <a href="https://drive.google.com/" target="_blank" rel="noreferrer" className="btn btn--outline-dark">
          VIEW FULL MENU →
        </a>
        <a href="#" className="btn btn--download" download>
          ↓ DOWNLOAD FULL MENU (PDF)
        </a>
      </div>
    </section>
  );
}
