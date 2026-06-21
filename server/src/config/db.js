require('dotenv').config();

const mongoose = require('mongoose');
const { isProduction } = require('./env');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    if (isProduction()) {
      throw new Error('MONGODB_URI is required when NODE_ENV=production.');
    }

    return {
      connected: false,
      mode: 'no-uri'
    };
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });

  return {
    connected: true,
    mode: 'mongodb'
  };
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  isMongoConnected
};
