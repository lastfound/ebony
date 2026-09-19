import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import MenuAdminCard from '../../components/admin/MenuAdminCard';
import EventAdminCard from '../../components/admin/EventAdminCard';
import Modal from '../../components/ui/Modal';
import {
  getAdminMenus, createMenu, updateMenu, deleteMenu, toggleMenuStatus,
  getAdminEvents, createEvent, updateEvent, deleteEvent,
} from '../../api/adminApi';

const CATEGORIES = ['All Items', 'Starters', 'Mains', 'Desserts', 'Beverages'];

export default function MenuManagementPage() {
  const [menus, setMenus] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('All Items');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = () => {
    getAdminMenus().then(data => setMenus(Array.isArray(data) ? data : [])).catch(() => setMenus([]));
    getAdminEvents().then(data => setEvents(Array.isArray(data) ? data : [])).catch(() => setEvents([]));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hitung menu yang sedang habis untuk ditampilkan di banner AI
  const soldOutCount = menus.filter(m => !m.is_available).length;
  const soldOutNames = menus.filter(m => !m.is_available).map(m => m.name);

  const filteredMenus = activeTab === 'All Items'
    ? menus
    : menus.filter(m => m.category === activeTab);

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleMenuStatus(id, !currentStatus);
      setMenus(prev => prev.map(m =>
        m.id === id ? { ...m, is_available: !currentStatus } : m
      ));
    } catch {
      alert('Gagal mengubah status menu.');
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Yakin hapus menu ini?')) return;
    try {
      await deleteMenu(id);
      setMenus(prev => prev.filter(m => m.id !== id));
    } catch {
      alert('Gagal menghapus menu.');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Yakin hapus event ini?')) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch {
      alert('Gagal menghapus event.');
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const fd = new FormData(e.target);

    try {
      if (editItem) {
        await updateMenu(editItem.id, fd);
      } else {
        await createMenu(fd);
      }
      setShowMenuModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan menu.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const fd = new FormData(e.target);

    // Combine date + time into datetime
    const dateVal = fd.get('date');
    const timeVal = fd.get('time');
    if (dateVal && timeVal) {
      fd.set('date', `${dateVal}T${timeVal}`);
    }
    fd.delete('time');

    try {
      if (editItem) {
        await updateEvent(editItem.id, fd);
      } else {
        await createEvent(fd);
      }
      setShowEventModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan event.');
    } finally {
      setFormLoading(false);
    }
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

      {/* Banner AI Integration */}
      <div style={{
        margin: '0 0 20px',
        padding: '12px 18px',
        borderRadius: '10px',
        backgroundColor: soldOutCount > 0 ? '#fff7ed' : '#f0fdf4',
        border: `1px solid ${soldOutCount > 0 ? '#fdba74' : '#86efac'}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <span style={{ fontSize: '1.2rem' }}>{soldOutCount > 0 ? '🤖⚠️' : '🤖✅'}</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: soldOutCount > 0 ? '#c2410c' : '#15803d' }}>
            {soldOutCount > 0
              ? `AI Chatbot mendeteksi ${soldOutCount} menu sedang HABIS`
              : 'AI Chatbot: Semua menu tersedia — tidak ada yang habis'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
            {soldOutCount > 0
              ? `Menu habis: ${soldOutNames.join(', ')}. Chatbot akan otomatis memberitahu tamu jika menanyakan menu ini.`
              : 'Tamu yang chat dengan AI akan mendapat info menu terkini secara real-time.'}
          </p>
        </div>
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
                onDelete={() => handleDeleteEvent(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Menu */}
      {showMenuModal && (
        <Modal title={editItem ? 'Edit Menu' : 'Add New Menu'} onClose={() => setShowMenuModal(false)}>
          <div style={{ padding: '10px 0 20px', textAlign: 'left' }}>
            <form className="admin-form" onSubmit={handleMenuSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Menu Name *</label>
                <input type="text" name="name" className="form-input" defaultValue={editItem?.name || ''} placeholder="e.g. Pan-Seared Scallops" required />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select name="category" className="form-input" defaultValue={editItem?.category || ''} required>
                    <option value="">-- Select Category --</option>
                    <option value="Starters">Starters</option>
                    <option value="Mains">Mains</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (Rp) *</label>
                  <input type="number" name="price" className="form-input" defaultValue={editItem?.price || ''} placeholder="e.g. 150000" required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Upload Image</label>
                <input type="file" name="image" className="form-input" accept="image/*" />
                {editItem?.image_url && <small style={{ color: 'var(--color-muted)', display: 'block', marginTop: '4px' }}>Saat ini ada gambar tersimpan.</small>}
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input form-textarea" rows="3" defaultValue={editItem?.description || ''} placeholder="Short description about the dish..."></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--outline-dark" onClick={() => setShowMenuModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Menu'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal Event */}
      {showEventModal && (
        <Modal title={editItem ? 'Edit Event' : 'Add New Event'} onClose={() => setShowEventModal(false)}>
          <div style={{ padding: '10px 0 20px', textAlign: 'left' }}>
            <form className="admin-form" onSubmit={handleEventSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Event Title *</label>
                <input type="text" name="title" className="form-input" defaultValue={editItem?.title || ''} placeholder="e.g. Live Jazz Evening" required />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" name="date" className="form-input" defaultValue={editItem?.date ? editItem.date.split('T')[0] : ''} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input type="time" name="time" className="form-input" defaultValue={editItem?.date ? editItem.date.split('T')[1]?.substring(0,5) : ''} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Upload Cover Image</label>
                <input type="file" name="image" className="form-input" accept="image/*" />
                {editItem?.image_url && <small style={{ color: 'var(--color-muted)', display: 'block', marginTop: '4px' }}>Saat ini ada cover tersimpan.</small>}
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Description / Details</label>
                <textarea name="description" className="form-input form-textarea" rows="4" defaultValue={editItem?.description || ''} placeholder="Information about the event..."></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--outline-dark" onClick={() => setShowEventModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
