const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cognitive_care';
  
  try {
    // Attempt Mongoose connection with a short timeout to prevent blocking if Mongo is not running
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500, // 2.5 seconds timeout
      connectTimeoutMS: 2500,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected successfully to: ${mongoURI}`);
  } catch (err) {
    isMongoConnected = false;
    console.log(`[Database] MongoDB not reachable (${err.message}).`);
    console.log(`[Database] Activating Built-in Auto-Persistence Mode (JSON File Store) for 100% zero-config operation!`);
  }
};

const getDBMode = () => isMongoConnected ? 'mongodb' : 'filestore';

module.exports = { connectDB, getDBMode, isMongoConnected: () => isMongoConnected };
