// Load environment variables first
require('dotenv').config({ path: './.env' });

const mongoose = require('mongoose');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ram312908_db_user:Ankit@cluster0.vigazjy.mongodb.net/Project-flow';

async function fixAllMilestoneProgress() {
  try {
    console.log('🔧 Fixing All Milestone Progress...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all milestones
    const milestones = await Milestone.find({}).populate('project');
    console.log(`\n📋 Found ${milestones.length} milestones to check`);
    
    let fixedCount = 0;
    
    for (const milestone of milestones) {
      console.log(`\n🔍 Checking milestone: ${milestone.title}`);
      console.log(`  Project: ${milestone.project.name}`);
      console.log(`  Current progress: ${milestone.progress}%`);
      
      // Get all tasks for this milestone
      const allTasks = await Task.find({ milestone: milestone._id });
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => task.status === 'completed').length;
      
      // Calculate correct progress
      const correctProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      console.log(`  Tasks: ${completedTasks}/${totalTasks} completed`);
      console.log(`  Correct progress: ${correctProgress}%`);
      
      // Check if progress needs fixing
      if (milestone.progress !== correctProgress) {
        console.log(`  ❌ Progress mismatch! Fixing...`);
        milestone.progress = correctProgress;
        await milestone.save({ validateBeforeSave: false });
        console.log(`  ✅ Fixed: ${milestone.progress}%`);
        fixedCount++;
      } else {
        console.log(`  ✅ Progress is correct`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Total milestones checked: ${milestones.length}`);
    console.log(`  - Milestones fixed: ${fixedCount}`);
    console.log(`  - Milestones already correct: ${milestones.length - fixedCount}`);
    
    // Now fix project progress
    console.log(`\n🔄 Fixing project progress...`);
    const projects = await Project.find({});
    let projectFixedCount = 0;
    
    for (const project of projects) {
      console.log(`\n🔍 Checking project: ${project.name}`);
      console.log(`  Current progress: ${project.progress}%`);
      
      // Get all milestones and tasks for this project
      const projectMilestones = await Milestone.find({ project: project._id });
      const projectTasks = await Task.find({ project: project._id });
      
      const completedMilestones = projectMilestones.filter(m => m.status === 'completed').length;
      const completedProjectTasks = projectTasks.filter(t => t.status === 'completed').length;
      
      const totalProjectItems = projectMilestones.length + projectTasks.length;
      const completedProjectItems = completedMilestones + completedProjectTasks;
      
      const correctProjectProgress = totalProjectItems > 0 ? Math.round((completedProjectItems / totalProjectItems) * 100) : 0;
      
      console.log(`  Milestones: ${completedMilestones}/${projectMilestones.length} completed`);
      console.log(`  Tasks: ${completedProjectTasks}/${projectTasks.length} completed`);
      console.log(`  Correct progress: ${correctProjectProgress}%`);
      
      // Check if project progress needs fixing
      if (project.progress !== correctProjectProgress) {
        console.log(`  ❌ Project progress mismatch! Fixing...`);
        project.progress = correctProjectProgress;
        await project.save({ validateBeforeSave: false });
        console.log(`  ✅ Fixed: ${project.progress}%`);
        projectFixedCount++;
      } else {
        console.log(`  ✅ Project progress is correct`);
      }
    }
    
    console.log(`\n📊 Project Summary:`);
    console.log(`  - Total projects checked: ${projects.length}`);
    console.log(`  - Projects fixed: ${projectFixedCount}`);
    console.log(`  - Projects already correct: ${projects.length - projectFixedCount}`);
    
    console.log('\n✅ All milestone and project progress fixed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

fixAllMilestoneProgress();
