const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      console.log('📋 Test Credentials:');
      console.log('   Email: test@example.com');
      console.log('   Password: password123');
      console.log('   Role:', existingUser.role);
      console.log('   Status:', existingUser.status);
      return;
    }

    // Create test user
    const testUser = new User({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'pm',
      status: 'active',
      department: 'IT',
      jobTitle: 'Project Manager',
      workTitle: 'Senior PM'
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('📋 Test Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('   Role: pm');
    console.log('   Status: active');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createTestUser();
