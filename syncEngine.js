const redisClient = require('./config/redis');
const { Op } = require('sequelize');
const { Transaction } = require('./models');

const LOCAL_QUEUE = 'local:transactions';
const MAX_RETRIES = 5;

// Utility: sleep for ms milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const syncTransactionToDB = async (tx) => {
  try {
    const exists = await Transaction.findOne({
      where: {
        [Op.or]: [
          { id: tx.id },
          {
            amount: tx.amount,
            sender: tx.sender,
            receiver: tx.receiver,
            timestamp: tx.timestamp,
          },
        ],
      },
    });

    if (exists) {
      return { success: true, message: 'Transaction already synced' };
    }

    await Transaction.create({
      id: tx.id,
      amount: tx.amount,
      sender: tx.sender,
      receiver: tx.receiver,
      type: tx.type,
      timestamp: tx.timestamp,
      status: 'synced',
      retryCount: tx.retryCount,
      deviceId: tx.deviceId,
        latitude: tx.latitude,
        longitude: tx.longitude,
        
    });

    return { success: true };
  } catch (err) {
    console.error('DB sync error:', err);
    return { success: false, error: err };
  }
};

const updateTransactionInRedis = async (tx) => {
  const list = await redisClient.lRange(LOCAL_QUEUE, 0, -1);
  const index = list.findIndex(item => {
    const obj = JSON.parse(item);
    return obj.id === tx.id;
  });

  if (index === -1) return false;

  await redisClient.lSet(LOCAL_QUEUE, index, JSON.stringify(tx));
  return true;
};

const syncPendingTransactions = async () => {
  console.log('Starting sync cycle...');
  try {
    const list = await redisClient.lRange(LOCAL_QUEUE, 0, -1);
    let pendingTxs = list
      .map(item => JSON.parse(item))
      .filter(tx => tx.status === 'pending' || tx.status === 'failed');

    if (pendingTxs.length === 0) {
      console.log('No pending transactions to sync.');
      return;
    }

    for (const tx of pendingTxs) {
      // Skip if deviceId missing
      if (!tx.deviceId) {
        console.warn(`Skipping transaction ${tx.id} because deviceId is missing.`);
        tx.status = 'failed';
        await updateTransactionInRedis(tx);
        continue;
      }

      // Check if max retries exceeded
      if (tx.retryCount >= MAX_RETRIES) {
        tx.status = 'failed';
        await updateTransactionInRedis(tx);
        console.log(`Transaction ${tx.id} failed after max retries.`);
        continue;
      }

      // Attempt sync
      const result = await syncTransactionToDB(tx);

      if (result.success) {
        tx.status = 'synced';
        await updateTransactionInRedis(tx);
        console.log(`Transaction ${tx.id} synced successfully.`);
      } else {
        // Sync failed — increment retryCount and set status to failed temporarily
        tx.retryCount++;
        tx.status = 'failed';
        await updateTransactionInRedis(tx);

        // Exponential backoff before next try
        const delay = Math.min(30000, 1000 * 2 ** tx.retryCount); // max 30s
        console.log(`Retrying transaction ${tx.id} after ${delay}ms...`);
        await sleep(delay);
      }
    }
  } catch (error) {
    console.error('Error during sync cycle:', error);
  }
};



module.exports = {
  syncPendingTransactions
};
