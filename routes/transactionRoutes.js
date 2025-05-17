const express = require('express');
const router = express.Router();
const {
  saveLocalTransaction,
  getLocalTransactions,
    getCentralTransactions,
    getSyncLogs
} = require('../controllers/transactionController');

router.post('/transactions/local', saveLocalTransaction);
router.get('/transactions/local', getLocalTransactions);
router.get('/transactions/central', getCentralTransactions);
router.get('/sync-logs', getSyncLogs);


module.exports = router;
