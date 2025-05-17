const { clearLocalTransactions } = require('./redisHelpers');

(async () => {
  await clearLocalTransactions();
  process.exit(0);
})();
