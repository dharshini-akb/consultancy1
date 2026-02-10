import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './OrderHistory.css';

const OrderHistory = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading orders...</div>;
  }

  return (
    <div className="order-history-page">
      <nav className="order-nav">
        <Link to="/" className="nav-brand">Siva Honey Form</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          {user && <Link to="/orders">My Orders</Link>}
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </nav>
      <div className="order-history-container">
        <h1>My Order History</h1>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet.</p>
            <a href="/shop" className="start-shopping-btn" style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '10px 20px',
              backgroundColor: '#f39c12',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>Start Shopping</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <strong>Order ID:</strong> {order._id.slice(-6).toUpperCase()}
                  </div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className={`order-status status-${order.orderStatus}`}>
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </div>
                </div>
                
                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <span className="item-name">{item.product.name}</span>
                        <span className="item-qty">x{item.quantity}</span>
                      </div>
                      <div className="item-price">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="order-footer">
                  <div className="payment-info">
                    <span className="payment-method">
                      Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'qr' ? 'QR Code' : 'Card'}
                    </span>
                    <span className={`payment-status status-${order.paymentStatus}`}>
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                  <div className="order-total">
                    <strong>Total: ₹{order.totalAmount.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
