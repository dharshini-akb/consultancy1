import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Checkout.css';

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const CheckoutForm = ({ cart, products, total, onOrderComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      let paymentId = null;

      if (paymentMethod === 'stripe') {
        if (!stripe || !elements) {
          throw new Error('Stripe is not loaded. Please configure Stripe keys.');
        }
        
        // Create payment intent
        const { data } = await axios.post('/api/payment/create-intent', {
          amount: total,
          currency: 'usd'
        });

        // Confirm payment
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
            }
          }
        );

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        paymentId = paymentIntent.id;
      }

      // Create order
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingInfo,
        paymentMethod,
        paymentId,
        totalAmount: total
      };

      const orderRes = await axios.post('/api/orders', orderData);

      // Clear cart
      await axios.delete('/api/cart');

      onOrderComplete(orderRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="checkout-section">
        <h3>Shipping Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={shippingInfo.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={shippingInfo.phone}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={shippingInfo.address}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={shippingInfo.city}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={shippingInfo.state}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Zip Code</label>
            <input
              type="text"
              name="zipCode"
              value={shippingInfo.zipCode}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            name="country"
            value={shippingInfo.country}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="checkout-section">
        <h3>Payment Method</h3>
        <div className="payment-methods">
          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Credit/Debit Card</span>
          </label>
          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>PayPal</span>
          </label>
        </div>

        {paymentMethod === 'stripe' && (
          <div className="stripe-element">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        className="complete-order-btn"
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : 'Complete Order'}
      </button>
    </form>
  );
};

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState({});
  const [total, setTotal] = useState(0);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cart, products]);

  const fetchCart = async () => {
    try {
      const res = await axios.get('/api/cart');
      setCart(res.data);

      if (res.data.items.length === 0) {
        navigate('/cart');
        return;
      }

      const productIds = res.data.items.map(item => item.productId);
      const productPromises = productIds.map(id => axios.get(`/api/products/${id}`));
      const productResponses = await Promise.all(productPromises);

      const productsMap = {};
      productResponses.forEach((res, index) => {
        productsMap[productIds[index]] = res.data;
      });
      setProducts(productsMap);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const calculateTotal = () => {
    let sum = 0;
    cart.items.forEach(item => {
      const product = products[item.productId];
      if (product) {
        sum += product.price * item.quantity;
      }
    });
    setTotal(sum);
  };

  const handleOrderComplete = (order) => {
    setOrderComplete(true);
    setOrderId(order._id);
  };

  if (orderComplete) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <h1>Order Placed Successfully!</h1>
          <p>Your order ID: {orderId?.slice(-6)}</p>
          <p>You will receive a confirmation email shortly.</p>
          <button onClick={() => navigate('/shop')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Shopping Cart & Checkout</h1>

        <div className="checkout-content">
          <div className="checkout-cart-summary">
            <h2>Shopping Cart</h2>
            <div className="cart-items-list">
              {cart.items.map(item => {
                const product = products[item.productId];
                if (!product) return null;

                return (
                  <div key={item.productId} className="checkout-cart-item">
                    <div className="checkout-item-image">
                      {product.image ? (
                        <img src={product.image.startsWith('http') || product.image.startsWith('data:')
                          ? product.image
                          : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${product.image.replace(/\\/g, '/')}`} alt={product.name} />
                      ) : (
                        <div className="item-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="checkout-item-info">
                      <h4>{product.name}</h4>
                      <p>₹{product.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="checkout-item-total">
                      ₹{(product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="checkout-total">
              <h3>Total: ₹{total.toFixed(2)}</h3>
            </div>
          </div>

          <div className="checkout-form-wrapper">
            <h2>Secure Checkout</h2>
            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  cart={cart}
                  products={products}
                  total={total}
                  onOrderComplete={handleOrderComplete}
                />
              </Elements>
            ) : (
              <div className="stripe-error">
                <p>Stripe is not configured. Please set REACT_APP_STRIPE_PUBLISHABLE_KEY in your .env file.</p>
                <p>For testing, you can still complete orders with other payment methods.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
