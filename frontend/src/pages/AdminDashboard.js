import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'organic',
    stock: '',
    featured: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'organic',
    stock: '',
    featured: false
  });
  const [editImageFile, setEditImageFile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentOrders();
    fetchProducts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/admin/dashboard');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await axios.get('/api/admin/orders');
      setRecentOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm({
      ...productForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('stock', productForm.stock);
      formData.append('featured', productForm.featured);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.post('/api/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Product added successfully!');
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: 'organic',
        stock: '',
        featured: false
      });
      setImageFile(null);
      document.getElementById('product-image').value = '';
      fetchDashboardData();
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };
  
  const startEditProduct = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      featured: product.featured
    });
    setEditImageFile(null);
  };
  
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleEditImageChange = (e) => {
    setEditImageFile(e.target.files[0]);
  };
  
  const saveEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('description', editForm.description);
      formData.append('price', editForm.price);
      formData.append('category', editForm.category);
      formData.append('stock', editForm.stock);
      formData.append('featured', editForm.featured);
      if (editImageFile) {
        formData.append('image', editImageFile);
      }
      await axios.put(`/api/admin/products/${editingProduct._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setEditingProduct(null);
      fetchDashboardData();
      fetchProducts();
      alert('Product updated');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };
  
  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/admin/products/${productId}`);
      fetchDashboardData();
      fetchProducts();
      alert('Product deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-background">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-header-actions">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
        <div className="admin-role-banner">
          Signed in as {user?.email} • role: {user?.role}
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Products</h3>
            <p>{stats.totalProducts}</p>
          </div>
          <div className="stat-card">
            <h3>New Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Total Sales</h3>
            <p>₹{stats.totalSales.toFixed(2)}</p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="add-product-panel">
            <h2>Add New Product</h2>
            <form onSubmit={handleAddProduct} className="product-form">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="honey">Honey</option>
                  <option value="shampoo">Shampoo</option>
                  <option value="masala">Masala</option>
                  <option value="soap">Soap</option>
                  <option value="oil">Oil</option>
                  <option value="malt">Malt</option>
                  <option value="washingpowder">Washing Powders</option>
                  <option value="organic">Organic</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={productForm.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={productForm.featured}
                    onChange={handleInputChange}
                  />
                  Featured Product
                </label>
              </div>
              <div className="form-group">
                <label>Product Image</label>
                <input
                  type="file"
                  id="product-image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="upload-btn">Upload Image</button>
                <button type="submit" className="add-product-btn" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>

          <div className="orders-panel">
            <h2>Manage Products</h2>
            <div className="orders-list">
              {products.map(p => (
                <div key={p._id} className="order-item">
                  <div className="order-header">
                    <span className="order-title">{p.name}</span>
                  </div>
                  <div className="order-details">
                    <p>Price: ₹{p.price.toFixed(2)}</p>
                    <p>Stock: {p.stock}</p>
                    <p>Category: {p.category}</p>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="upload-btn" onClick={() => startEditProduct(p)}>Edit</button>
                    <button type="button" className="add-product-btn" onClick={() => deleteProduct(p._id)}>Delete</button>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="no-orders">No products</div>
              )}
            </div>
            {editingProduct && (
              <form onSubmit={saveEditProduct} className="product-form" style={{ marginTop: 20 }}>
                <h3>Edit Product</h3>
                <div className="form-group">
                  <label>Name</label>
                  <input name="name" value={editForm.name} onChange={handleEditChange} required />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" step="0.01" min="0" name="price" value={editForm.price} onChange={handleEditChange} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={editForm.category} onChange={handleEditChange} required>
                    <option value="honey">Honey</option>
                    <option value="shampoo">Shampoo</option>
                    <option value="masala">Masala</option>
                    <option value="soap">Soap</option>
                    <option value="oil">Oil</option>
                    <option value="malt">Malt</option>
                    <option value="washingpowder">Washing Powders</option>
                    <option value="organic">Organic</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" min="0" name="stock" value={editForm.stock} onChange={handleEditChange} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" name="description" value={editForm.description} onChange={handleEditChange} required />
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" name="featured" checked={editForm.featured} onChange={handleEditChange} />
                    Featured Product
                  </label>
                </div>
                <div className="form-group">
                  <label>Replace Image</label>
                  <input type="file" accept="image/*" onChange={handleEditImageChange} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="add-product-btn">Save</button>
                  <button type="button" className="upload-btn" onClick={() => setEditingProduct(null)}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          <div className="orders-panel">
            <h2>Order Notifications</h2>
            {ordersLoading ? (
              <div className="loading">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="no-orders">No orders yet</div>
            ) : (
              <div className="orders-list">
                {recentOrders.map(order => (
                  <div key={order._id} className="order-item">
                    <div className="order-header">
                      <input type="checkbox" defaultChecked={order.emailSent} />
                      <span className="order-title">
                        New Order: {order.items[0]?.product?.name || 'Order'}...
                      </span>
                    </div>
                    <div className="order-details">
                      <p>Order by: {order.user?.name || 'Unknown'}</p>
                      <p>Amount: ₹{order.totalAmount.toFixed(2)}</p>
                      <p>Status: {order.orderStatus}</p>
                      <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
