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

  // Mencegah halaman utama scrolling saat menu mobile sedang terbuka
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  const navItems = [
    { label: 'Home', path: '/#home' },
    { label: 'About', path: '/#about' },
    { label: 'Menu', path: '/#menu' },
    { label: 'Gallery', path: '/#gallery' },
    { label: 'Events', path: '/#events' },
    { label: 'Reservation', path: '/reservation' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${menuOpen ? 'navbar--open' : ''}`}>
      {/* Logo */}
      <div className="navbar__logo">
        <a href="/">
          <img src="/assets/images/logo-ebony.png" alt="EBONY" className="navbar__logo-img" />
        </a>
      </div>

      {/* Menu links */}
      <ul className={`navbar__menu ${menuOpen ? 'navbar__menu--open' : ''}`}>
        {navItems.map((item) => (
          <li key={item.label} className="navbar__menu-item">
            {/* Menggunakan Link jika ke halaman internal (/reservation) dan <a> untuk anchor link id */}
            {item.path.startsWith('/#') ? (
              <a href={item.path} onClick={() => setMenuOpen(false)}>
                {item.label.toUpperCase()}
              </a>
            ) : (
              <Link to={item.path} onClick={() => setMenuOpen(false)}>
                {item.label.toUpperCase()}
              </Link>
            )}
          </li>
        ))}
        {/* Tombol Contact di dalam menu saat mode Mobile saja */}
        <li className="navbar__menu-item navbar__menu-item--mobile-only">
          <a href="#footer" className="btn btn--outline-light btn--sm" onClick={() => setMenuOpen(false)}>
            CONTACT
          </a>
        </li>
      </ul>

      {/* Contact button — Desktop only */}
      <a href="#footer" className="btn btn--outline-light btn--sm navbar__contact-btn">
        CONTACT
      </a>

      {/* Hamburger — mobile only dengan Ikon SVG agar PASTI terlihat jelas */}
      <button
        className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--active' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        {!menuOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        )}
      </button>
    </nav>
  );
}
