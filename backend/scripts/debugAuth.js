// Load environment variables first
require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ram312908_db_user:Ankit@cluster0.vigazjy.mongodb.net/Project-flow';

async function debugAuth() {
  try {
    console.log('🔍 Debugging Authentication...');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Not found');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Test employee authentication
    const employeeEmail = 'aditya@gmail.com';
    const employeePassword = 'Ankit@1399';
    
    console.log(`\n🔐 Testing employee: ${employeeEmail}`);
    
    // Find user
    const user = await User.findOne({ email: employeeEmail });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ User found: ${user.fullName} (${user.role})`);
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(employeePassword, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return;
    }
    
    console.log('✅ Password valid');
    
    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.log('❌ JWT_SECRET not found');
      return;
    }
    
    console.log('✅ JWT_SECRET found');
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );
    
    console.log('✅ JWT token generated');
    console.log('Token length:', token.length);
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ Token verified');
    console.log('Decoded token:', { id: decoded.id, role: decoded.role });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

debugAuth();
