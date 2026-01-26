const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const honeyItems = [
  {
    name: 'Organic Multiflora Honey',
    description: '100% Natural & Unprocessed. No Added Sugar. Net Quantity: 500g',
    price: 299,
    category: 'honey',
    stock: 50,
    featured: true,
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Honey_jar.jpg',
  },
  {
    name: 'Organic Kothamali Honey',
    description: '100% Natural & Unprocessed. No Added Sugar. Net Quantity: 500g',
    price: 319,
    category: 'honey',
    stock: 50,
    featured: true,
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Glass_jars_of_honey.jpg',
  },
  {
    name: 'Organic Murungai Honey',
    description: '100% Natural & Unprocessed. No Added Sugar. Net Quantity: 500g',
    price: 329,
    category: 'honey',
    stock: 50,
    featured: true,
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Honeycomb_with_honey.jpg',
  },
  {
    name: 'Organic Naval Honey',
    description: '100% Natural & Unprocessed. No Added Sugar. Net Quantity: 500g',
    price: 349,
    category: 'honey',
    stock: 50,
    featured: true,
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Honey_and_spoon.jpg',
  },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sivahoneyform');
    console.log('Connected to MongoDB');

    for (const item of honeyItems) {
      const exists = await Product.findOne({ name: item.name });
      if (exists) {
        if (!exists.image) {
          exists.image = item.image;
          await exists.save();
          console.log(`Updated image for: ${item.name}`);
        } else {
          console.log(`Exists: ${item.name} — keeping existing image`);
        }
        continue;
      }
      const doc = new Product(item);
      await doc.save();
      console.log(`Added: ${item.name}`);
    }

    console.log('Honey seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

run();
