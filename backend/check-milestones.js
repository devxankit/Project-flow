const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Milestone = require('./models/Milestone');
const Project = require('./models/Project');

const checkMilestones = async () => {
  try {
    console.log('🔍 Checking existing milestones and projects...');
    
    // Get all projects
    const projects = await Project.find().select('_id name');
    console.log('\n📁 Projects:');
    projects.forEach(project => {
      console.log(`  ${project._id} - ${project.name}`);
    });
    
    // Get all milestones
    const milestones = await Milestone.find().populate('project', 'name');
    console.log('\n🎯 Milestones:');
    milestones.forEach(milestone => {
      console.log(`  ${milestone._id} - ${milestone.title} (Project: ${milestone.project?.name || 'Unknown'})`);
    });
    
    // Find a milestone that belongs to a project
    if (milestones.length > 0 && projects.length > 0) {
      const milestone = milestones[0];
      const project = projects[0];
      
      console.log('\n✅ Test data:');
      console.log(`  Project ID: ${project._id}`);
      console.log(`  Milestone ID: ${milestone._id}`);
      console.log(`  Milestone belongs to project: ${milestone.project._id.toString() === project._id.toString()}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkMilestones();

