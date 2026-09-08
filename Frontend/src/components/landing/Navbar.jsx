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

  const navItems = [
    { label: 'Home', path: '/#home' },
    { label: 'About', path: '/#about' },
    { label: 'Menu', path: '/#menu' },
    { label: 'Gallery', path: '/#gallery' },
    { label: 'Events', path: '/#events' },
    { label: 'Reservation', path: '/reservation' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      {/* Logo */}
      <div className="navbar__logo">
        <a href="/">
          <img src="/assets/images/logo-ebony.png" alt="EBONY" className="navbar__logo-img" />
        </a>
      </div>

      {/* Menu links */}
      <ul className={`navbar__menu ${menuOpen ? 'navbar__menu--open' : ''}`}>
        {navItems.map((item) => (
          <li key={item.label}>
            <a
              href={item.path}
              onClick={() => setMenuOpen(false)}
            >
              {item.label.toUpperCase()}
            </a>
          </li>
        ))}
      </ul>

      {/* Contact button */}
      <a href="#footer" className="btn btn--outline-light btn--sm">
        CONTACT
      </a>

      {/* Hamburger — mobile only */}
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
