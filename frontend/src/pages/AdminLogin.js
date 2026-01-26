import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginAdmin(email, password);
    
    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Admin login required.');
        setLoading(false);
      }
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-background">
        <div className="admin-login-container">
          <div className="admin-login-header">
            <h1 className="admin-login-brand">Siva Honey Form</h1>
            <p className="admin-login-tagline">Premium Honey & Organic Products</p>
          </div>
          <div className="admin-login-form-wrapper">
            <h2 className="admin-login-title">Admin Login</h2>
            <form onSubmit={handleSubmit} className="admin-login-form">
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label htmlFor="admin-email">Admin Email</label>
                <input
                  type="email"
                  id="admin-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your admin email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="admin-password">Password</label>
                <input
                  type="password"
                  id="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" className="admin-login-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <a href="/login" className="forgot-password-link">Forgot Password?</a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
