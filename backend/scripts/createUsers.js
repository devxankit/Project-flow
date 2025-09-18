const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const createUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create users with different roles
    const users = [
      {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        password: 'TempPass123!',
        role: 'pm',
        department: 'Management',
        jobTitle: 'Project Manager',
        workTitle: 'project-manager',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      },
      {
        fullName: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'TempPass456!',
        role: 'employee',
        department: 'Engineering',
        jobTitle: 'Web Developer',
        workTitle: 'web-developer',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      },
      {
        fullName: 'Bob Johnson',
        email: 'bob.johnson@company.com',
        password: 'TempPass789!',
        role: 'customer',
        company: 'Acme Corp',
        address: '123 Business St, New York, NY',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      }
    ];

    // Create users
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.fullName} (${user.role})`);
    }

    console.log('\n✅ All users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('PM: john.doe@example.com / TempPass123!');
    console.log('Employee: jane.smith@example.com / TempPass456!');
    console.log('Customer: bob.johnson@company.com / TempPass789!');

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Run the script
createUsers();
