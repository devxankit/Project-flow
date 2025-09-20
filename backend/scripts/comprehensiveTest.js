// Load environment variables first
require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ram312908_db_user:Ankit@cluster0.vigazjy.mongodb.net/Project-flow';

// Test credentials
const testUsers = {
  pm: { email: 'ankit@gmail.com', password: 'Ankit@1399' },
  customer: { email: 'abhay@gmail.com', password: 'Ankit@1399' },
  employee: { email: 'aditya@gmail.com', password: 'Ankit@1399' }
};

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Test user authentication
async function testUserAuthentication() {
  console.log('\n🔐 Testing User Authentication...');
  
  for (const [role, credentials] of Object.entries(testUsers)) {
    try {
      console.log(`\nTesting ${role.toUpperCase()} login...`);
      
      // Find user
      const user = await User.findOne({ email: credentials.email });
      if (!user) {
        console.log(`❌ User not found: ${credentials.email}`);
        continue;
      }
      
      console.log(`✅ User found: ${user.fullName} (${user.role})`);
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordValid) {
        console.log(`❌ Invalid password for: ${credentials.email}`);
        continue;
      }
      
      console.log(`✅ Password valid for: ${credentials.email}`);
      
      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.log(`❌ JWT_SECRET not found in environment variables`);
        continue;
      }
      
      const token = jwt.sign(
        { id: user._id, role: user.role },
        jwtSecret,
        { expiresIn: '7d' }
      );
      
      console.log(`✅ JWT token generated for: ${credentials.email}`);
      
      // Store token for API testing
      testUsers[role].user = user;
      testUsers[role].token = token;
      
    } catch (error) {
      console.error(`❌ Error testing ${role} authentication:`, error.message);
    }
  }
}

// Test project data
async function testProjectData() {
  console.log('\n📊 Testing Project Data...');
  
  try {
    const projects = await Project.find({}).populate('customer projectManager assignedTeam');
    console.log(`✅ Found ${projects.length} projects`);
    
    for (const project of projects) {
      console.log(`\nProject: ${project.name}`);
      console.log(`  - Customer: ${project.customer?.fullName || 'N/A'}`);
      console.log(`  - PM: ${project.projectManager?.fullName || 'N/A'}`);
      console.log(`  - Team Size: ${project.assignedTeam?.length || 0}`);
      console.log(`  - Progress: ${project.progress}%`);
      console.log(`  - Status: ${project.status}`);
    }
    
    return projects;
  } catch (error) {
    console.error('❌ Error testing project data:', error.message);
    return [];
  }
}

// Test milestone data and progress
async function testMilestoneData() {
  console.log('\n🎯 Testing Milestone Data and Progress...');
  
  try {
    const milestones = await Milestone.find({}).populate('project assignedTo');
    console.log(`✅ Found ${milestones.length} milestones`);
    
    for (const milestone of milestones) {
      console.log(`\nMilestone: ${milestone.title}`);
      console.log(`  - Project: ${milestone.project?.name || 'N/A'}`);
      console.log(`  - Assigned To: ${milestone.assignedTo?.fullName || 'N/A'}`);
      console.log(`  - Status: ${milestone.status}`);
      console.log(`  - Progress: ${milestone.progress}%`);
      
      // Count tasks for this milestone
      const totalTasks = await Task.countDocuments({ milestone: milestone._id });
      const completedTasks = await Task.countDocuments({ 
        milestone: milestone._id, 
        status: 'completed' 
      });
      
      console.log(`  - Total Tasks: ${totalTasks}`);
      console.log(`  - Completed Tasks: ${completedTasks}`);
      
      // Calculate expected progress
      let expectedProgress = 0;
      if (totalTasks > 0) {
        expectedProgress = Math.round((completedTasks / totalTasks) * 100);
      }
      
      console.log(`  - Expected Progress: ${expectedProgress}%`);
      
      // Check if progress matches
      if (milestone.progress !== expectedProgress) {
        console.log(`  ❌ Progress mismatch! DB: ${milestone.progress}%, Expected: ${expectedProgress}%`);
        
        // Test the calculateProgress method
        console.log(`  🔄 Testing calculateProgress method...`);
        try {
          const newProgress = await milestone.calculateProgress();
          console.log(`  ✅ calculateProgress returned: ${newProgress}%`);
          
          // Verify the milestone was updated
          const updatedMilestone = await Milestone.findById(milestone._id);
          console.log(`  ✅ Updated milestone progress: ${updatedMilestone.progress}%`);
        } catch (calcError) {
          console.log(`  ❌ calculateProgress failed:`, calcError.message);
        }
      } else {
        console.log(`  ✅ Progress is correct`);
      }
    }
    
    return milestones;
  } catch (error) {
    console.error('❌ Error testing milestone data:', error.message);
    return [];
  }
}

