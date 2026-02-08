import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="home-page">
      <div className="home-background">
        <div className="home-overlay"></div>
        <nav className="home-nav">
          <div className="nav-brand">Siva Honey Form</div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            {user && <Link to="/orders">My Orders</Link>}
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            {!user && <Link to="/login">Login</Link>}
            {user && (
              <button type="button" className="nav-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </nav>
        <div className="home-content">
          <h1 className="home-title">100% Organic Honey & Natural Products</h1>
          <Link to="/shop" className="shop-now-btn">Shop Now</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
