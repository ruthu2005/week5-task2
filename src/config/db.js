const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Encapsulates connection logic, event listeners, and graceful shutdown.
 * 
 * @param {string} [customUri] - Optional MongoDB connection URI override
 * @returns {Promise<typeof mongoose>} Mongoose connection instance
 */
const connectDB = async (customUri) => {
  const uri = customUri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/product_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    // If running in production or script, you may exit; during testing we can bubble up
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Disconnect from MongoDB gracefully
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed gracefully');
  } catch (error) {
    console.error(`[Database Error] Error during disconnection: ${error.message}`);
  }
};

// Mongoose Connection Event Listeners
mongoose.connection.on('connected', () => {
  console.log('[Database Event] Connection established');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Event] Connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('[Database Event] Connection lost / disconnected');
});

// Graceful application shutdown listeners
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  disconnectDB,
};
