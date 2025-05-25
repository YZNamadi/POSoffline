const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
  },
  
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  sender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiver: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // models/Transaction.js (add fields)
latitude: {
  type: DataTypes.FLOAT,
  allowNull: true,
},
longitude: {
  type: DataTypes.FLOAT,
  allowNull: true,
},

}, {
  tableName: 'transactions',
  timestamps: false,
});

module.exports = Transaction;
