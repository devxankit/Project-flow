const mongoose = require('mongoose');
const Task = require('./models/Task');
const Project = require('./models/Project');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testTaskCounts() {
  try {
    console.log('🧪 Testing Task Count Calculations...\n');

    // Get an employee
    const employee = await User.findOne({ email: 'sarah.chen@techcorp.com' });
    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }

    console.log(`👤 Testing for employee: ${employee.fullName} (${employee._id})`);

    // Get projects assigned to this employee
    const assignedProjects = await Project.find({ 
      assignedTeam: employee._id 
    }).select('name _id');

    console.log(`\n📁 Assigned Projects: ${assignedProjects.length}`);
    assignedProjects.forEach(project => {
      console.log(`  - ${project.name} (${project._id})`);
    });

    // Test the aggregation query for each project
    for (const project of assignedProjects) {
      console.log(`\n🔍 Testing project: ${project.name}`);
      
      const taskCounts = await Task.aggregate([
        { 
          $match: { 
            project: project._id,
            assignedTo: employee._id
          } 
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
          }
        }
      ]);

      const counts = taskCounts[0] || { total: 0, completed: 0, inProgress: 0, pending: 0 };
      console.log(`  📊 Task counts:`, counts);

      // Also check raw task count
      const rawTaskCount = await Task.countDocuments({
        project: project._id,
        assignedTo: employee._id
      });
      console.log(`  📋 Raw task count: ${rawTaskCount}`);
    }

    // Test overall task count
    const projectIds = assignedProjects.map(p => p._id);
    const overallTaskCount = await Task.countDocuments({
      project: { $in: projectIds },
      assignedTo: employee._id
    });
    console.log(`\n📊 Overall task count: ${overallTaskCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testTaskCounts();
