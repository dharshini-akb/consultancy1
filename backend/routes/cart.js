const express = require('express');
const { auth } = require('../middleware/auth');
const Product = require('../models/Product');

const router = express.Router();

// In-memory cart storage (in production, use Redis or database)
let carts = {};

async function enrichCart(cart) {
  const items = await Promise.all(
    (cart.items || []).map(async (item) => {
      const product = await Product.findById(item.productId).select('name price image category');
      return {
        productId: item.productId,
        quantity: item.quantity,
        product: product || null
      };
    })
  );
  const total = items.reduce((sum, i) => {
    return i.product ? sum + i.product.price * i.quantity : sum;
  }, 0);
  return { items, total };
}

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const cart = carts[userId] || { items: [], total: 0 };
    const enriched = await enrichCart(cart);
    res.json(enriched);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id.toString();

    if (!carts[userId]) {
      carts[userId] = { items: [], total: 0 };
    }

    const existingItem = carts[userId].items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      carts[userId].items.push({ productId, quantity: quantity || 1 });
    }

    const enriched = await enrichCart(carts[userId]);
    res.json(enriched);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

// @route   PUT /api/cart/:productId
// @desc    Update cart item quantity
// @access  Private
router.put('/:productId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.user.id.toString();

    if (!carts[userId]) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = carts[userId].items.find(item => item.productId === req.params.productId);
    
    if (item) {
      item.quantity = quantity;
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const enriched = await enrichCart(carts[userId]);
    res.json(enriched);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Error updating cart' });
  }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/:productId', auth, async (req, res) => {
  try {
    const userId = req.user.id.toString();

    if (!carts[userId]) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    carts[userId].items = carts[userId].items.filter(
      item => item.productId !== req.params.productId
    );

    const enriched = await enrichCart(carts[userId]);
    res.json(enriched);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Error removing from cart' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    carts[userId] = { items: [], total: 0 };
    res.json({ items: [], total: 0 });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
});

module.exports = router;
