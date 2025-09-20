const mongoose = require('mongoose');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function recalculateMilestoneProgress() {
  try {
    console.log('Starting milestone progress recalculation...');
    
    // Get all milestones
    const milestones = await Milestone.find({});
    console.log(`Found ${milestones.length} milestones to process`);
    
    for (const milestone of milestones) {
      console.log(`Processing milestone: ${milestone.title}`);
      
      // Count total and completed tasks for this milestone
      const totalTasks = await Task.countDocuments({ milestone: milestone._id });
      const completedTasks = await Task.countDocuments({ 
        milestone: milestone._id, 
        status: 'completed' 
      });
      
      // Calculate progress percentage
      let progress = 0;
      if (totalTasks > 0) {
        progress = Math.round((completedTasks / totalTasks) * 100);
      }
      
      // Update milestone progress
      await Milestone.findByIdAndUpdate(milestone._id, { progress });
      console.log(`  Progress: ${progress}% (${completedTasks}/${totalTasks} tasks completed)`);
    }
    
    console.log('Milestone progress recalculation completed successfully!');
  } catch (error) {
    console.error('Error recalculating milestone progress:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
recalculateMilestoneProgress();
