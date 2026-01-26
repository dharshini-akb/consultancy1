import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './UserLogin.css';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      if (result.user.role === 'user') {
        navigate('/shop');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="user-login-page">
      <div className="user-login-background">
        <div className="user-login-container">
          <div className="user-login-header">
            <h1 className="user-login-brand">Siva Honey Form</h1>
            <p className="user-login-tagline">Pure Nature's Goodness</p>
          </div>
          <div className="user-login-form-wrapper">
            <h2 className="user-login-title">Login</h2>
            <form onSubmit={handleSubmit} className="user-login-form">
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <div className="login-buttons">
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <Link to="/register" className="register-btn">
                  Register
                </Link>
              </div>
              <a href="#" className="forgot-password-link">Forgot Password?</a>
              <div className="admin-login-notice">
                Admin? <Link to="/admin/login">Go to admin login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