// Test task data
async function testTaskData() {
  console.log('\n📋 Testing Task Data...');
  
  try {
    const tasks = await Task.find({}).populate('milestone assignedTo project');
    console.log(`✅ Found ${tasks.length} tasks`);
    
    // Group tasks by milestone
    const tasksByMilestone = {};
    for (const task of tasks) {
      const milestoneId = task.milestone?._id?.toString() || 'no-milestone';
      if (!tasksByMilestone[milestoneId]) {
        tasksByMilestone[milestoneId] = {
          milestone: task.milestone?.title || 'No Milestone',
          tasks: []
        };
      }
      tasksByMilestone[milestoneId].tasks.push(task);
    }
    
    for (const [milestoneId, data] of Object.entries(tasksByMilestone)) {
      console.log(`\nMilestone: ${data.milestone}`);
      console.log(`  - Total Tasks: ${data.tasks.length}`);
      
      const statusCounts = {};
      for (const task of data.tasks) {
        statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
      }
      
      for (const [status, count] of Object.entries(statusCounts)) {
        console.log(`    - ${status}: ${count}`);
      }
    }
    
    return tasks;
  } catch (error) {
    console.error('❌ Error testing task data:', error.message);
    return [];
  }
}

// Test employee access to projects and milestones
async function testEmployeeAccess() {
  console.log('\n👤 Testing Employee Access...');
  
  const employee = testUsers.employee.user;
  if (!employee) {
    console.log('❌ Employee user not found');
    return;
  }
  
  try {
    // Test employee's assigned projects
    const employeeProjects = await Project.find({
      assignedTeam: { $in: [employee._id] }
    });
    
    console.log(`✅ Employee ${employee.fullName} has access to ${employeeProjects.length} projects`);
    
    for (const project of employeeProjects) {
      console.log(`\nProject: ${project.name}`);
      
      // Test milestone access for this project
      const milestones = await Milestone.find({ project: project._id });
      console.log(`  - Milestones: ${milestones.length}`);
      
      for (const milestone of milestones) {
        console.log(`    - ${milestone.title}: ${milestone.progress}% progress`);
        
        // Test task access for this milestone
        const tasks = await Task.find({ 
          milestone: milestone._id,
          assignedTo: { $in: [employee._id] }
        });
        console.log(`      - Employee's tasks: ${tasks.length}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing employee access:', error.message);
  }
}

// Test the recalculate progress endpoint logic
async function testRecalculateProgressLogic() {
  console.log('\n🔄 Testing Recalculate Progress Logic...');
  
  try {
    // Find a milestone with tasks
    const milestone = await Milestone.findOne({}).populate('project');
    if (!milestone) {
      console.log('❌ No milestones found');
      return;
    }
    
    console.log(`Testing milestone: ${milestone.title}`);
    
    // Simulate the recalculate progress logic
    const employee = testUsers.employee.user;
    if (!employee) {
      console.log('❌ Employee user not found');
      return;
    }
    
    // Check if employee has access to this project
    const project = await Project.findOne({
      _id: milestone.project._id,
      assignedTeam: { $in: [employee._id] }
    });
    
    if (!project) {
      console.log(`❌ Employee ${employee.fullName} does not have access to project ${milestone.project.name}`);
      return;
    }
    
    console.log(`✅ Employee has access to project: ${project.name}`);
    
    // Test the calculateProgress method
    console.log(`🔄 Testing calculateProgress method...`);
    const newProgress = await milestone.calculateProgress();
    console.log(`✅ Progress recalculated: ${newProgress}%`);
    
    // Verify the milestone was updated
    const updatedMilestone = await Milestone.findById(milestone._id);
    console.log(`✅ Updated milestone progress: ${updatedMilestone.progress}%`);
    
  } catch (error) {
    console.error('❌ Error testing recalculate progress logic:', error.message);
  }
}

// Main test function
async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Test Suite...');
  console.log('=====================================');
  
  try {
    // Connect to database
    await connectDB();
    
    // Test user authentication
    await testUserAuthentication();
    
    // Test project data
    const projects = await testProjectData();
    
    // Test milestone data and progress
    const milestones = await testMilestoneData();
    
    // Test task data
    const tasks = await testTaskData();
    
    // Test employee access
    await testEmployeeAccess();
    
    // Test recalculate progress logic
    await testRecalculateProgressLogic();
    
    console.log('\n✅ Comprehensive Test Suite Completed!');
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
runComprehensiveTest();
