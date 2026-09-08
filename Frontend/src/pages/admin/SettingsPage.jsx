import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import Toggle from '../../components/ui/Toggle';

export default function SettingsPage() {
  const { admin, login } = useAuth();
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Profile Form State
  const [username, setUsername] = useState(admin?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');
  
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

  const handleProfileSave = (e) => {
    e.preventDefault();
    // Simulasi update ke backend
    
    // 1. Update auth context lokal agar nama di sidebar langsung berubah
    const updatedUser = { ...admin, name: username };
    const token = localStorage.getItem('admin_token'); 
    login(updatedUser, token);
    
    // 2. Clear password fields
    setCurrentPassword('');
    setNewPassword('');
    
    // 3. Show success message
    setSuccessMsg('Profil dan pengaturan keamanan berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 4000);
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

              <button type="submit" className="btn btn--primary">
                SAVE CHANGES
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
