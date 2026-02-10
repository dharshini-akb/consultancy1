import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Checkout.css';
import './QRModal.css';

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const StripeCheckoutWrapper = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  return <CheckoutFormContent {...props} stripe={stripe} elements={elements} />;
};

const CheckoutFormContent = ({ cart, products, total, onOrderComplete, hasStripe, stripe, elements }) => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showQrCode, setShowQrCode] = useState(false);

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
      let orderId = null;

      if (paymentMethod === 'qr') {
        // Generate QR code first
        const tempOrderId = 'TEMP-' + Date.now();
        const { data } = await axios.post('/api/payment/generate-qr', {
          amount: total,
          orderId: tempOrderId
        });
        
        setQrCodeData(data);
        setShowQrCode(true);
        setProcessing(false);
        return; // Stop here and show QR code
      }

      if (paymentMethod === 'stripe') {
        if (!hasStripe || !stripe || !elements) {
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
      orderId = orderRes.data._id;

      // Clear cart
      await axios.delete('/api/cart');

      onOrderComplete(orderRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  const handleQrPaymentConfirmation = async () => {
    try {
      setProcessing(true);
      
      // Create order with QR payment
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingInfo,
        paymentMethod: 'qr',
        paymentId: 'QR-' + Date.now(),
        totalAmount: total
      };

      const orderRes = await axios.post('/api/orders', orderData);

      // Clear cart
      await axios.delete('/api/cart');

      setShowQrCode(false);
      onOrderComplete(orderRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Order creation failed');
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
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Cash on Delivery (COD)</span>
          </label>
          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="qr"
              checked={paymentMethod === 'qr'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>QR Code Payment (UPI)</span>
          </label>
          {hasStripe && (
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
          )}
        </div>

        {paymentMethod === 'cod' && (
          <div className="payment-info">
            <p>Pay with cash when your order is delivered. Additional charges may apply for COD orders.</p>
          </div>
        )}

        {paymentMethod === 'qr' && (
          <div className="payment-info">
            <p>Scan the QR code with any UPI app to make payment instantly.</p>
          </div>
        )}

        {paymentMethod === 'stripe' && hasStripe && (
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

      {/* QR Code Modal */}
      {showQrCode && qrCodeData && (
        <div className="qr-modal-overlay">
          <div className="qr-modal">
            <h3>Scan QR Code to Pay</h3>
            <div className="qr-code-container">
              <img src={qrCodeData.qrCode} alt="Payment QR Code" />
            </div>
            <div className="qr-details">
              <p><strong>Amount:</strong> ₹{qrCodeData.amount}</p>
              <p><strong>UPI ID:</strong> {qrCodeData.upiId}</p>
              <p><strong>Order ID:</strong> {qrCodeData.orderId}</p>
            </div>
            <div className="qr-instructions">
              <p>1. Open any UPI app (PhonePe, Paytm, Google Pay, etc.)</p>
              <p>2. Scan this QR code</p>
              <p>3. Complete the payment</p>
              <p>4. Click "I've Paid" below</p>
            </div>
            <div className="qr-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowQrCode(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className="confirm-payment-btn"
                onClick={handleQrPaymentConfirmation}
                disabled={processing}
              >
                {processing ? 'Processing...' : "I've Paid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        className="complete-order-btn"
        disabled={(paymentMethod === 'stripe' && !hasStripe) || processing}
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
        <nav className="checkout-nav">
          <a href="/" className="nav-brand">Siva Honey Form</a>
          <div className="nav-links">
            <a href="/">Home</a>
            <a href="/shop">Shop</a>
            <a href="/orders">My Orders</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </div>
        </nav>
        <div className="order-success">
          <h1>Order Placed Successfully!</h1>
          <p>Your order ID: {orderId?.slice(-6).toUpperCase()}</p>
          <p>You will receive a confirmation email shortly.</p>
          <button onClick={() => navigate('/shop')} className="continue-shopping-btn">
            Continue Shopping
          </button>
          <button onClick={() => navigate('/orders')} className="view-orders-btn" style={{marginLeft: '10px', backgroundColor: '#3498db'}}>
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <nav className="checkout-nav">
        <a href="/" className="nav-brand">Siva Honey Form</a>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/shop">Shop</a>
          <a href="/orders">My Orders</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>
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
                          : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${product.image}`} alt={product.name} />
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
                <StripeCheckoutWrapper
                  cart={cart}
                  products={products}
                  total={total}
                  onOrderComplete={handleOrderComplete}
                  hasStripe={true}
                />
              </Elements>
            ) : (
              <CheckoutFormContent
                cart={cart}
                products={products}
                total={total}
                onOrderComplete={handleOrderComplete}
                hasStripe={false}
                stripe={null}
                elements={null}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
