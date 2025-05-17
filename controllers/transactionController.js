const redisClient = require('../config/redis');
const { v4: uuidv4 } = require('uuid');
const { Transaction } = require('../models'); 
const LOCAL_QUEUE = 'local:transactions';

exports.saveLocalTransaction = async (req, res) => {
  try {
    const { amount, sender, receiver, type } = req.body;
    const deviceId = req.headers['device-id']; 

    if (!amount || !sender || !receiver || !type) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!deviceId) {
      return res.status(400).json({ message: 'device-id header is required.' });
    }

    const transaction = {
      id: uuidv4(),
      amount,
      sender,
      receiver,
      type,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
      deviceId 
    };

    await redisClient.rPush(LOCAL_QUEUE, JSON.stringify(transaction));

    res.status(201).json({
      message: 'Transaction stored locally',
      transaction
    });
  } catch (error) {
    console.error('Error saving local transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getLocalTransactions = async (req, res) => {
  const deviceId = req.headers['device-id'];
  if (!deviceId) return res.status(400).json({ message: 'Device ID required' });

  try {
    const queueKey = `local:transactions:${deviceId}`;
    const list = await redisClient.lRange(queueKey, 0, -1);
    const transactions = list.map(item => JSON.parse(item));

    res.json({ transactions });
  } catch (err) {
    console.error('Error fetching local transactions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getCentralTransactions = async (req, res) => {
  const deviceId = req.headers['device-id'];
  if (!deviceId) return res.status(400).json({ message: 'Device ID required' });

  try {
    const transactions = await Transaction.findAll({
      where: { deviceId },
      order: [['timestamp', 'DESC']],
    });

    res.json({ transactions });
  } catch (err) {
    console.error('Error fetching central transactions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSyncLogs = async (req, res) => {
  const deviceId = req.headers['device-id'];
  if (!deviceId) return res.status(400).json({ message: 'Device ID required' });

  try {
    const logKey = `sync:logs:${deviceId}`;
    const logs = await redisClient.lRange(logKey, 0, -1);
    const parsedLogs = logs.map(item => JSON.parse(item));

    res.json({ logs: parsedLogs });
  } catch (err) {
    console.error('Error fetching sync logs:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
