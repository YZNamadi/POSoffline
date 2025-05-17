const redisClient = require('./config/redis');

async function clearLocalTransactions() {
  try {
    // Connect if not connected
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    
    const result = await redisClient.del('local:transactions');
    console.log(`Redis key "local:transactions" deleted: ${result}`);

    // Optionally disconnect after operation
    await redisClient.disconnect();
  } catch (error) {
    console.error('Error clearing Redis local transactions:', error);
  }
}

module.exports = { clearLocalTransactions };
