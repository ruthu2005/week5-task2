require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const Product = require('../models/Product');

/**
 * High-quality sample products dataset for seeding
 */
const sampleProducts = [
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    description: 'Quiet clicking ergonomic performance wireless mouse with 8K DPI any-surface tracking and MagSpeed scrolling.',
    price: 99.99,
    category: 'Accessories',
    stock: 45,
    sku: 'LOGI-MXM3S-001',
    isAvailable: true,
    rating: 4.8,
    tags: ['ergonomic', 'wireless', 'mouse', 'office'],
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling wireless headphones with dual processors, 8 microphones, and up to 30 hours battery life.',
    price: 398.0,
    category: 'Audio',
    stock: 28,
    sku: 'SONY-WHXM5-BLK',
    isAvailable: true,
    rating: 4.9,
    tags: ['anc', 'headphones', 'bluetooth', 'premium-audio'],
  },
  {
    name: 'Apple MacBook Pro 14" M3 Pro',
    description: 'Blazing-fast laptop with 11-core CPU, 14-core GPU, Liquid Retina XDR display, 18GB unified memory, and 512GB SSD storage.',
    price: 1999.0,
    category: 'Computers',
    stock: 14,
    sku: 'APPL-MBP14-M3P',
    isAvailable: true,
    rating: 4.9,
    tags: ['laptop', 'apple', 'm3', 'retina'],
  },
  {
    name: 'Keychron Q1 Pro Wireless Mechanical Keyboard',
    description: 'QMK/VIA custom mechanical keyboard with CNC aluminum body, double-gasket design, and hot-swappable switches.',
    price: 199.95,
    category: 'Accessories',
    stock: 35,
    sku: 'KCH-Q1PRO-RD',
    isAvailable: true,
    rating: 4.7,
    tags: ['mechanical-keyboard', 'custom', 'qmk', 'wireless'],
  },
  {
    name: 'Samsung Odyssey Neo G9 Curved Gaming Monitor',
    description: '49-inch 1000R curved dual QHD mini-LED gaming display with 240Hz refresh rate and 1ms response time.',
    price: 1299.99,
    category: 'Electronics',
    stock: 8,
    sku: 'SAMS-G9NEO-49',
    isAvailable: true,
    rating: 4.6,
    tags: ['monitor', 'curved', 'ultrawide', 'gaming'],
  },
  {
    name: 'Garmin Fenix 7 Pro Sapphire Solar Watch',
    description: 'Multisport GPS smartwatch with solar charging lens, built-in LED flashlight, endurance score, and rugged titanium bezel.',
    price: 799.99,
    category: 'Wearables',
    stock: 19,
    sku: 'GARM-FNX7P-SLR',
    isAvailable: true,
    rating: 4.8,
    tags: ['smartwatch', 'gps', 'fitness', 'solar'],
  },
  {
    name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    description: 'Seminal guide by Robert C. Martin on principles, patterns, and practices of writing clean, maintainable software.',
    price: 44.5,
    category: 'Books',
    stock: 60,
    sku: 'BOOK-CLNCOD-01',
    isAvailable: true,
    rating: 4.8,
    tags: ['programming', 'software-engineering', 'education'],
  },
  {
    name: 'Dell UltraSharp 27 4K USB-C Hub Monitor',
    description: 'IPS Black technology monitor with 2000:1 contrast ratio, 90W power delivery, and built-in RJ45 Ethernet.',
    price: 579.99,
    category: 'Electronics',
    stock: 22,
    sku: 'DELL-U2723QE-01',
    isAvailable: true,
    rating: 4.7,
    tags: ['monitor', '4k', 'usb-c', 'designer'],
  },
  {
    name: 'Anker Prime 20,000mAh Power Bank (200W)',
    description: 'High-output portable charger capable of fast-charging two laptops simultaneously with smart digital display.',
    price: 129.99,
    category: 'Accessories',
    stock: 50,
    sku: 'ANKR-PRM20K-200W',
    isAvailable: true,
    rating: 4.6,
    tags: ['charger', 'usb-c', 'powerbank', 'travel'],
  },
  {
    name: 'Herman Miller Aeron Chair Ergonomic Headrest',
    description: 'Adjustable headrest tailored for classic and remastered Aeron office chairs with forward, backward, and vertical movement.',
    price: 149.0,
    category: 'Office',
    stock: 15,
    sku: 'HM-AERON-HDRST',
    isAvailable: true,
    rating: 4.5,
    tags: ['ergonomics', 'office', 'chair-accessories'],
  },
  {
    name: 'Shure SM7B Cardioid Dynamic Vocal Microphone',
    description: 'Legendary broadcast vocal microphone delivering smooth, warm sound reproduction for podcasting, streaming, and recording.',
    price: 399.0,
    category: 'Audio',
    stock: 0,
    sku: 'SHUR-SM7B-MIC',
    isAvailable: false,
    rating: 4.9,
    tags: ['microphone', 'studio', 'podcast', 'audio'],
  },
];

/**
 * Seed database function
 * Clears existing product collection and inserts fresh sample dataset.
 *
 * @param {string} [customUri] - Optional custom MongoDB URI
 * @returns {Promise<Array>} Seeded products
 */
const seedDatabase = async (customUri) => {
  try {
    console.log('[Seed Utility] Starting database seeding process...');

    // If mongoose is not already connected, connect now
    if (mongoose.connection.readyState !== 1) {
      await connectDB(customUri);
    }

    // Clear existing products
    const deleteResult = await Product.deleteMany({});
    console.log(`[Seed Utility] Cleared ${deleteResult.deletedCount} existing product(s) from collection.`);

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`[Seed Utility] Successfully seeded ${insertedProducts.length} sample products!`);

    console.table(
      insertedProducts.map((p) => ({
        ID: p._id.toString(),
        Name: p.name.substring(0, 30) + '...',
        Category: p.category,
        Price: `$${p.price.toFixed(2)}`,
        Stock: p.stock,
        SKU: p.sku,
      }))
    );

    return insertedProducts;
  } catch (error) {
    console.error(`[Seed Utility Error] Seeding failed: ${error.message}`);
    throw error;
  }
};

// Execute directly if run via CLI: node src/utils/seedDatabase.js
if (require.main === module) {
  seedDatabase()
    .then(async () => {
      console.log('[Seed Utility] Database seeding completed successfully.');
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seed Utility] Fatal error during seeding:', err);
      await disconnectDB();
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  sampleProducts,
};
