// Load environment variables first
require('dotenv').config({ path: './.env' });

const mongoose = require('mongoose');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ram312908_db_user:Ankit@cluster0.vigazjy.mongodb.net/Project-flow';

async function testFindByIdAndUpdate() {
  try {
    console.log('🧪 Testing findByIdAndUpdate Method...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Find a milestone with incomplete tasks
    const milestones = await Milestone.find({}).populate('project');
    if (!milestones.length) {
      console.log('❌ No milestones found');
      return;
    }
    
    let milestone = null;
    for (const m of milestones) {
      const incompleteTasks = await Task.countDocuments({ 
        milestone: m._id,
        status: { $ne: 'completed' }
      });
      if (incompleteTasks > 0) {
        milestone = m;
        break;
      }
    }
    
    if (!milestone) {
      console.log('❌ No milestones with incomplete tasks found');
      return;
    }
    
    console.log(`\n📋 Testing milestone: ${milestone.title}`);
    console.log(`Current progress: ${milestone.progress}%`);
    
    // Find a task in this milestone that's not completed
    const task = await Task.findOne({ 
      milestone: milestone._id,
      status: { $ne: 'completed' }
    });
    
    if (!task) {
      console.log('❌ No incomplete tasks found in this milestone');
      return;
    }
    
    console.log(`\n📝 Found task: ${task.title}`);
    console.log(`Current status: ${task.status}`);
    console.log(`Milestone ID: ${task.milestone}`);
    
    // Count tasks before update
    const totalTasksBefore = await Task.countDocuments({ milestone: milestone._id });
    const completedTasksBefore = await Task.countDocuments({ 
      milestone: milestone._id, 
      status: 'completed' 
    });
    
    console.log(`\n📊 Before update:`);
    console.log(`  - Total tasks: ${totalTasksBefore}`);
    console.log(`  - Completed tasks: ${completedTasksBefore}`);
    console.log(`  - Milestone progress: ${milestone.progress}%`);
    
    // Update task status to completed using findByIdAndUpdate
    console.log(`\n🔄 Updating task status to 'completed' using findByIdAndUpdate...`);
    const updatedTask = await Task.findByIdAndUpdate(
      task._id,
      { status: 'completed', completedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    console.log('✅ Task status updated using findByIdAndUpdate');
    
    // Wait a moment for middleware to execute
    console.log('⏳ Waiting for middleware to execute...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check milestone progress after update
    const updatedMilestone = await Milestone.findById(milestone._id);
    const totalTasksAfter = await Task.countDocuments({ milestone: milestone._id });
    const completedTasksAfter = await Task.countDocuments({ 
      milestone: milestone._id, 
      status: 'completed' 
    });
    
    console.log(`\n📊 After update:`);
    console.log(`  - Total tasks: ${totalTasksAfter}`);
    console.log(`  - Completed tasks: ${completedTasksAfter}`);
    console.log(`  - Milestone progress: ${updatedMilestone.progress}%`);
    
    // Calculate expected progress
    const expectedProgress = totalTasksAfter > 0 ? Math.round((completedTasksAfter / totalTasksAfter) * 100) : 0;
    console.log(`  - Expected progress: ${expectedProgress}%`);
    
    // Verify the progress was updated correctly
    if (updatedMilestone.progress === expectedProgress) {
      console.log('✅ findByIdAndUpdate works correctly!');
    } else {
      console.log('❌ findByIdAndUpdate does not work correctly');
      console.log(`  - Database shows: ${updatedMilestone.progress}%`);
      console.log(`  - Expected: ${expectedProgress}%`);
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testFindByIdAndUpdate();
