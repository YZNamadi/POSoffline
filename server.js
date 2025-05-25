require('dotenv').config(); // Must come first

const express = require('express');
const app = express();

const { syncPendingTransactions } = require('./syncEngine');
const sequelize = require('./config/database');
const redisClient = require('./config/redis');
const transactionRoutes = require('./routes/transactionRoutes');

// Middleware
app.use(express.json());


// Routes
app.use('/api', transactionRoutes);

// Start Server
const PORT = process.env.PORT ;

const startServer = async () => {
  try {
    // Test MySQL connection
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); 
    console.log('database connected and synced');

    // Test Redis connection
    await redisClient.connect(); 
    console.log('Redis client connected');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};



// Run every 15 seconds (adjust as needed)
setInterval(() => {
  syncPendingTransactions();
}, 15000);

startServer();
