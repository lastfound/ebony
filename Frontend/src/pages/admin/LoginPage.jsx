import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminLogin } from '../../api/adminApi';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // In a real app, this would use the real API
      // const { user, token } = await adminLogin(form);
      
      // Simulated login for demo purposes based on design
      const token = 'fake-jwt-token-123';
      const user = { name: 'Ebony Admin', role: 'MANAGER', email: form.email };
      
      login(user, token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">
          <span className="logo-text">EBONY</span>
          <span className="login-card__subtitle">Admin Portal</span>
        </div>
        
        {error && <div className="alert alert--error" style={{ marginBottom: 16 }}>{error}</div>}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              className="form-input" 
              type="email" 
              required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="admin@ebonycafe.com" 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              className="form-input" 
              type="password" 
              required
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••" 
            />
          </div>
          <button type="submit" className="btn btn--primary btn--full" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
