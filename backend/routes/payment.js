const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payment/create-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: {
        userId: req.user.id.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify payment
// @access  Private
router.post('/verify', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({ 
        success: true, 
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Payment not completed',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
});

module.exports = router;
