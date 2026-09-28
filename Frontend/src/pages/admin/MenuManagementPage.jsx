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
  const [isPromoChecked, setIsPromoChecked] = useState(false);

  const fetchData = () => {
    getAdminMenus().then(data => setMenus(Array.isArray(data) ? data : [])).catch(() => setMenus([]));
    getAdminEvents().then(data => setEvents(Array.isArray(data) ? data : [])).catch(() => setEvents([]));
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    fd.set('is_promo', isPromoChecked ? '1' : '0');

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
      <div className="page-header">
        <div>
          <span className="page-label">MANAGEMENT</span>
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">Add, edit, or adjust the status of our culinary offerings.</p>
        </div>
        <button className="btn btn--primary" onClick={() => { setEditItem(null); setIsPromoChecked(false); setShowMenuModal(true); }}>
          + Add New
        </button>
      </div>

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
            {soldOutCount > 0 ? `AI Chatbot mendeteksi ${soldOutCount} menu sedang HABIS` : 'AI Chatbot: Semua menu tersedia'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
            {soldOutCount > 0 ? `Menu habis: ${soldOutNames.join(', ')}.` : 'Semua menu sinkron secara real-time.'}
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
          <div key={menu.id} style={{ position: 'relative' }}>
            {(menu.is_promo === 1 || menu.is_promo === true) && (
              <span style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: '#d4af37',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '4px 8px',
                borderRadius: '4px',
                zIndex: 5
              }}>PROMO ACTIVE</span>
            )}
            <MenuAdminCard
              menu={menu}
              onToggle={() => handleToggle(menu.id, menu.is_available)}
              onEdit={() => { 
                setEditItem(menu); 
                setIsPromoChecked(menu.is_promo === 1 || menu.is_promo === true); 
                setShowMenuModal(true); 
              }}
              onDelete={() => handleDeleteMenu(menu.id)}
            />
          </div>
        ))}
      </div>

      <hr className="divider divider--section" style={{ marginTop: '64px', marginBottom: '32px' }} />
      <div className="events-admin-section">
        <div className="events-admin-section__header">
          <h2 className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 32 }}>Upcoming Events</h2>
          <button className="btn btn--outline-dark" onClick={() => { setEditItem(null); setShowEventModal(true); }}>
            + Add New Event
          </button>
        </div>

        {events.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '8px', color: 'var(--color-muted)' }}>
            No upcoming events.
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

      {showMenuModal && (
        <Modal title={editItem ? 'Edit Menu' : 'Add New Menu'} onClose={() => setShowMenuModal(false)}>
          <div style={{ padding: '10px 0 20px', textAlign: 'left' }}>
            {/* KOREKSI UTAMA: encType="multipart/form-data" ditambahkan agar gambar mau terkirim */}
            <form className="admin-form" onSubmit={handleMenuSubmit} encType="multipart/form-data">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Menu Name *</label>
                <input type="text" name="name" className="form-input" defaultValue={editItem?.name || ''} placeholder="e.g. Pan-Seared Scallops" required />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select name="category" className="form-input" defaultValue={editItem?.category || ''} required>
                    <option value="">-- Select Category --</option>
                    {CATEGORIES.filter(c => c !== 'All Items').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (Rp) *</label>
                  <input type="number" name="price" className="form-input" defaultValue={editItem?.price || ''} placeholder="e.g. 85000" required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Description *</label>
                <textarea name="description" className="form-input" style={{ height: '70px', resize: 'none' }} defaultValue={editItem?.description || ''} placeholder="Describe ingredients..." required></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Menu Image {editItem ? '(Leave blank to keep current)' : '*'}</label>
                <input type="file" name="image" className="form-input" accept="image/*" required={!editItem} />
              </div>

              <div style={{ background: '#fff9f0', padding: '14px', borderRadius: '8px', border: '1px dashed #d4af37', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="is_promo_checkbox" 
                    checked={isPromoChecked} 
                    onChange={(e) => setIsPromoChecked(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="is_promo_checkbox" style={{ fontWeight: 700, color: '#1a1212', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Tampilkan Menu Ini Sebagai Banner Promo Customer 🌟
                  </label>
                </div>
                {isPromoChecked && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '12px', marginTop: '12px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Promo Category Label</label>
                      <input type="text" name="promo_badge" className="form-input" style={{ padding: '6px 10px', fontSize: '0.8rem' }} defaultValue={editItem?.promo_badge || 'MENU PROMOTION'} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Promotion Tagline (Gold Text)</label>
                      <input type="text" name="promo_tagline" className="form-input" style={{ padding: '6px 10px', fontSize: '0.8rem' }} defaultValue={editItem?.promo_tagline || 'ENJOY 50% OFF'} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Promotion Subtext</label>
                      <input type="text" name="promo_subtext" className="form-input" style={{ padding: '6px 10px', fontSize: '0.8rem' }} defaultValue={editItem?.promo_subtext || 'A special offer for selected Ebony favorites.'} />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <button type="button" className="btn btn--outline-dark" onClick={() => setShowMenuModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editItem ? 'Update Menu' : 'Create Menu'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {showEventModal && (
        <Modal title={editItem ? 'Edit Event' : 'Add New Event'} onClose={() => setShowEventModal(false)}>
          <div style={{ padding: '10px 0 20px', textAlign: 'left' }}>
            <form className="admin-form" onSubmit={handleEventSubmit} encType="multipart/form-data">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Event Title *</label>
                <input type="text" name="title" className="form-input" defaultValue={editItem?.title || ''} placeholder="e.g. Jazz Night Symphony" required />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" name="date" className="form-input" defaultValue={editItem?.date ? editItem.date.split('T') : ''} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input type="time" name="time" className="form-input" defaultValue={editItem?.date ? editItem.date.split('T')?.substring(0, 5) : ''} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Description *</label>
                <textarea name="description" className="form-input" style={{ height: '70px', resize: 'none' }} defaultValue={editItem?.description || ''} placeholder="Describe event details..." required></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Event Banner {editItem ? '(Leave blank to keep current)' : '*'}</label>
                <input type="file" name="image" className="form-input" accept="image/*" required={!editItem} />
              </div>

              <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <button type="button" className="btn btn--outline-dark" onClick={() => setShowEventModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editItem ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
