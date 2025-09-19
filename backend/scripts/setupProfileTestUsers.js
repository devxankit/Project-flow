const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Test users data
const testUsers = [
  {
    fullName: 'Test PM',
    email: 'pm@test.com',
    password: 'password123',
    role: 'pm',
    status: 'active',
    department: 'Management',
    jobTitle: 'Project Manager',
    workTitle: 'Senior PM',
    phone: '+1234567890',
    location: 'Test City, Test State',
    skills: ['Project Management', 'Leadership', 'Communication']
  },
  {
    fullName: 'Test Employee',
    email: 'employee@test.com',
    password: 'password123',
    role: 'employee',
    status: 'active',
    department: 'Engineering',
    jobTitle: 'Software Developer',
    workTitle: 'Frontend Developer',
    phone: '+1234567891',
    location: 'Test City, Test State',
    skills: ['JavaScript', 'React', 'Node.js']
  },
  {
    fullName: 'Test Customer',
    email: 'customer@test.com',
    password: 'password123',
    role: 'customer',
    status: 'active',
    company: 'Test Company',
    address: '123 Test Street, Test City, Test State 12345',
    phone: '+1234567892',
    location: 'Test City, Test State'
  }
];

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectflow');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create test users
const createTestUsers = async () => {
  try {
    console.log('🚀 Setting up profile test users...\n');
    
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, updating...`);
        
        // Update existing user
        Object.assign(existingUser, userData);
        await existingUser.save();
        console.log(`✅ Updated user: ${userData.fullName} (${userData.role})`);
      } else {
        // Create new user
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.fullName} (${userData.role})`);
      }
    }
    
    console.log('\n🎉 Profile test users setup completed!');
    console.log('\n📋 Test Users Created:');
    console.log('=====================');
    
    for (const userData of testUsers) {
      console.log(`👤 ${userData.fullName}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Department: ${userData.department || 'N/A'}`);
      console.log(`   Company: ${userData.company || 'N/A'}`);
      console.log('');
    }
    
    console.log('🧪 You can now run the profile functionality tests!');
    console.log('   Command: node scripts/testProfileFunctionality.js');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
};

// Clean up test users
const cleanupTestUsers = async () => {
  try {
    console.log('🧹 Cleaning up profile test users...\n');
    
    const emails = testUsers.map(user => user.email);
    const result = await User.deleteMany({ email: { $in: emails } });
    
    console.log(`✅ Deleted ${result.deletedCount} test users`);
    
  } catch (error) {
    console.error('❌ Error cleaning up test users:', error);
  }
};

// Main function
const main = async () => {
  const command = process.argv[2];
  
  await connectDB();
  
  if (command === 'cleanup') {
    await cleanupTestUsers();
  } else {
    await createTestUsers();
  }
  
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
};

// Run if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createTestUsers,
  cleanupTestUsers,
  testUsers
};
