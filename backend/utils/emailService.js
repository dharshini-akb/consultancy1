const nodemailer = require('nodemailer');
const Order = require('../models/Order');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send order notification email to admin
const sendOrderEmail = async (order) => {
  try {
    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const itemsList = populatedOrder.items.map(item => 
      `- ${item.product.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const mailOptions = {
      from: `"Siva Honey Form" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Order Received - Order #${order._id.toString().slice(-6)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B4513;">New Order Notification</h2>
          <p>You have received a new order from Siva Honey Form.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${order._id.toString().slice(-6)}</p>
            <p><strong>Customer:</strong> ${populatedOrder.user.name} (${populatedOrder.user.email})</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Items:</h3>
            <pre style="white-space: pre-wrap;">${itemsList}</pre>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Shipping Information:</h3>
            <p><strong>Name:</strong> ${order.shippingInfo.name}</p>
            <p><strong>Address:</strong> ${order.shippingInfo.address}</p>
            <p><strong>City:</strong> ${order.shippingInfo.city}</p>
            <p><strong>State:</strong> ${order.shippingInfo.state}</p>
            <p><strong>Zip Code:</strong> ${order.shippingInfo.zipCode}</p>
            <p><strong>Country:</strong> ${order.shippingInfo.country}</p>
            <p><strong>Phone:</strong> ${order.shippingInfo.phone}</p>
          </div>

          <p style="margin-top: 30px; color: #666;">
            Please log in to your admin dashboard to process this order.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order notification email sent to admin');
  } catch (error) {
    console.error('Error sending order email:', error);
    throw error;
  }
};

module.exports = { sendOrderEmail };
