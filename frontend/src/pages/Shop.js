import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useContext(AuthContext);
  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const res = await axios.get('/api/products', { params });
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'honey', label: 'Honey' },
    { value: 'shampoo', label: 'Shampoos' },
    { value: 'masala', label: 'Masalas' },
    { value: 'soap', label: 'Soaps' },
    { value: 'oil', label: 'Oil' },
    { value: 'malt', label: 'Malt' },
    { value: 'washingpowder', label: 'Washing Powders' }
  ];

  return (
    <div className="shop-page">
      <nav className="shop-nav">
        <Link to="/" className="nav-brand">Siva Honey Form</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          {user && <Link to="/orders">My Orders</Link>}
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {!user && <Link to="/login">Login</Link>}
          {user && (
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
          )}
        </div>
      </nav>

      <div className="shop-container">
        <div className="shop-header">
          <h1>Our Products</h1>
          <p>Premium Honey & Organic Products</p>
        </div>

        <div className="shop-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat.value}
                className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="no-products">No products found</div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <Link key={product._id} to={`/product/${product._id}`} className="product-card">
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image.startsWith('http') || product.image.startsWith('data:')
                      ? product.image
                      : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${product.image}`} alt={product.name} />
                  ) : (
                    <div className="product-placeholder">No Image</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-price">₹{product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
