import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import GalleryAdminCard from '../../components/admin/GalleryAdminCard';
import Modal from '../../components/ui/Modal';
import {
  getAdminGalleries,
  createGallery,
  updateGallery,
  deleteGallery,
  toggleGalleryStatus,
} from '../../api/adminApi';

export default function GalleryManagementPage() {
  const [galleries, setGalleries] = useState([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editGalleryItem, setEditGalleryItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [galleryActiveChecked, setGalleryActiveChecked] = useState(true);

  const fetchGalleries = () => {
    getAdminGalleries()
      .then((data) => setGalleries(Array.isArray(data) ? data : []))
      .catch(() => setGalleries([]));
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleToggleGallery = async (id, currentStatus) => {
    try {
      await toggleGalleryStatus(id);
      setGalleries((prev) =>
        prev.map((g) => (g.id === id ? { ...g, is_active: !currentStatus } : g))
      );
    } catch {
      alert('Gagal mengubah status foto galeri.');
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Yakin ingin menghapus foto galeri ini?')) return;
    try {
      await deleteGallery(id);
      setGalleries((prev) => prev.filter((g) => g.id !== id));
    } catch {
      alert('Gagal menghapus foto galeri.');
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const fd = new FormData(e.target);
    fd.set('is_active', galleryActiveChecked ? '1' : '0');

    try {
      if (editGalleryItem) {
        await updateGallery(editGalleryItem.id, fd);
      } else {
        await createGallery(fd);
      }
      setShowGalleryModal(false);
      fetchGalleries();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan foto galeri.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <span className="page-label">VISUAL SHOWCASE</span>
          <h1 className="page-title">Gallery Management</h1>
          <p className="page-subtitle">
            Kelola foto interior, resto, dan suasana yang tampil pada section Galeri halaman depan.
          </p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => {
            setEditGalleryItem(null);
            setGalleryActiveChecked(true);
            setShowGalleryModal(true);
          }}
        >
          + Add Photo
        </button>
      </div>

      <div className="menu-admin-grid">
        {galleries.map((gallery) => (
          <GalleryAdminCard
            key={gallery.id}
            gallery={gallery}
            onToggle={() => handleToggleGallery(gallery.id, gallery.is_active)}
            onEdit={() => {
              setEditGalleryItem(gallery);
              setGalleryActiveChecked(gallery.is_active === true || gallery.is_active === 1);
              setShowGalleryModal(true);
            }}
            onDelete={() => handleDeleteGallery(gallery.id)}
          />
        ))}
        {galleries.length === 0 && (
          <p
            style={{
              color: 'var(--color-muted)',
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px 0',
            }}
          >
            Belum ada foto galeri. Klik "+ Add Photo" untuk menambahkan foto pertama.
          </p>
        )}
      </div>

      {/* Modal Gallery */}
      {showGalleryModal && (
        <Modal
          isOpen={showGalleryModal}
          onClose={() => setShowGalleryModal(false)}
          title={editGalleryItem ? 'Edit Foto Galeri' : 'Tambah Foto Galeri Baru'}
        >
          <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
            <form onSubmit={handleGallerySubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Judul / Area Spot (Opsional)</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  defaultValue={editGalleryItem?.title || ''}
                  placeholder="e.g. Interior Dining Area / Bar Area"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Keterangan / Alt Text</label>
                <input
                  type="text"
                  name="caption"
                  className="form-input"
                  defaultValue={editGalleryItem?.caption || ''}
                  placeholder="e.g. Suasana malam di area bar Ebony Cafe"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">
                  Unggah File Foto {editGalleryItem ? '(Kosongkan jika tidak ingin mengganti)' : '*'}
                </label>
                <input
                  type="file"
                  name="image"
                  className="form-input"
                  accept="image/*"
                  required={!editGalleryItem}
                />
              </div>

              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Nomor Urutan (Order)</label>
                  <input
                    type="number"
                    name="order"
                    className="form-input"
                    defaultValue={editGalleryItem?.order ?? galleries.length + 1}
                    min="1"
                  />
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
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
                    checked={galleryActiveChecked}
                    onChange={(e) => setGalleryActiveChecked(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#c9a96e' }}
                  />
                  Tampilkan di Galeri Halaman Beranda
                </label>
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
                  onClick={() => setShowGalleryModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn--primary" disabled={formLoading}>
                  {formLoading ? 'Menyimpan...' : editGalleryItem ? 'Perbarui Foto' : 'Simpan Foto'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

