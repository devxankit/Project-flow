const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const clearUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear all users
    const result = await User.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} users from database`);

  } catch (error) {
    console.error('Error clearing users:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Run the script
clearUsers();
