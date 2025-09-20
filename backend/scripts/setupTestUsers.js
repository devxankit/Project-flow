const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const bcrypt = require('bcryptjs');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const setupTestUsers = async () => {
  console.log('🔧 Setting up test users and data...');
  
  try {
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create test customer
    const customer = await User.findOneAndUpdate(
      { email: 'testcustomer@example.com' },
      {
        fullName: 'Test Customer',
        email: 'testcustomer@example.com',
        password: hashedPassword,
        role: 'customer',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test customer created:', customer.email);

    // Create test PM
    const pm = await User.findOneAndUpdate(
      { email: 'testpm@example.com' },
      {
        fullName: 'Test Project Manager',
        email: 'testpm@example.com',
        password: hashedPassword,
        role: 'project-manager',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test PM created:', pm.email);

    // Create test employee
    const employee = await User.findOneAndUpdate(
      { email: 'testemployee@example.com' },
      {
        fullName: 'Test Employee',
        email: 'testemployee@example.com',
        password: hashedPassword,
        role: 'employee',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test employee created:', employee.email);

    // Create test project
    const project = await Project.findOneAndUpdate(
      { name: 'Test Task Request Project' },
      {
        name: 'Test Task Request Project',
        description: 'A test project for task request functionality',
        customer: customer._id,
        projectManager: pm._id,
        status: 'active',
        startDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        budget: 50000
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test project created:', project.name);

    // Create test milestone
    const milestone = await Milestone.findOneAndUpdate(
      { title: 'Test Milestone for Task Requests' },
      {
        title: 'Test Milestone for Task Requests',
        description: 'A test milestone for task request functionality',
        project: project._id,
        startDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        progress: 0
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test milestone created:', milestone.title);

    console.log('\n🎉 Test data setup completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Customer: testcustomer@example.com / password123');
    console.log('   PM: testpm@example.com / password123');
    console.log('   Employee: testemployee@example.com / password123');
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await setupTestUsers();
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

if (require.main === module) {
  main();
}

module.exports = { setupTestUsers };
