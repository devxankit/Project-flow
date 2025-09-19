const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');

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

// Sample project data with short, realistic titles
const projectData = [
  {
    name: "E-Commerce Platform",
    description: "Build a modern e-commerce platform with payment integration and inventory management",
    priority: "high",
    status: "active",
    tags: ["web", "ecommerce", "payment"]
  },
  {
    name: "Mobile Banking App",
    description: "Develop a secure mobile banking application with biometric authentication",
    priority: "urgent",
    status: "active",
    tags: ["mobile", "banking", "security"]
  },
  {
    name: "CRM System",
    description: "Create a customer relationship management system for sales teams",
    priority: "normal",
    status: "active",
    tags: ["crm", "sales", "management"]
  },
  {
    name: "IoT Dashboard",
    description: "Build a real-time dashboard for monitoring IoT devices and sensors",
    priority: "high",
    status: "active",
    tags: ["iot", "dashboard", "monitoring"]
  },
  {
    name: "Learning Management",
    description: "Develop an online learning platform with video streaming and assessments",
    priority: "normal",
    status: "active",
    tags: ["education", "video", "learning"]
  },
  {
    name: "Inventory Tracker",
    description: "Create an inventory tracking system with barcode scanning capabilities",
    priority: "normal",
    status: "active",
    tags: ["inventory", "barcode", "tracking"]
  },
  {
    name: "Social Media Analytics",
    description: "Build analytics dashboard for social media performance tracking",
    priority: "low",
    status: "active",
    tags: ["analytics", "social", "dashboard"]
  },
  {
    name: "Food Delivery App",
    description: "Develop a food delivery application with real-time tracking",
    priority: "high",
    status: "active",
    tags: ["food", "delivery", "tracking"]
  },
  {
    name: "Healthcare Portal",
    description: "Create a patient portal for healthcare providers and patients",
    priority: "urgent",
    status: "active",
    tags: ["healthcare", "portal", "patient"]
  },
  {
    name: "Project Management Tool",
    description: "Build a comprehensive project management tool with team collaboration",
    priority: "normal",
    status: "active",
    tags: ["project", "management", "collaboration"]
  }
];

// Sample milestone data
const milestoneTemplates = [
  {
    titles: ["Planning & Setup", "Core Development", "Testing & Deployment"],
    descriptions: [
      "Project planning, requirement analysis, and initial setup",
      "Core feature development and implementation",
      "Testing, bug fixes, and production deployment"
    ]
  },
  {
    titles: ["Design Phase", "Development", "Integration", "Launch"],
    descriptions: [
      "UI/UX design and wireframing",
      "Feature development and coding",
      "System integration and API connections",
      "Final testing and product launch"
    ]
  },
  {
    titles: ["Foundation", "Features", "Polish"],
    descriptions: [
      "Project foundation and basic structure",
      "Core features and functionality",
      "UI polish and final optimizations"
    ]
  }
];

// Sample task data
const taskTemplates = [
  {
    titles: ["Setup Environment", "Create Database Schema", "Implement Authentication"],
    descriptions: [
      "Set up development environment and project structure",
      "Design and create database schema and models",
      "Implement user authentication and authorization"
    ],
    priorities: ["high", "high", "normal"]
  },
  {
    titles: ["Design UI Components", "Build API Endpoints", "Write Unit Tests"],
    descriptions: [
      "Create reusable UI components and layouts",
      "Develop REST API endpoints and business logic",
      "Write comprehensive unit tests for all modules"
    ],
    priorities: ["normal", "high", "normal"]
  },
  {
    titles: ["Integration Testing", "Performance Optimization", "Documentation"],
    descriptions: [
      "Perform integration testing and bug fixes",
      "Optimize application performance and loading times",
      "Create user documentation and API docs"
    ],
    priorities: ["high", "normal", "low"]
  }
];

