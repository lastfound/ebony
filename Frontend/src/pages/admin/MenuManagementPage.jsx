import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import MenuAdminCard from '../../components/admin/MenuAdminCard';
import EventAdminCard from '../../components/admin/EventAdminCard';
import Modal from '../../components/ui/Modal';

const CATEGORIES = ['All Items', 'Starters', 'Mains', 'Desserts', 'Beverages'];

const SAMPLE_MENUS = [
  { id: 1, name: 'Matcha Mille Crêpe', description: 'Twenty layers of delicate crêpes layered with Kyoto matcha cream.', price: 140000, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80', is_available: false },
  { id: 2, name: 'Truffle Arancini', description: 'Crispy risotto bites infused with black truffle, served over roasted garlic aioli.', price: 160000, category: 'Starters', image_url: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&q=80', is_available: true },
  { id: 3, name: 'Pan-Seared Scallops', description: 'Cauliflower purée, brown butter caper sauce, and crispy prosciutto crumbles.', price: 340000, category: 'Mains', image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80', is_available: true },
];

export default function MenuManagementPage() {
  const [menus, setMenus] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('All Items');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    // In a real application, fetch from APIs
    setMenus(SAMPLE_MENUS);
    setEvents([]);
  }, []);

  const filteredMenus = activeTab === 'All Items'
    ? menus
    : menus.filter(m => m.category === activeTab);

  const handleToggle = (id, currentStatus) => {
    setMenus(prev => prev.map(m =>
      m.id === id ? { ...m, is_available: !currentStatus } : m
    ));
  };

  const handleDeleteMenu = (id) => {
    if (!window.confirm('Yakin hapus menu ini?')) return;
    setMenus(prev => prev.filter(m => m.id !== id));
  };

  return (
    <AdminLayout>
      {/* SECTION A: MENU */}
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

      {/* SECTION B: EVENTS */}
      <hr className="divider divider--section" style={{ marginTop: '64px', marginBottom: '32px' }} />

      <div className="events-admin-section">
        <div className="events-admin-section__header">
          <h2 className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 32 }}>Upcoming Events</h2>
          <button className="btn btn--outline-dark" onClick={() => { setEditItem(null); setShowEventModal(true); }}>
            + Add New Event
          </button>
        </div>

        {events.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
            No upcoming events. Click "Add New Event" to create one.
          </div>
        ) : (
          <div className="events-admin-grid">
            {events.map(event => (
              <EventAdminCard
                key={event.id}
                event={event}
                onEdit={() => { setEditItem(event); setShowEventModal(true); }}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showMenuModal && (
        <Modal title={editItem ? 'Edit Menu' : 'Add New Menu'} onClose={() => setShowMenuModal(false)}>
          <div style={{ padding: '10px 0 20px', textAlign: 'left' }}>
            <form className="admin-form" onSubmit={(e) => { e.preventDefault(); setShowMenuModal(false); }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Menu Name *</label>
                <input type="text" className="form-input" defaultValue={editItem?.name || ''} placeholder="e.g. Pan-Seared Scallops" required />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" defaultValue={editItem?.category || ''} required>
                    <option value="">-- Select Category --</option>
                    <option value="Starters">Starters</option>
                    <option value="Mains">Mains</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (Rp) *</label>
                  <input type="number" className="form-input" defaultValue={editItem?.price || ''} placeholder="e.g. 150000" required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Upload Image</label>
                <input type="file" className="form-input" accept="image/*" />
                {editItem?.image_url && <small style={{ color: 'var(--color-muted)', display: 'block', marginTop: '4px' }}>Saat ini ada gambar tersimpan.</small>}
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Description</label>
                <textarea className="form-input form-textarea" rows="3" defaultValue={editItem?.description || ''} placeholder="Short description about the dish..."></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--outline-dark" onClick={() => setShowMenuModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">Save Menu</button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {showEventModal && (
        <Modal title={editItem ? 'Edit Event' : 'Add New Event'} onClose={() => setShowEventModal(false)}>
          <div style={{ padding: '10px 0 20px', textAlign: 'left' }}>
            <form className="admin-form" onSubmit={(e) => { e.preventDefault(); setShowEventModal(false); }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Event Title *</label>
                <input type="text" className="form-input" defaultValue={editItem?.title || ''} placeholder="e.g. Live Jazz Evening" required />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" defaultValue={editItem ? editItem.date.split('T')[0] : ''} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input type="time" className="form-input" defaultValue={editItem ? editItem.date.split('T')[1]?.substring(0,5) : ''} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Upload Cover Image</label>
                <input type="file" className="form-input" accept="image/*" />
                {editItem?.image_url && <small style={{ color: 'var(--color-muted)', display: 'block', marginTop: '4px' }}>Saat ini ada cover tersimpan.</small>}
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Description / Details</label>
                <textarea className="form-input form-textarea" rows="4" defaultValue={editItem?.description || ''} placeholder="Information about the event..."></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--outline-dark" onClick={() => setShowEventModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">Save Event</button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
