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

const createSampleUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create 5 Employees with different departments and roles
    const employees = [
      {
        fullName: 'Sarah Chen',
        email: 'sarah.chen@techcorp.com',
        password: 'Employee123!',
        role: 'employee',
        department: 'Software Engineering',
        jobTitle: 'Senior Frontend Developer',
        workTitle: 'React Specialist',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      },
      {
        fullName: 'Michael Rodriguez',
        email: 'michael.rodriguez@techcorp.com',
        password: 'Employee123!',
        role: 'employee',
        department: 'DevOps',
        jobTitle: 'DevOps Engineer',
        workTitle: 'Cloud Infrastructure Lead',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      },
      {
        fullName: 'Emily Watson',
        email: 'emily.watson@techcorp.com',
        password: 'Employee123!',
        role: 'employee',
        department: 'Quality Assurance',
        jobTitle: 'QA Tester',
        workTitle: 'Automation Testing Expert',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      },
      {
        fullName: 'David Kim',
        email: 'david.kim@techcorp.com',
        password: 'Employee123!',
        role: 'employee',
        department: 'Backend Development',
        jobTitle: 'Backend Developer',
        workTitle: 'Node.js & Database Specialist',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      },
      {
        fullName: 'Lisa Thompson',
        email: 'lisa.thompson@techcorp.com',
        password: 'Employee123!',
        role: 'employee',
        department: 'UI/UX Design',
        jobTitle: 'UI/UX Designer',
        workTitle: 'Product Design Lead',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      }
    ];

    // Create 5 Customers with different companies
    const customers = [
      {
        fullName: 'Robert Anderson',
        email: 'robert.anderson@globaltech.com',
        password: 'Customer123!',
        role: 'customer',
        company: 'GlobalTech Solutions',
        address: '456 Innovation Drive, San Francisco, CA 94105',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      },
      {
        fullName: 'Jennifer Martinez',
        email: 'jennifer.martinez@retailplus.com',
        password: 'Customer123!',
        role: 'customer',
        company: 'RetailPlus Inc',
        address: '789 Commerce Street, Chicago, IL 60601',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      },
      {
        fullName: 'William Brown',
        email: 'william.brown@healthcarecorp.com',
        password: 'Customer123!',
        role: 'customer',
        company: 'HealthcareCorp Systems',
        address: '321 Medical Plaza, Boston, MA 02115',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      },
      {
        fullName: 'Amanda Davis',
        email: 'amanda.davis@financegroup.com',
        password: 'Customer123!',
        role: 'customer',
        company: 'FinanceGroup Ltd',
        address: '654 Wall Street, New York, NY 10005',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      },
      {
        fullName: 'Christopher Lee',
        email: 'christopher.lee@manufacturing.com',
        password: 'Customer123!',
        role: 'customer',
        company: 'Manufacturing Dynamics',
        address: '987 Industrial Way, Detroit, MI 48201',
        status: 'active',
        createdBy: 'system',
        createdById: new mongoose.Types.ObjectId()
      }
    ];

    // Create 1 Project Manager
    const projectManager = {
      fullName: 'Alex Johnson',
      email: 'alex.johnson@techcorp.com',
      password: 'PM123!',
      role: 'pm',
      department: 'Project Management',
      jobTitle: 'Senior Project Manager',
      workTitle: 'Agile Project Lead',
      status: 'active',
      createdBy: 'system',
      createdById: new mongoose.Types.ObjectId()
    };

    // Combine all users
    const allUsers = [projectManager, ...employees, ...customers];

    // Create users
    console.log('\n🚀 Creating users...\n');
    
    for (const userData of allUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created ${user.role.toUpperCase()}: ${user.fullName} (${user.email})`);
    }

    console.log('\n🎉 All users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('='.repeat(50));
    
    console.log('\n👨‍💼 PROJECT MANAGER:');
    console.log(`Email: ${projectManager.email}`);
    console.log(`Password: ${projectManager.password}`);
    
    console.log('\n👥 EMPLOYEES (5):');
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.fullName} - ${emp.department}`);
      console.log(`   Email: ${emp.email} | Password: ${emp.password}`);
    });
    
    console.log('\n🏢 CUSTOMERS (5):');
    customers.forEach((cust, index) => {
      console.log(`${index + 1}. ${cust.fullName} - ${cust.company}`);
      console.log(`   Email: ${cust.email} | Password: ${cust.password}`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('Total Users Created: 11 (1 PM + 5 Employees + 5 Customers)');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Run the script
createSampleUsers();
