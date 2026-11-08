import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import MenuAdminCard from '../../components/admin/MenuAdminCard';
import Modal from '../../components/ui/Modal';
import {
  getAdminMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleMenuStatus,
  toggleMenuFeatured,
} from '../../api/adminApi';
import {
  getSiteSettings,
  updateSiteSettings,
  getLocalSiteSettings,
} from '../../services/siteSettings';

const CATEGORIES = ['All Items', 'Starters', 'Mains', 'Desserts', 'Beverages'];

export default function MenuManagementPage() {
  const [menus, setMenus] = useState([]);
  const [activeTab, setActiveTab] = useState('All Items');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isPromoChecked, setIsPromoChecked] = useState(false);
  const [isFeaturedChecked, setIsFeaturedChecked] = useState(false);

  // Menu PDF URL State
  const [pdfUrl, setPdfUrl] = useState(() => getLocalSiteSettings().menu_pdf_url || '');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState('');
  const [pdfError, setPdfError] = useState('');

  const fetchMenus = () => {
    getAdminMenus()
      .then((data) => setMenus(Array.isArray(data) ? data : []))
      .catch(() => setMenus([]));
    getSiteSettings().then((s) => {
      if (s?.menu_pdf_url) setPdfUrl(s.menu_pdf_url);
    });
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const soldOutCount = menus.filter((m) => !m.is_available).length;
  const soldOutNames = menus.filter((m) => !m.is_available).map((m) => m.name);
  const featuredCount = menus.filter((m) => m.is_featured === 1 || m.is_featured === true).length;

  const filteredMenus =
    activeTab === 'All Items' ? menus : menus.filter((m) => m.category === activeTab);

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleMenuStatus(id, !currentStatus);
      setMenus((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_available: !currentStatus } : m))
      );
    } catch {
      alert('Gagal mengubah status menu.');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await toggleMenuFeatured(id);
      const newStatus = res?.is_featured ?? !menus.find((m) => m.id === id)?.is_featured;
      setMenus((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_featured: newStatus } : m))
      );
    } catch {
      alert('Gagal mengubah status Best Seller menu.');
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Yakin hapus menu ini?')) return;
    try {
      await deleteMenu(id);
      setMenus((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert('Gagal menghapus menu.');
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const fd = new FormData(e.target);
    fd.set('is_promo', isPromoChecked ? '1' : '0');
    fd.set('is_featured', isFeaturedChecked ? '1' : '0');

    try {
      if (editItem) {
        await updateMenu(editItem.id, fd);
      } else {
        await createMenu(fd);
      }
      setShowMenuModal(false);
      fetchMenus();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan menu.');
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
          <button
            className="btn btn--primary"
            onClick={() => {
              setEditItem(null);
              setIsPromoChecked(false);
              setIsFeaturedChecked(false);
              setShowMenuModal(true);
            }}
          >
            + Add New
          </button>
        </div>
      </div>

      {/* Banner Notifikasi Best Seller (Our Favorites) */}
      <div
        style={{
          margin: '0 0 14px',
          padding: '12px 18px',
          borderRadius: '10px',
          backgroundColor: '#fbf8f2',
          border: '1px solid #e9dfcf',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>⭐</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#92400e' }}>
              Menu Best Seller (Beranda): {featuredCount} Terpilih (Maksimal 6 Tampil di 'Our Favorites')
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#78350f' }}>
              Klik tombol "⭐ Set Best Seller" pada kartu menu di bawah untuk menampilkan atau menyembunyikan menu dari halaman depan.
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          margin: '0 0 20px',
          padding: '12px 18px',
          borderRadius: '10px',
          backgroundColor: soldOutCount > 0 ? '#fff7ed' : '#f0fdf4',
          border: `1px solid ${soldOutCount > 0 ? '#fdba74' : '#86efac'}`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>{soldOutCount > 0 ? '🤖⚠️' : '🤖✅'}</span>
        <div>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: '0.85rem',
              color: soldOutCount > 0 ? '#c2410c' : '#15803d',
            }}
          >
            {soldOutCount > 0
              ? `AI Chatbot mendeteksi ${soldOutCount} menu sedang HABIS`
              : 'AI Chatbot: Semua menu tersedia'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
            {soldOutCount > 0
              ? `Menu habis: ${soldOutNames.join(', ')}.`
              : 'Semua menu sinkron secara real-time.'}
          </p>
        </div>
      </div>

      <div className="tab-filter">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`tab-filter__btn ${activeTab === cat ? 'tab-filter__btn--active' : ''}`}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="menu-admin-grid">
        {filteredMenus.map((menu) => (
          <div key={menu.id} style={{ position: 'relative' }}>
            {(menu.is_promo === 1 || menu.is_promo === true) && (
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: '#d4af37',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  zIndex: 5,
                }}
              >
                PROMO ACTIVE
              </span>
            )}
            <MenuAdminCard
              menu={menu}
              onToggle={() => handleToggle(menu.id, menu.is_available)}
              onToggleFeatured={() => handleToggleFeatured(menu.id)}
              onEdit={() => {
                setEditItem(menu);
                setIsPromoChecked(menu.is_promo === 1 || menu.is_promo === true);
                setIsFeaturedChecked(menu.is_featured === 1 || menu.is_featured === true);
                setShowMenuModal(true);
              }}
              onDelete={() => handleDeleteMenu(menu.id)}
            />
          </div>
        ))}
        {filteredMenus.length === 0 && (
          <p style={{ color: 'var(--color-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
            Belum ada menu pada kategori ini.
          </p>
        )}
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
              <div
                className="alert alert--success"
                style={{
                  marginBottom: '16px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              >
                ✓ {pdfSuccess}
              </div>
            )}

            {pdfError && (
              <div
                className="alert alert--danger"
                style={{
                  marginBottom: '16px',
                  backgroundColor: 'var(--color-danger)',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              >
                ✕ {pdfError}
              </div>
            )}

            <form onSubmit={handlePdfSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Tautan / URL Menu PDF
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://drive.google.com/... atau link langsung file .pdf"
                  required
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '24px',
                }}
              >
                {pdfUrl ? (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: 'var(--color-accent)', textDecoration: 'underline' }}
                  >
                    ↗ Tes Buka Link PDF
                  </a>
                ) : <span />}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn--outline-dark"
                    onClick={() => setShowPdfModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary"
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

      {/* Modal Menu Form */}
      {showMenuModal && (
        <Modal
          isOpen={showMenuModal}
          onClose={() => setShowMenuModal(false)}
          title={editItem ? 'Edit Culinary Item' : 'Create Culinary Item'}
        >
          <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
            <form onSubmit={handleMenuSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Dish Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  defaultValue={editItem?.name || ''}
                  placeholder="e.g. Wagyu Beef Tenderloin"
                  required
                />
              </div>

              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    className="form-input"
                    defaultValue={editItem?.category || 'Mains'}
                    required
                  >
                    <option value="Starters">Starters</option>
                    <option value="Mains">Mains</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (IDR) *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    defaultValue={editItem?.price ? parseInt(editItem.price) : ''}
                    placeholder="e.g. 150000"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-input"
                  style={{ height: '70px', resize: 'none' }}
                  defaultValue={editItem?.description || ''}
                  placeholder="Describe ingredients and flavors..."
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">
                  Dish Image {editItem ? '(Leave blank to keep current)' : '*'}
                </label>
                <input
                  type="file"
                  name="image"
                  className="form-input"
                  accept="image/*"
                  required={!editItem}
                />
              </div>

              {/* Centang Best Seller (Our Favorites) */}
              <div
                style={{
                  background: '#fbf8f2',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #e9dfcf',
                  marginBottom: '16px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#92400e',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isFeaturedChecked}
                    onChange={(e) => setIsFeaturedChecked(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#d97706' }}
                  />
                  ⭐ Jadikan Menu Best Seller (Tampil di Halaman Beranda "Our Favorites")
                </label>
                <p style={{ margin: '4px 0 0 24px', fontSize: '11px', color: '#78350f' }}>
                  Maksimal 6 menu best seller yang akan muncul di section "Our Favorites" halaman depan.
                </p>
              </div>

              {/* Centang Promo */}
              <div
                style={{
                  background: '#fafafa',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isPromoChecked}
                    onChange={(e) => setIsPromoChecked(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#c9a96e' }}
                  />
                  Aktifkan Promo untuk Menu ini
                </label>

                {isPromoChecked && (
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      paddingTop: '12px',
                      borderTop: '1px dashed #cbd5e1',
                    }}
                  >
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '11px' }}>
                        Badge Label Promo
                      </label>
                      <input
                        type="text"
                        name="promo_tag"
                        className="form-input"
                        defaultValue={editItem?.promo_tag || ''}
                        placeholder="e.g. SPECIAL 20% / CHEF PICK"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '11px' }}>
                        Harga Asal (Sebelum Diskon)
                      </label>
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

              <div
                className="form-actions"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '16px',
                }}
              >
                <button
                  type="button"
                  className="btn btn--outline-dark"
                  onClick={() => setShowMenuModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving...' : editItem ? 'Update Dish' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