const seedProjectsData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    await Task.deleteMany({});
    await Milestone.deleteMany({});
    await Project.deleteMany({});
    console.log('✅ Cleared existing projects, milestones, and tasks');

    // Get existing users
    const customers = await User.find({ role: 'customer' });
    const employees = await User.find({ role: 'employee' });
    const pms = await User.find({ role: 'pm' });

    if (customers.length === 0 || employees.length === 0 || pms.length === 0) {
      throw new Error('Insufficient users in database. Need at least 1 customer, 1 employee, and 1 PM.');
    }

    console.log(`📊 Found ${customers.length} customers, ${employees.length} employees, ${pms.length} PMs`);

    const createdProjects = [];
    const createdMilestones = [];
    const createdTasks = [];

    // Create 10 projects
    for (let i = 0; i < 10; i++) {
      const projectInfo = projectData[i];
      const customer = customers[i % customers.length];
      const pm = pms[i % pms.length];
      
      // Select 2-4 random employees for the team
      const teamSize = Math.floor(Math.random() * 3) + 2; // 2-4 employees
      const shuffledEmployees = [...employees].sort(() => 0.5 - Math.random());
      const assignedTeam = shuffledEmployees.slice(0, teamSize);

      // Calculate project dates
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Started 0-30 days ago
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 60) + 30); // Due in 30-90 days

      const project = new Project({
        ...projectInfo,
        customer: customer._id,
        projectManager: pm._id,
        assignedTeam: assignedTeam.map(emp => emp._id),
        startDate,
        dueDate,
        createdBy: pm._id,
        lastModifiedBy: pm._id
      });

      await project.save();
      createdProjects.push(project);
      console.log(`✅ Created project: ${project.name} (Customer: ${customer.fullName})`);

      // Create 2-3 milestones for each project
      const milestoneTemplate = milestoneTemplates[i % milestoneTemplates.length];
      const numMilestones = Math.floor(Math.random() * 2) + 2; // 2-3 milestones
      
      for (let j = 0; j < numMilestones; j++) {
        const milestoneTitle = milestoneTemplate.titles[j];
        const milestoneDesc = milestoneTemplate.descriptions[j];
        
        // Calculate milestone due date
        const milestoneDueDate = new Date(startDate);
        const milestoneProgress = (j + 1) / numMilestones;
        const daysDiff = Math.floor((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        milestoneDueDate.setDate(milestoneDueDate.getDate() + Math.floor(daysDiff * milestoneProgress));

        // Assign milestone to 1-2 random team members
        const assignedTo = assignedTeam.slice(0, Math.floor(Math.random() * 2) + 1);

        // Set milestone status and progress
        const statuses = ['pending', 'in-progress', 'completed'];
        const status = j === 0 ? 'completed' : (j === 1 ? 'in-progress' : 'pending');
        const progress = status === 'completed' ? 100 : (status === 'in-progress' ? Math.floor(Math.random() * 60) + 20 : 0);

        const milestone = new Milestone({
          title: milestoneTitle,
          description: milestoneDesc,
          project: project._id,
          sequence: j + 1,
          dueDate: milestoneDueDate,
          status,
          priority: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)],
          progress,
          assignedTo: assignedTo.map(emp => emp._id),
          createdBy: pm._id,
          completedAt: status === 'completed' ? new Date() : null,
          completedBy: status === 'completed' ? assignedTo[0]._id : null
        });

        await milestone.save();
        createdMilestones.push(milestone);
        console.log(`  📍 Created milestone: ${milestone.title} (${status}, ${progress}%)`);

        // Create 2-3 tasks for each milestone
        const taskTemplate = taskTemplates[j % taskTemplates.length];
        const numTasks = Math.floor(Math.random() * 2) + 2; // 2-3 tasks
        
        for (let k = 0; k < numTasks; k++) {
          const taskTitle = taskTemplate.titles[k] || `Task ${k + 1}`;
          const taskDesc = taskTemplate.descriptions[k] || `Complete ${taskTitle.toLowerCase()}`;
          const taskPriority = taskTemplate.priorities[k] || 'normal';

          // Calculate task due date (within milestone timeframe)
          const taskDueDate = new Date(milestoneDueDate);
          const daysBeforeMilestone = Math.floor(Math.random() * 7) + 1; // Due 1-7 days before milestone
          taskDueDate.setDate(taskDueDate.getDate() - daysBeforeMilestone);

          // Assign task to 1 random team member
          const taskAssignee = assignedTeam[Math.floor(Math.random() * assignedTeam.length)];

          // Set task status based on milestone status
          let taskStatus = 'pending';
          if (milestone.status === 'completed') {
            taskStatus = Math.random() > 0.2 ? 'completed' : 'in-progress'; // 80% completed, 20% in-progress
          } else if (milestone.status === 'in-progress') {
            taskStatus = Math.random() > 0.5 ? 'in-progress' : 'completed'; // 50% in-progress, 50% completed
          }

          const task = new Task({
            title: taskTitle,
            description: taskDesc,
            milestone: milestone._id,
            project: project._id,
            status: taskStatus,
            priority: taskPriority,
            assignedTo: [taskAssignee._id],
            dueDate: taskDueDate,
            createdBy: pm._id,
            completedAt: taskStatus === 'completed' ? new Date() : null,
            completedBy: taskStatus === 'completed' ? taskAssignee._id : null
          });

          await task.save();
          createdTasks.push(task);
          console.log(`    📋 Created task: ${task.title} (${taskStatus})`);
        }
      }
    }

    // Update user project counts
    for (const customer of customers) {
      const customerProjects = await Project.countDocuments({ customer: customer._id });
      await User.findByIdAndUpdate(customer._id, { projects: customerProjects });
    }

    for (const pm of pms) {
      const pmProjects = await Project.countDocuments({ projectManager: pm._id });
      await User.findByIdAndUpdate(pm._id, { projects: pmProjects });
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Projects created: ${createdProjects.length}`);
    console.log(`   - Milestones created: ${createdMilestones.length}`);
    console.log(`   - Tasks created: ${createdTasks.length}`);
    
    // Show some statistics
    const completedMilestones = createdMilestones.filter(m => m.status === 'completed').length;
    const inProgressMilestones = createdMilestones.filter(m => m.status === 'in-progress').length;
    const completedTasks = createdTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = createdTasks.filter(t => t.status === 'in-progress').length;
    
    console.log(`\n📈 Progress Statistics:`);
    console.log(`   - Completed milestones: ${completedMilestones}/${createdMilestones.length}`);
    console.log(`   - In-progress milestones: ${inProgressMilestones}/${createdMilestones.length}`);
    console.log(`   - Completed tasks: ${completedTasks}/${createdTasks.length}`);
    console.log(`   - In-progress tasks: ${inProgressTasks}/${createdTasks.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Run the script
seedProjectsData();
