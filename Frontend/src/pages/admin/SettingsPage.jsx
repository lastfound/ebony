import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import Toggle from '../../components/ui/Toggle';
import { updateAdminProfile } from '../../api/adminApi';
import { useWebPush } from '../../hooks/useWebPush';
import {
  getSiteSettings,
  updateSiteSettings,
  DEFAULT_SITE_SETTINGS,
  getLocalSiteSettings,
} from '../../services/siteSettings';

function readInitialDarkMode() {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem('theme') === 'dark') return true;
  return document.body.classList.contains('dark-mode');
}

export default function SettingsPage() {
  const { admin, login } = useAuth();
  
  // Web Push Hook
  const { isSubscribed, loading: pushLoading, error: pushError, subscribe, unsubscribe } = useWebPush();
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(readInitialDarkMode);
  
  // Profile Form State
  const [username, setUsername] = useState(() => admin?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Site Content State (Main Page Image, Description & Menu PDF)
  const [siteForm, setSiteForm] = useState(getLocalSiteSettings);
  const [imagePreview, setImagePreview] = useState(() => getLocalSiteSettings().about_image_url || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentSuccess, setContentSuccess] = useState('');
  const [contentError, setContentError] = useState('');

  const [syncedAdminName, setSyncedAdminName] = useState(() => admin?.name || '');
  if (admin?.name && admin.name !== syncedAdminName) {
    setSyncedAdminName(admin.name);
    setUsername(admin.name);
  }

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    getSiteSettings().then((data) => {
      if (data) {
        setSiteForm(data);
        setImagePreview(data.about_image_url || '');
      }
    });
  }, []);

  const handleThemeToggle = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    localStorage.setItem('theme', newVal ? 'dark' : 'light');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        name: username,
      };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await updateAdminProfile(payload);
      
      const token = localStorage.getItem('admin_token');
      if (res.user) {
        login(res.user, token);
      }
      
      setCurrentPassword('');
      setNewPassword('');
      setSuccessMsg(res.message || 'Profil dan pengaturan keamanan berhasil diperbarui!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui profil.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleContentSave = async (e) => {
    e.preventDefault();
    setContentLoading(true);
    setContentSuccess('');
    setContentError('');

    try {
      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append('about_title', siteForm.about_title || '');
        payload.append('about_subtitle', siteForm.about_subtitle || '');
        payload.append('about_description', siteForm.about_description || '');
        payload.append('about_image_url', siteForm.about_image_url || '');
        payload.append('menu_pdf_url', siteForm.menu_pdf_url || '');
        payload.append('about_image', selectedFile);
      } else {
        payload = {
          about_title: siteForm.about_title,
          about_subtitle: siteForm.about_subtitle,
          about_description: siteForm.about_description,
          about_image_url: siteForm.about_image_url,
          menu_pdf_url: siteForm.menu_pdf_url,
        };
      }

      const updated = await updateSiteSettings(payload);
      setSiteForm(updated);
      setImagePreview(updated.about_image_url || '');
      setSelectedFile(null);
      setContentSuccess('Konten halaman utama & link menu PDF berhasil disimpan!');
      setTimeout(() => setContentSuccess(''), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan perubahan konten.';
      setContentError(msg);
    } finally {
      setContentLoading(false);
    }
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Kembalikan gambar dan deskripsi ke teks bawaan default?')) return;
    setSiteForm({ ...DEFAULT_SITE_SETTINGS });
    setImagePreview(DEFAULT_SITE_SETTINGS.about_image_url);
    setSelectedFile(null);
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <span className="page-label">CONFIGURATION</span>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Kelola konten website, tampilan aplikasi, dan akun administrator.</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', marginTop: '20px' }}>
        {successMsg && (
          <div className="alert alert--success" style={{ marginBottom: '24px', backgroundColor: 'var(--color-success)', color: '#fff', padding: '16px', borderRadius: '4px' }}>
            ✓ {successMsg}
          </div>
        )}

        {/* --- KONTEN HALAMAN UTAMA (GAMBAR, DESKRIPSI & MENU PDF) --- */}
        <div className="detail-card" style={{ marginBottom: '32px' }}>
          <div className="detail-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>🖼️ Konten Halaman Utama &amp; Menu PDF</span>
            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-muted)',
                fontSize: '12px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Reset ke Default
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Ubah gambar, deskripsi cerita restoran (About section) pada halaman utama, serta link file PDF menu untuk kemudahan pelanggan dan staf.
            </p>

            {contentSuccess && (
              <div className="alert alert--success" style={{ marginBottom: '20px', backgroundColor: '#10b981', color: '#fff', padding: '12px 16px', borderRadius: '6px', fontSize: '14px' }}>
                ✓ {contentSuccess}
              </div>
            )}

            {contentError && (
              <div className="alert alert--danger" style={{ marginBottom: '20px', backgroundColor: 'var(--color-danger)', color: '#fff', padding: '12px 16px', borderRadius: '6px', fontSize: '14px' }}>
                ✕ {contentError}
              </div>
            )}

            <form onSubmit={handleContentSave}>
              {/* 1. GAMBAR HALAMAN UTAMA */}
              <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--color-sidebar)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  📸 Foto / Gambar Halaman Utama (About Section)
                </label>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ width: '180px', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#000', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                    <img
                      src={imagePreview || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>URL Gambar (Web Link)</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://..."
                        value={siteForm.about_image_url || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSiteForm((prev) => ({ ...prev, about_image_url: val }));
                          if (!selectedFile) setImagePreview(val);
                        }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '0' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Atau Unggah File Foto dari Komputer</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-input"
                        onChange={handleImageFileChange}
                        style={{ padding: '6px 10px', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. JUDUL & SUBJUDUL */}
              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Judul Halaman Utama (Title)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={siteForm.about_title || ''}
                    onChange={(e) => setSiteForm((prev) => ({ ...prev, about_title: e.target.value }))}
                    placeholder="Contoh: The Essence of Ebony"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Subjudul (Subtitle)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={siteForm.about_subtitle || ''}
                    onChange={(e) => setSiteForm((prev) => ({ ...prev, about_subtitle: e.target.value }))}
                    placeholder="Contoh: Simple Elegance"
                  />
                </div>
              </div>

              {/* 3. DESKRIPSI LENGKAP */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Deskripsi Cerita Restoran (About Description)
                </label>
                <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: '0 0 8px' }}>
                  Setiap baris baru / enter akan otomatis diformat menjadi paragraf rapi di halaman depan.
                </p>
                <textarea
                  className="form-input form-textarea"
                  rows={6}
                  value={siteForm.about_description || ''}
                  onChange={(e) => setSiteForm((prev) => ({ ...prev, about_description: e.target.value }))}
                  placeholder="Tuliskan filosofi, suasana, dan keunggulan Ebony Cafe & Gallery..."
                  required
                />
              </div>

              {/* 4. LINK MENU PDF */}
              <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--color-sidebar)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                  📄 Link File Menu PDF (Katalog Menu Lengkap)
                </label>
                <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: '0 0 12px' }}>
                  Tautan ini otomatis terhubung ke tombol <strong>"VIEW FULL MENU"</strong> dan <strong>"DOWNLOAD FULL MENU (PDF)"</strong> di halaman pelanggan.
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="url"
                    className="form-input"
                    value={siteForm.menu_pdf_url || ''}
                    onChange={(e) => setSiteForm((prev) => ({ ...prev, menu_pdf_url: e.target.value }))}
                    placeholder="Contoh: https://drive.google.com/file/d/... atau https://ebony.com/menu.pdf"
                    style={{ flex: 1 }}
                    required
                  />
                  {siteForm.menu_pdf_url && (
                    <a
                      href={siteForm.menu_pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--outline-dark"
                      style={{ whiteSpace: 'nowrap', padding: '10px 16px', fontSize: '13px' }}
                    >
                      🔗 Tes Buka PDF
                    </a>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--lg"
                disabled={contentLoading}
                style={{ minWidth: '220px' }}
              >
                {contentLoading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN KONTEN'}
              </button>
            </form>
          </div>
        </div>

        {/* --- APPEARANCE SECTION --- */}
        <div className="detail-card" style={{ marginBottom: '32px' }}>
          <div className="detail-card__header">
            <span style={{ fontWeight: 600 }}>Tampilan (Appearance)</span>
          </div>
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Dark Mode</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>Ubah tampilan admin portal menjadi nuansa gelap.</p>
            </div>
            <div style={{ transform: 'scale(1.2)' }}>
              <Toggle checked={isDarkMode} onChange={handleThemeToggle} label="Dark Mode" />
            </div>
          </div>
        </div>

        {/* --- NOTIFICATION SECTION --- */}
        <div className="detail-card" style={{ marginBottom: '32px' }}>
          <div className="detail-card__header">
            <span style={{ fontWeight: 600 }}>Web Push Notification</span>
          </div>
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Notifikasi Reservasi</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginBottom: '8px' }}>
                Dapatkan notifikasi di browser/HP Anda setiap ada reservasi baru.
              </p>
              
              {pushLoading ? (
                <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Memeriksa status...</span>
              ) : isSubscribed ? (
                <span style={{ fontSize: '13px', color: 'var(--color-success)', fontWeight: 'bold' }}>✅ Notifikasi Aktif</span>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--color-danger)', fontWeight: 'bold' }}>🔕 Notifikasi Belum Aktif</span>
              )}

              {pushError && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-danger)' }}>
                  {pushError}
                </div>
              )}
            </div>
            <div style={{ marginLeft: '16px' }}>
              {!pushLoading && (
                isSubscribed ? (
                  <button type="button" onClick={unsubscribe} className="btn" style={{ background: '#f5f5f5', color: 'var(--color-danger)' }}>
                    Matikan
                  </button>
                ) : (
                  <button type="button" onClick={subscribe} className="btn btn--primary">
                    🔔 Aktifkan
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* --- ACCOUNT SECTION --- */}
        <div className="detail-card">
          <div className="detail-card__header">
            <span style={{ fontWeight: 600 }}>Akun &amp; Keamanan</span>
          </div>
          
          <div style={{ padding: '24px' }}>
            {errorMsg && (
              <div className="alert alert--danger" style={{ marginBottom: '20px', backgroundColor: 'var(--color-danger)', color: '#fff', padding: '14px', borderRadius: '4px' }}>
                ✕ {errorMsg}
              </div>
            )}

            <form onSubmit={handleProfileSave}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Display Name / Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>

              <hr className="divider" style={{ margin: '32px 0' }} />
              
              <h3 style={{ fontSize: '15px', marginBottom: '16px', fontWeight: 600 }}>Ganti Password</h3>
              
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Password Saat Ini</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label className="form-label">Password Baru</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Password baru yang aman"
                />
              </div>

              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN AKUN'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
