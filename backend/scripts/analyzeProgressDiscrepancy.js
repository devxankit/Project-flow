// Load environment variables first
require('dotenv').config({ path: './.env' });

const mongoose = require('mongoose');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ram312908_db_user:Ankit@cluster0.vigazjy.mongodb.net/Project-flow';

async function analyzeProgressDiscrepancy() {
  try {
    console.log('🔍 Analyzing Progress Discrepancy...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Find the "Write the Frontend" milestone
    const milestone = await Milestone.findOne({ title: "Write the Frontend" }).populate('project');
    if (!milestone) {
      console.log('❌ "Write the Frontend" milestone not found');
      return;
    }
    
    console.log(`\n📋 Found milestone: ${milestone.title}`);
    console.log(`Project: ${milestone.project.name}`);
    console.log(`Milestone ID: ${milestone._id}`);
    console.log(`Current progress in DB: ${milestone.progress}%`);
    
    // Get all tasks for this milestone
    const allTasks = await Task.find({ milestone: milestone._id });
    console.log(`\n📝 All tasks in this milestone (${allTasks.length}):`);
    
    allTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.title} - Status: ${task.status}`);
    });
    
    // Count tasks by status
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = allTasks.filter(task => task.status === 'in-progress').length;
    const pendingTasks = allTasks.filter(task => task.status === 'pending').length;
    
    console.log(`\n📊 Task Status Breakdown:`);
    console.log(`  - Total tasks: ${totalTasks}`);
    console.log(`  - Completed: ${completedTasks}`);
    console.log(`  - In Progress: ${inProgressTasks}`);
    console.log(`  - Pending: ${pendingTasks}`);
    
    // Calculate expected progress
    const expectedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    console.log(`\n🧮 Progress Calculations:`);
    console.log(`  - Expected progress: ${expectedProgress}% (${completedTasks}/${totalTasks})`);
    console.log(`  - Database progress: ${milestone.progress}%`);
    console.log(`  - Match: ${expectedProgress === milestone.progress ? '✅ YES' : '❌ NO'}`);
    
    // Check if there are any tasks assigned to specific users
    console.log(`\n👤 Task Assignments:`);
    const tasksWithAssignments = await Task.find({ milestone: milestone._id }).populate('assignedTo', 'fullName email');
    
    tasksWithAssignments.forEach((task, index) => {
      const assignedTo = task.assignedTo ? task.assignedTo.fullName : 'Unassigned';
      console.log(`  ${index + 1}. ${task.title} - Assigned to: ${assignedTo} - Status: ${task.status}`);
    });
    
    // Check if there's a specific user we should check for
    console.log(`\n🔍 Checking for specific user assignments...`);
    
    // Find employee user (Aditya)
    const employee = await User.findOne({ email: 'aditya@gmail.com' });
    if (employee) {
      console.log(`\n👤 Found employee: ${employee.fullName} (${employee.email})`);
      
      // Get tasks assigned to this specific employee
      const employeeTasks = await Task.find({ 
        milestone: milestone._id,
        assignedTo: { $in: [employee._id] }
      });
      
      console.log(`\n📝 Tasks assigned to ${employee.fullName} (${employeeTasks.length}):`);
      employeeTasks.forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.title} - Status: ${task.status}`);
      });
      
      const employeeCompletedTasks = employeeTasks.filter(task => task.status === 'completed').length;
      const employeeTotalTasks = employeeTasks.length;
      const employeeProgress = employeeTotalTasks > 0 ? Math.round((employeeCompletedTasks / employeeTotalTasks) * 100) : 0;
      
      console.log(`\n📊 Employee-specific progress:`);
      console.log(`  - Employee tasks: ${employeeTotalTasks}`);
      console.log(`  - Employee completed: ${employeeCompletedTasks}`);
      console.log(`  - Employee progress: ${employeeProgress}% (${employeeCompletedTasks}/${employeeTotalTasks})`);
      
      // This might explain the "My Tasks: 2/3" display
      if (employeeTotalTasks === 3 && employeeCompletedTasks === 2) {
        console.log(`\n🎯 FOUND THE DISCREPANCY!`);
        console.log(`  - Milestone progress (33%): Based on ALL tasks in milestone`);
        console.log(`  - "My Tasks" (2/3): Based on tasks assigned to specific employee`);
        console.log(`  - The frontend is showing employee-specific task count, not milestone progress!`);
      }
    }
    
    // Test the milestone progress calculation method
    console.log(`\n🧪 Testing milestone progress calculation method...`);
    const calculatedProgress = await milestone.calculateProgress();
    console.log(`  - Method result: ${calculatedProgress}%`);
    console.log(`  - Database value: ${milestone.progress}%`);
    console.log(`  - Match: ${calculatedProgress === milestone.progress ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n✅ Analysis completed!');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

analyzeProgressDiscrepancy();
