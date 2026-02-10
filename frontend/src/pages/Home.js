import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

// Reusable card for product/category highlights
const ProductCard = ({ title, price, img, badge }) => {
  return (
    <div className="product-card">
      <div className="product-card-media">
        <img
          src={img}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%23FFF8E1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%238B4513" font-size="20" font-family="Arial">Image unavailable</text></svg>';
          }}
        />
        {badge && <span className="product-card-badge">{badge}</span>}
      </div>
      <div className="product-card-body">
        <h4 className="product-card-title">{title}</h4>
        <p className="product-card-price">From ₹{price}</p>
        <Link to="/shop" className="product-card-btn">Shop Now</Link>
      </div>
    </div>
  );
};

// Hero section with CTAs
const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Pure Honey & 100% Organic Products</h1>
        <p className="hero-subtitle">Natural • Chemical-Free • Farm Fresh</p>
        <div className="hero-cta">
          <Link to="/shop" className="cta-primary">Explore Products</Link>
        </div>
      </div>
      <div className="hero-visuals">
        <img
          className="hero-image primary"
          src="https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Pure organic honey jar"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="%23FFF8E1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%238B4513" font-size="32" font-family="Arial">Honey Image</text></svg>';
          }}
        />
      </div>
    </section>
  );
};

// Video section with two real videos
const VideoSection = () => {
  return (
    <section className="video-section">
      <div className="section-header">
        <h2>From Nature to Your Home</h2>
        <p>Experience the journey of pure, natural products from our farms to your table</p>
      </div>
      <div className="video-grid">
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube-nocookie.com/embed/8GkGq8tSGiM"
            title="Honey Harvesting Process"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
          ></iframe>
          <span className="video-caption">Honey Harvesting</span>
        </div>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube-nocookie.com/embed/k4b42Z0wPrY"
            title="Organic Farming Methods"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
          ></iframe>
          <span className="video-caption">Organic Farming</span>
        </div>
      </div>
    </section>
  );
};

// Trust and quality badges
const TrustQualitySection = () => {
  const items = [
    { icon: '🌿', title: '100% Organic', text: 'Certified organic ingredients from sustainable farms' },
    { icon: '🧪', title: 'Chemical-Free', text: 'No additives, preservatives or artificial flavors' },
    { icon: '🏡', title: 'Farm Fresh', text: 'Harvested and packed with care daily' },
    { icon: '🏺', title: 'Traditional Methods', text: 'Prepared using time-tested natural practices' },
  ];
  return (
    <section className="trust-section">
      <div className="section-header">
        <h2>Trust & Quality</h2>
        <p>Goodness you can taste and trust</p>
      </div>
      <div className="trust-grid">
        {items.map((i) => (
          <div key={i.title} className="trust-card">
            <div className="trust-icon">{i.icon}</div>
            <h4>{i.title}</h4>
            <p>{i.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// Featured product categories with real images
const ProductHighlightsSection = () => {
  const products = [
    {
      title: 'Honey Varieties',
      price: '199',
      img: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800',
      badge: 'Best Seller',
    },
    {
      title: 'Organic Oils',
      price: '249',
      img: 'https://images.pexels.com/photos/6621315/pexels-photo-6621315.jpeg?auto=compress&cs=tinysrgb&w=800',
      badge: 'New',
    },
    {
      title: 'Homemade Soaps',
      price: '149',
      img: 'https://images.pexels.com/photos/5853625/pexels-photo-5853625.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      title: 'Hair & Health',
      price: '199',
      img: 'https://images.pexels.com/photos/6621295/pexels-photo-6621295.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
  ];
  return (
    <section className="products-section">
      <div className="section-header">
        <h2>Featured Categories</h2>
        <p>Handpicked organic products for your wellness journey</p>
      </div>
      <div className="products-grid">
        {products.map((p) => (
          <ProductCard key={p.title} {...p} />
        ))}
      </div>
    </section>
  );
};

// Payment and delivery info
const PaymentDeliverySection = () => {
  return (
    <section className="payment-section">
      <div className="section-header">
        <h2>Payment & Delivery</h2>
        <p>Easy & Secure Payments</p>
      </div>
      <div className="payment-grid">
        <div className="payment-card">
          <div className="payment-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#8B4513" d="M7 2h10v4H7z" />
              <path fill="#FFC107" d="M3 6h18v14H3z" />
              <circle cx="8" cy="13" r="2" fill="#2E7D32" />
            </svg>
          </div>
          <div className="payment-content">
            <h4>Cash on Delivery (COD)</h4>
            <p>Pay when your order arrives at your doorstep</p>
          </div>
        </div>
        <div className="payment-card">
          <div className="payment-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="16" rx="3" fill="#2E7D32" />
              <path d="M10 9h7M10 13h7" stroke="#fff" strokeWidth="2" />
              <circle cx="7" cy="12" r="2" fill="#FFC107" />
            </svg>
          </div>
          <div className="payment-content">
            <h4>QR Code Payment</h4>
            <p>Scan and pay instantly via UPI</p>
            <img
              className="qr-image"
              alt="UPI QR Code for payment"
              src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=sivahoneyfarm@okicici&pn=Siva%20Honey%20Farm&am=1&cu=INR"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer
const FooterSection = ({ user, onLogout }) => {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h4>About Siva Honey Form</h4>
          <p>
            We are dedicated to delivering pure honey and organic products
            crafted with traditional methods. From sustainable farms to your home,
            bringing nature's best to your family.
          </p>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <p>📍 Tamil Nadu, India</p>
          <p>📞 +91-98765-43210</p>
          <p>✉️ hello@sivahoneyfarm.com</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            {user && <Link to="/orders">My Orders</Link>}
            <Link to="/cart">Cart</Link>
            {!user ? (
              <Link to="/login">Login</Link>
            ) : (
              <button type="button" className="footer-logout-btn" onClick={onLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
        <div className="footer-col">
          <h4>Follow Us</h4>
          <div className="socials">
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="YouTube">▶️</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Siva Honey Farm. All rights reserved.</span>
      </div>
    </footer>
  );
};

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
          <HeroSection />
        </div>
      </div>

      <VideoSection />
      <ProductHighlightsSection />
      <TrustQualitySection />
      <PaymentDeliverySection />
      <FooterSection user={user} onLogout={handleLogout} />
    </div>
  );
};

export default Home;
