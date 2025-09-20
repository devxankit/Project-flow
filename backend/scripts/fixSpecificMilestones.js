// Load environment variables first
require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ram312908_db_user:Ankit@cluster0.vigazjy.mongodb.net/Project-flow';

async function fixSpecificMilestones() {
  try {
    console.log('🔧 Fixing Specific Milestone Progress Issues...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Fix the specific milestones that were identified in the test
    const milestoneIds = [
      '68cd85da4e023a04b528de42', // Integration milestone
      '68ce4786c371121b8c3aec7e'  // Write the Frontend milestone
    ];
    
    for (const milestoneId of milestoneIds) {
      console.log(`\n🔧 Fixing milestone: ${milestoneId}`);
      
      const milestone = await Milestone.findById(milestoneId);
      if (!milestone) {
        console.log(`❌ Milestone not found: ${milestoneId}`);
        continue;
      }
      
      console.log(`✅ Found milestone: ${milestone.title}`);
      console.log(`Current progress: ${milestone.progress}%`);
      
      // Count tasks for this milestone
      const totalTasks = await Task.countDocuments({ milestone: milestoneId });
      const completedTasks = await Task.countDocuments({ 
        milestone: milestoneId, 
        status: 'completed' 
      });
      
      console.log(`Total tasks: ${totalTasks}`);
      console.log(`Completed tasks: ${completedTasks}`);
      
      // Calculate expected progress
      let expectedProgress = 0;
      if (totalTasks > 0) {
        expectedProgress = Math.round((completedTasks / totalTasks) * 100);
      }
      
      console.log(`Expected progress: ${expectedProgress}%`);
      
      // Update milestone progress
      await Milestone.findByIdAndUpdate(milestoneId, { progress: expectedProgress });
      console.log(`✅ Updated milestone progress to ${expectedProgress}%`);
      
      // Verify the update
      const updatedMilestone = await Milestone.findById(milestoneId);
      console.log(`✅ Verified: ${updatedMilestone.progress}%`);
    }
    
    console.log('\n✅ All milestone progress issues fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing milestones:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

fixSpecificMilestones();
