// Load environment variables first
require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ram312908_db_user:Ankit@cluster0.vigazjy.mongodb.net/Project-flow';

async function testTaskStatusUpdate() {
  try {
    console.log('🧪 Testing Task Status Update and Milestone Progress...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Find a milestone with tasks
    const milestone = await Milestone.findOne({}).populate('project');
    if (!milestone) {
      console.log('❌ No milestones found');
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
    
    // Update task status to completed
    console.log(`\n🔄 Updating task status to 'completed'...`);
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();
    
    console.log('✅ Task status updated');
    
    // Wait a moment for middleware to execute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
      console.log('✅ Milestone progress updated correctly!');
    } else {
      console.log('❌ Milestone progress not updated correctly');
    }
    
    // Reset task status for testing
    console.log(`\n🔄 Resetting task status to original...`);
    task.status = 'in-progress';
    task.completedAt = null;
    await task.save();
    
    // Wait for middleware
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check final state
    const finalMilestone = await Milestone.findById(milestone._id);
    console.log(`\n📊 Final state:`);
    console.log(`  - Milestone progress: ${finalMilestone.progress}%`);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testTaskStatusUpdate();
