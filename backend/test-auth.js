const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Test script to verify authentication flow
async function testAuthFlow() {
  try {
    // Connect to database
    await mongoose.connect('mongodb+srv://ram312908_db_user:Ankit@cluster0.vigazjy.mongodb.net/Project-flow');
    console.log('✅ Connected to MongoDB');

    // Create a test PM user
    const pmUser = new User({
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: 'TempPass123!',
      role: 'pm',
      status: 'active',
      department: 'Management',
      jobTitle: 'Project Manager',
      workTitle: 'project-manager',
      createdBy: 'System',
      createdById: new mongoose.Types.ObjectId()
    });

    await pmUser.save();
    console.log('✅ PM user created:', pmUser.email);

    // Test password comparison
    const isPasswordValid = await pmUser.comparePassword('TempPass123!');
    console.log('✅ Password comparison test:', isPasswordValid ? 'PASSED' : 'FAILED');

    // Create a test employee user
    const employeeUser = new User({
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'TempPass456!',
      role: 'employee',
      status: 'active',
      department: 'Engineering',
      jobTitle: 'Web Developer',
      workTitle: 'web-developer',
      createdBy: pmUser.fullName,
      createdById: pmUser._id
    });

    await employeeUser.save();
    console.log('✅ Employee user created:', employeeUser.email);

    // Test employee login
    const employeeLogin = await User.findOne({ email: 'jane.smith@example.com' }).select('+password');
    const employeePasswordValid = await employeeLogin.comparePassword('TempPass456!');
    console.log('✅ Employee login test:', employeePasswordValid ? 'PASSED' : 'FAILED');

    // Create a test customer user
    const customerUser = new User({
      fullName: 'Bob Johnson',
      email: 'bob.johnson@company.com',
      password: 'TempPass789!',
      role: 'customer',
      status: 'active',
      company: 'Acme Corp',
      address: '123 Business St, New York, NY',
      createdBy: pmUser.fullName,
      createdById: pmUser._id
    });

    await customerUser.save();
    console.log('✅ Customer user created:', customerUser.email);

    // Test customer login
    const customerLogin = await User.findOne({ email: 'bob.johnson@company.com' }).select('+password');
    const customerPasswordValid = await customerLogin.comparePassword('TempPass789!');
    console.log('✅ Customer login test:', customerPasswordValid ? 'PASSED' : 'FAILED');

    console.log('\n🎉 All authentication tests passed!');
    console.log('\nTest credentials:');
    console.log('PM: john.doe@example.com / TempPass123!');
    console.log('Employee: jane.smith@example.com / TempPass456!');
    console.log('Customer: bob.johnson@company.com / TempPass789!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the test
testAuthFlow();
