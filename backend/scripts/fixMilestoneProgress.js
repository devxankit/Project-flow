const mongoose = require('mongoose');
const Milestone = require('../models/Milestone');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixMilestoneProgress() {
  try {
    console.log('Fixing milestone progress...');
    
    // Use the static method to recalculate all progress
    await Milestone.recalculateAllProgress();
    
    console.log('Milestone progress fix completed!');
  } catch (error) {
    console.error('Error fixing milestone progress:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the fix
fixMilestoneProgress();
