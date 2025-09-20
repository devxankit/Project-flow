// Load environment variables first
require('dotenv').config({ path: './.env' });

const mongoose = require('mongoose');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ram312908_db_user:Ankit@cluster0.vigazjy.mongodb.net/Project-flow';

async function fixSpecificMilestone() {
  try {
    console.log('🔧 Fixing "Write the Frontend" Milestone Progress...');
    
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
    console.log(`Current progress: ${milestone.progress}%`);
    
    // Get all tasks for this milestone
    const allTasks = await Task.find({ milestone: milestone._id });
    console.log(`\n📝 All tasks in this milestone (${allTasks.length}):`);
    
    allTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.title} - Status: ${task.status}`);
    });
    
    // Count completed tasks
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.status === 'completed').length;
    
    console.log(`\n📊 Task Count:`);
    console.log(`  - Total tasks: ${totalTasks}`);
    console.log(`  - Completed tasks: ${completedTasks}`);
    
    // Calculate correct progress
    const correctProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    console.log(`  - Correct progress: ${correctProgress}%`);
    
    // Update milestone progress
    console.log(`\n🔄 Updating milestone progress...`);
    milestone.progress = correctProgress;
    await milestone.save({ validateBeforeSave: false });
    
    console.log(`✅ Milestone progress updated to ${correctProgress}%`);
    
    // Verify the update
    const updatedMilestone = await Milestone.findById(milestone._id);
    console.log(`✅ Verified: ${updatedMilestone.progress}%`);
    
    // Also update project progress
    console.log(`\n🔄 Updating project progress...`);
    const project = await Project.findById(milestone.project._id);
    
    // Get all milestones and tasks for this project
    const projectMilestones = await Milestone.find({ project: milestone.project._id });
    const projectTasks = await Task.find({ project: milestone.project._id });
    
    const completedMilestones = projectMilestones.filter(m => m.status === 'completed').length;
    const completedProjectTasks = projectTasks.filter(t => t.status === 'completed').length;
    
    const totalProjectItems = projectMilestones.length + projectTasks.length;
    const completedProjectItems = completedMilestones + completedProjectTasks;
    
    const projectProgress = totalProjectItems > 0 ? Math.round((completedProjectItems / totalProjectItems) * 100) : 0;
    
    console.log(`  - Project milestones: ${completedMilestones}/${projectMilestones.length}`);
    console.log(`  - Project tasks: ${completedProjectTasks}/${projectTasks.length}`);
    console.log(`  - Project progress: ${projectProgress}%`);
    
    project.progress = projectProgress;
    await project.save({ validateBeforeSave: false });
    
    console.log(`✅ Project progress updated to ${projectProgress}%`);
    
    console.log('\n✅ Fix completed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

fixSpecificMilestone();
