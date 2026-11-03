import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import MenuAdminCard from '../../components/admin/MenuAdminCard';
import EventAdminCard from '../../components/admin/EventAdminCard';
import Modal from '../../components/ui/Modal';
import {
  getAdminMenus, createMenu, updateMenu, deleteMenu, toggleMenuStatus,
  getAdminEvents, createEvent, updateEvent, deleteEvent,
} from '../../api/adminApi';
import {
  getSiteSettings, updateSiteSettings, getLocalSiteSettings,
} from '../../services/siteSettings';

const CATEGORIES = ['All Items', 'Starters', 'Mains', 'Desserts', 'Beverages'];

export default function MenuManagementPage() {
  const [menus, setMenus] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('All Items');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isPromoChecked, setIsPromoChecked] = useState(false);

  // Menu PDF URL State
  const [pdfUrl, setPdfUrl] = useState(() => getLocalSiteSettings().menu_pdf_url || '');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState('');
  const [pdfError, setPdfError] = useState('');

  const fetchData = () => {
    getAdminMenus().then(data => setMenus(Array.isArray(data) ? data : [])).catch(() => setMenus([]));
    getAdminEvents().then(data => setEvents(Array.isArray(data) ? data : [])).catch(() => setEvents([]));
    getSiteSettings().then(s => {
      if (s?.menu_pdf_url) setPdfUrl(s.menu_pdf_url);
    });
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
    const hasTime = !!timeVal;
    if (dateVal && timeVal) {
      fd.set('date', `${dateVal}T${timeVal}`);
    } else if (dateVal) {
      // Acara tanpa jam pasti — jam dibebaskan saat reservasi
      fd.set('date', `${dateVal}T00:00`);
    }
    fd.set('has_time', hasTime ? '1' : '0');
    fd.delete('time');
    // end_date dikirim langsung sebagai datetime-local (boleh kosong)
    if (!fd.get('end_date')) fd.set('end_date', '');

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

  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    setPdfLoading(true);
    setPdfSuccess('');
    setPdfError('');

    try {
      await updateSiteSettings({ menu_pdf_url: pdfUrl });
      setPdfSuccess('Tautan Menu PDF berhasil disimpan!');
      setTimeout(() => {
        setShowPdfModal(false);
        setPdfSuccess('');
      }, 1500);
    } catch {
      setPdfError('Gagal menyimpan link menu PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <span className="page-label">MANAGEMENT</span>
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">Tambah, edit menu restoran, dan atur tautan katalog PDF.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn--outline-dark"
            onClick={() => {
              setPdfSuccess('');
              setPdfError('');
              setShowPdfModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontWeight: 600 }}
          >
            <span>📄</span> Link Menu PDF
          </button>
          <button className="btn btn--primary" onClick={() => { setEditItem(null); setIsPromoChecked(false); setShowMenuModal(true); }}>
            + Add New
          </button>
        </div>
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

      <div className="page-header" style={{ marginTop: '48px' }}>
        <div>
          <span className="page-label">EXPERIENCE</span>
          <h1 className="page-title">Events Management</h1>
          <p className="page-subtitle">Schedule dining experiences and special sessions.</p>
        </div>
        <button className="btn btn--primary" onClick={() => { setEditItem(null); setShowEventModal(true); }}>
          + Add Event
        </button>
      </div>

      <div className="menu-admin-grid">
        {events.map(event => (
          <EventAdminCard
            key={event.id}
            event={event}
            onEdit={() => { setEditItem(event); setShowEventModal(true); }}
            onDelete={() => handleDeleteEvent(event.id)}
          />
        ))}
      </div>

      {/* Modal Kelola Link PDF Menu */}
      {showPdfModal && (
        <Modal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          title="Kelola Link Menu PDF (Katalog Lengkap)"
        >
          <div style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: '13px', lineHeight: '1.6', margin: '0 0 16px' }}>
              Tautan ini otomatis digunakan pada tombol <strong>"VIEW FULL MENU"</strong> dan <strong>"DOWNLOAD FULL MENU (PDF)"</strong> di halaman utama agar pelanggan dapat melihat atau mengunduh katalog PDF restoran Ebony.
            </p>

            {pdfSuccess && (
              <div className="alert alert--success" style={{ marginBottom: '16px', backgroundColor: '#10b981', color: '#fff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}>
                ✓ {pdfSuccess}
              </div>
            )}

            {pdfError && (
              <div className="alert alert--danger" style={{ marginBottom: '16px', backgroundColor: 'var(--color-danger)', color: '#fff', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}>
                ✕ {pdfError}
              </div>
            )}

            <form onSubmit={handlePdfSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Tautan / URL Menu PDF</label>
                <input
                  type="url"
                  className="form-input"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://drive.google.com/... atau link langsung file .pdf"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                {pdfUrl ? (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn--outline-dark btn--sm"
                    style={{ textDecoration: 'none' }}
                  >
                    🔗 Buka &amp; Tes Link PDF
                  </a>
                ) : <span />}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn--outline-dark btn--sm"
                    onClick={() => setShowPdfModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary btn--sm"
                    disabled={pdfLoading}
                  >
                    {pdfLoading ? 'Menyimpan...' : 'Simpan Link PDF'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal Menu */}
      {showMenuModal && (
        <Modal
          isOpen={showMenuModal}
          onClose={() => setShowMenuModal(false)}
          title={editItem ? 'Edit Culinary Offering' : 'New Culinary Offering'}
        >
          <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
            <form onSubmit={handleMenuSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Dish Name *</label>
                <input type="text" name="name" className="form-input" defaultValue={editItem?.name || ''} placeholder="e.g. Wagyu Ribeye" required />
              </div>

              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select name="category" className="form-input" defaultValue={editItem?.category || 'Starters'} required>
                    {CATEGORIES.filter(c => c !== 'All Items').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (IDR) *</label>
                  <input type="number" name="price" className="form-input" defaultValue={editItem?.price ? parseInt(editItem.price) : ''} placeholder="e.g. 150000" required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Description *</label>
                <textarea name="description" className="form-input" style={{ height: '70px', resize: 'none' }} defaultValue={editItem?.description || ''} placeholder="Describe ingredients, flavor notes..." required></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Dish Photo {editItem ? '(Leave blank to keep current)' : '*'}</label>
                <input type="file" name="image" className="form-input" accept="image/*" required={!editItem} />
              </div>

              {/* Tagging AI & Kategori Khusus */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Konfigurasi AI Dining Concierge &amp; Badge</span>
                
                <div className="form-row" style={{ marginTop: '12px', marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Badge Label (Opsional)</label>
                    <input type="text" name="badge" className="form-input" defaultValue={editItem?.badge || ''} placeholder="e.g. SIGNATURE DISH" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tingkat Pedas (Spicy Level)</label>
                    <select name="spicy_level" className="form-input" defaultValue={editItem?.spicy_level || 'none'}>
                      <option value="none">Tidak Pedas (None)</option>
                      <option value="mild">Sedang (Mild)</option>
                      <option value="spicy">Pedas (Spicy)</option>
                      <option value="extra_spicy">Sangat Pedas (Extra Spicy)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Dietary Tags (Pisahkan koma)</label>
                    <input 
                      type="text" 
                      name="dietary_tags" 
                      className="form-input" 
                      defaultValue={Array.isArray(editItem?.dietary_tags) ? editItem.dietary_tags.join(', ') : (editItem?.dietary_tags || '')} 
                      placeholder="e.g. vegetarian, halal, gluten-free" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alergen (Allergens - Pisahkan koma)</label>
                    <input 
                      type="text" 
                      name="allergens" 
                      className="form-input" 
                      defaultValue={Array.isArray(editItem?.allergens) ? editItem.allergens.join(', ') : (editItem?.allergens || '')} 
                      placeholder="e.g. peanut, dairy, seafood" 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cocok untuk Momen (Occasion Tags)</label>
                  <input 
                    type="text" 
                    name="occasion_tags" 
                    className="form-input" 
                    defaultValue={Array.isArray(editItem?.occasion_tags) ? editItem.occasion_tags.join(', ') : (editItem?.occasion_tags || '')} 
                    placeholder="e.g. romantic, family gathering, casual" 
                  />
                </div>
              </div>

              {/* Setelan Promo Baru */}
              <div style={{ background: '#fdfbf7', padding: '16px', borderRadius: '8px', border: '1px solid #e7dfd5', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: '#1a1a1a', marginBottom: isPromoChecked ? '12px' : 0 }}>
                  <input
                    type="checkbox"
                    checked={isPromoChecked}
                    onChange={(e) => setIsPromoChecked(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#d4af37' }}
                  />
                  🌟 Jadikan Menu Ini Sebagai Menu Promo (Tampil di Banner Landing Page)
                </label>

                {isPromoChecked && (
                  <div className="form-row" style={{ marginTop: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Teks Badge Promo</label>
                      <input
                        type="text"
                        name="promo_badge_text"
                        className="form-input"
                        defaultValue={editItem?.promo_badge_text || 'PROMO SPESIAL'}
                        placeholder="e.g. HEMAT 20% / BEST DEAL"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Harga Asli (Coret) IDR</label>
                      <input
                        type="number"
                        name="original_price"
                        className="form-input"
                        defaultValue={editItem?.original_price ? parseInt(editItem.original_price) : ''}
                        placeholder="e.g. 175000"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <button type="button" className="btn btn--outline-dark" onClick={() => setShowMenuModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editItem ? 'Update Dish' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal Event */}
      {showEventModal && (
        <Modal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          title={editItem ? 'Edit Special Event' : 'Create Special Event'}
        >
          <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
            <form onSubmit={handleEventSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Event Title *</label>
                <input type="text" name="title" className="form-input" defaultValue={editItem?.title || ''} placeholder="e.g. Wine & Dine Night" required />
              </div>

              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" name="date" className="form-input" defaultValue={editItem?.date ? editItem.date.split('T')[0] : ''} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time <span style={{ fontWeight: 400 }}>(kosongkan jika tanpa jam pasti)</span></label>
                  <input type="time" name="time" className="form-input" defaultValue={editItem?.has_time === false ? '' : (editItem?.date ? editItem.date.split('T')[1]?.substring(0, 5) : '')} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Selesai <span style={{ fontWeight: 400 }}>(opsional — batas jam reservasi)</span></label>
                <input
                  type="datetime-local"
                  name="end_date"
                  className="form-input"
                  defaultValue={editItem?.end_date ? String(editItem.end_date).substring(0, 16) : ''}
                />
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
