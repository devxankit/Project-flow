const mongoose = require('mongoose');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function recalculateAllProgress() {
  try {
    console.log('Starting progress recalculation...');
    
    // Get all projects
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects to process`);
    
    for (const project of projects) {
      console.log(`Processing project: ${project.name}`);
      
      // Get all milestones for this project
      const milestones = await Milestone.find({ project: project._id });
      const completedMilestones = milestones.filter(m => m.status === 'completed');
      
      // Get all tasks for this project
      const tasks = await Task.find({ project: project._id });
      const completedTasks = tasks.filter(task => task.status === 'completed');
      
      // Calculate project progress
      let totalItems = milestones.length + tasks.length;
      let completedItems = completedMilestones.length + completedTasks.length;
      
      let projectProgress = 0;
      if (totalItems > 0) {
        projectProgress = Math.round((completedItems / totalItems) * 100);
      }
      
      // Update project progress
      await Project.findByIdAndUpdate(project._id, { progress: projectProgress });
      console.log(`  Project progress: ${projectProgress}% (${completedItems}/${totalItems})`);
      
      // Recalculate milestone progress
      for (const milestone of milestones) {
        const milestoneTasks = await Task.find({ milestone: milestone._id });
        const completedMilestoneTasks = milestoneTasks.filter(task => task.status === 'completed');
        
        let milestoneProgress = 0;
        if (milestoneTasks.length > 0) {
          milestoneProgress = Math.round((completedMilestoneTasks.length / milestoneTasks.length) * 100);
        }
        
        await Milestone.findByIdAndUpdate(milestone._id, { progress: milestoneProgress });
        console.log(`    Milestone "${milestone.title}" progress: ${milestoneProgress}% (${completedMilestoneTasks.length}/${milestoneTasks.length})`);
      }
    }
    
    console.log('Progress recalculation completed successfully!');
  } catch (error) {
    console.error('Error recalculating progress:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
recalculateAllProgress();
