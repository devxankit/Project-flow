const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');

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

const createSampleProjects = async () => {
  try {
    // Connect to database
    await connectDB();

    // Get all users from database
    const users = await User.find({ status: 'active' });
    const projectManagers = users.filter(user => user.role === 'pm');
    const employees = users.filter(user => user.role === 'employee');
    const customers = users.filter(user => user.role === 'customer');

    console.log(`Found ${projectManagers.length} PMs, ${employees.length} employees, ${customers.length} customers`);

    if (projectManagers.length === 0) {
      console.error('❌ No project managers found. Please create users first.');
      process.exit(1);
    }

    if (customers.length === 0) {
      console.error('❌ No customers found. Please create users first.');
      process.exit(1);
    }

    if (employees.length === 0) {
      console.error('❌ No employees found. Please create users first.');
      process.exit(1);
    }

    // Clear existing projects
    await Project.deleteMany({});
    console.log('Cleared existing projects');

    // Helper function to get random items from array
    const getRandomItems = (array, count) => {
      const shuffled = array.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    // Helper function to get random item from array
    const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

    // Helper function to get future date
    const getFutureDate = (daysFromNow) => {
      const date = new Date();
      date.setDate(date.getDate() + daysFromNow);
      return date;
    };

    // Helper function to get past date
    const getPastDate = (daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date;
    };

    // Sample project data
    const projectTemplates = [
      {
        name: "E-Commerce Platform Redesign",
        description: "Complete redesign and modernization of the existing e-commerce platform with improved user experience, mobile responsiveness, and performance optimization. Includes new payment gateway integration and advanced analytics dashboard.",
        priority: "high",
        status: "active",
        tags: ["ecommerce", "redesign", "mobile", "payment", "analytics"],
        dueDate: getFutureDate(45),
        startDate: getPastDate(10)
      },
      {
        name: "Healthcare Management System",
        description: "Development of a comprehensive healthcare management system for patient records, appointment scheduling, billing, and telemedicine features. Includes HIPAA compliance and integration with existing medical devices.",
        priority: "urgent",
        status: "active",
        tags: ["healthcare", "compliance", "telemedicine", "patient-records", "billing"],
        dueDate: getFutureDate(60),
        startDate: getPastDate(5)
      },
      {
        name: "Mobile Banking Application",
        description: "Secure mobile banking application with features including account management, money transfers, bill payments, investment tracking, and biometric authentication. Includes real-time notifications and fraud detection.",
        priority: "high",
        status: "planning",
        tags: ["mobile", "banking", "security", "biometric", "notifications"],
        dueDate: getFutureDate(90),
        startDate: new Date()
      },
      {
        name: "IoT Smart Home Dashboard",
        description: "Centralized dashboard for managing smart home devices including lighting, security, climate control, and energy monitoring. Features voice control integration and predictive maintenance alerts.",
        priority: "normal",
        status: "active",
        tags: ["iot", "smart-home", "dashboard", "voice-control", "energy"],
        dueDate: getFutureDate(30),
        startDate: getPastDate(15)
      },
      {
        name: "Supply Chain Optimization Platform",
        description: "AI-powered supply chain management platform with real-time tracking, demand forecasting, inventory optimization, and supplier relationship management. Includes blockchain integration for transparency.",
        priority: "high",
        status: "active",
        tags: ["supply-chain", "ai", "blockchain", "optimization", "tracking"],
        dueDate: getFutureDate(75),
        startDate: getPastDate(20)
      },
      {
        name: "Educational Learning Management System",
        description: "Comprehensive LMS with course creation, student enrollment, progress tracking, assessments, and virtual classroom features. Includes AI-powered personalized learning paths and analytics.",
        priority: "normal",
        status: "planning",
        tags: ["education", "lms", "virtual-classroom", "ai", "analytics"],
        dueDate: getFutureDate(120),
        startDate: getFutureDate(7)
      },
      {
        name: "Real Estate Property Management",
        description: "Complete property management solution for real estate agencies including property listings, tenant management, rent collection, maintenance tracking, and financial reporting.",
        priority: "normal",
        status: "on-hold",
        tags: ["real-estate", "property-management", "tenant", "maintenance", "financial"],
        dueDate: getFutureDate(100),
        startDate: getPastDate(30)
      },
      {
        name: "Food Delivery Aggregator Platform",
        description: "Multi-vendor food delivery platform with restaurant management, order tracking, payment processing, and delivery optimization. Includes customer reviews and loyalty programs.",
        priority: "urgent",
        status: "active",
        tags: ["food-delivery", "multi-vendor", "tracking", "optimization", "loyalty"],
        dueDate: getFutureDate(50),
        startDate: getPastDate(8)
      },
      {
        name: "Fitness and Wellness Tracking App",
        description: "Comprehensive fitness tracking application with workout plans, nutrition tracking, progress monitoring, and social features. Includes integration with wearable devices and health metrics.",
        priority: "low",
        status: "completed",
        tags: ["fitness", "wellness", "tracking", "wearables", "social"],
        dueDate: getPastDate(5),
        startDate: getPastDate(60),
        completedAt: getPastDate(5)
      },
      {
        name: "Blockchain-Based Voting System",
        description: "Secure and transparent voting system using blockchain technology for elections and polls. Features voter authentication, anonymous voting, and real-time result tabulation with audit trails.",
        priority: "high",
        status: "active",
        tags: ["blockchain", "voting", "security", "transparency", "audit"],
        dueDate: getFutureDate(40),
        startDate: getPastDate(12)
      }
    ];

    console.log('\n🚀 Creating 10 detailed projects...\n');

    // Create projects
    for (let i = 0; i < projectTemplates.length; i++) {
      const template = projectTemplates[i];
      
      // Get random PM, customer, and team members
      const projectManager = getRandomItem(projectManagers);
      const customer = getRandomItem(customers);
      const teamSize = Math.floor(Math.random() * 3) + 2; // 2-4 team members
      const assignedTeam = getRandomItems(employees, teamSize);

      // Create project data
      const projectData = {
        name: template.name,
        description: template.description,
        customer: customer._id,
        projectManager: projectManager._id,
        assignedTeam: assignedTeam.map(member => member._id),
        priority: template.priority,
        status: template.status,
        dueDate: template.dueDate,
        startDate: template.startDate,
        tags: template.tags,
        // Progress will be calculated automatically by the model based on milestones and tasks
        createdBy: projectManager._id,
        ...(template.completedAt && { completedAt: template.completedAt })
      };

      // Create the project
      const project = new Project(projectData);
      await project.save();

      // Update user relationships
      await User.findByIdAndUpdate(projectManager._id, {
        $push: { managedProjects: project._id }
      });

      await User.findByIdAndUpdate(customer._id, {
        $push: { customerProjects: project._id }
      });

      for (const teamMember of assignedTeam) {
        await User.findByIdAndUpdate(teamMember._id, {
          $push: { assignedProjects: project._id }
        });
      }

      console.log(`✅ Created Project ${i + 1}: "${project.name}"`);
      console.log(`   📋 Status: ${project.status} | Priority: ${project.priority}`);
      console.log(`   👤 PM: ${projectManager.fullName}`);
      console.log(`   🏢 Customer: ${customer.fullName} (${customer.company})`);
      console.log(`   👥 Team: ${assignedTeam.map(member => member.fullName).join(', ')}`);
      console.log(`   📅 Due: ${project.dueDate.toLocaleDateString()}`);
      console.log(`   📊 Progress: ${project.progress}% (based on milestones and tasks)`);
      console.log('');
    }

    console.log('🎉 All 10 projects created successfully!');
    console.log('\n📊 Project Summary:');
    console.log('='.repeat(60));
    
    const projects = await Project.find().populate('customer projectManager assignedTeam', 'fullName company');
    
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}`);
      console.log(`   Status: ${project.status} | Priority: ${project.priority} | Progress: ${project.progress}%`);
      console.log(`   Customer: ${project.customer.fullName} (${project.customer.company})`);
      console.log(`   Team Size: ${project.assignedTeam.length} members`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log(`Total Projects Created: ${projects.length}`);

  } catch (error) {
    console.error('❌ Error creating projects:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Run the script
createSampleProjects();
