import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { adminLogout } from '../../api/adminApi';

const navItems = [
  { to: '/admin/dashboard', icon: '⊞', label: 'DASHBOARD' },
  { to: '/admin/reservations', icon: '📅', label: 'RESERVATIONS' },
  { to: '/admin/menu-management', icon: '✕', label: 'MENU MANAGEMENT' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch {
      // silently fail - still logout locally
    }
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-logo" style={{ marginBottom: '12px' }}>
          <img src="/assets/images/logo-ebony.png" alt="Ebony Cafe" style={{ height: '36px', width: 'auto', display: 'block' }} />
        </div>
        <span className="sidebar__brand-name">EBONY CAFE &<br />GALLERY</span>
        <span className="sidebar__brand-subtitle">Admin Portal</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((item) => (
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
        <NavLink 
          to="/admin/settings" 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="sidebar__icon">⚙</span>
          <span>SETTINGS</span>
        </NavLink>
        <a href="#" className="sidebar__link">
          <span className="sidebar__icon">ℹ</span>
          <span>HELP CENTER</span>
        </a>
        <button
          onClick={handleLogout}
          className="sidebar__link sidebar__link--logout"
        >
          <span className="sidebar__icon">→</span>
          <span>LOGOUT</span>
        </button>
      </div>

      {/* Admin Profile */}
      <div className="sidebar__profile">
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, color: 'var(--color-muted)',
          flexShrink: 0,
        }}>
          {admin?.name ? admin.name.charAt(0).toUpperCase() : '👤'}
        </div>
        <div>
          <span className="sidebar__profile-name">{admin?.name || 'Ebony Admin'}</span>
          <span className="sidebar__profile-role">{admin?.role || 'MANAGER'}</span>
        </div>
      </div>
    </aside>
  );
}
