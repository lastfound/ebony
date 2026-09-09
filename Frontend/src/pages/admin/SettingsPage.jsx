import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import Toggle from '../../components/ui/Toggle';
import { updateAdminProfile } from '../../api/adminApi';

export default function SettingsPage() {
  const { admin, login } = useAuth();
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Profile Form State
  const [username, setUsername] = useState(admin?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  useEffect(() => {
    if (admin?.name) {
      setUsername(admin.name);
    }
  }, [admin]);

  useEffect(() => {
    // Check initial theme from localStorage or body class
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || document.body.classList.contains('dark-mode')) {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  const handleThemeToggle = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    if (newVal) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
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
      
      // Update local auth context
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

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <span className="page-label">CONFIGURATION</span>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences and application appearance.</p>
        </div>
      </div>

      <div style={{ maxWidth: '700px', marginTop: '20px' }}>
        {successMsg && (
          <div className="alert alert--success" style={{ marginBottom: '24px', backgroundColor: 'var(--color-success)', color: '#fff', padding: '16px', borderRadius: '4px' }}>
            ✓ {successMsg}
          </div>
        )}

        {/* --- APPEARANCE SECTION --- */}
        <div className="detail-card" style={{ marginBottom: '32px' }}>
          <div className="detail-card__header">
            <span style={{ fontWeight: 600 }}>Appearance</span>
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

        {/* --- ACCOUNT SECTION --- */}
        <div className="detail-card">
          <div className="detail-card__header">
            <span style={{ fontWeight: 600 }}>Account & Security</span>
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
              
              <h3 style={{ fontSize: '15px', marginBottom: '16px', fontWeight: 600 }}>Change Password</h3>
              
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Current Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  placeholder="Leave blank if not changing"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="New secure password"
                />
              </div>

              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
