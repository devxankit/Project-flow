const mongoose = require('mongoose');
const Task = require('./models/Task');
const Project = require('./models/Project');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugEmployeeTasks() {
  try {
    console.log('🔍 Debugging Employee Task Assignment...\n');

    // Get all employees
    const employees = await User.find({ role: 'employee' });
    console.log(`📊 Found ${employees.length} employees:`);
    employees.forEach(emp => {
      console.log(`  - ${emp.fullName} (${emp.email}) - ID: ${emp._id}`);
    });

    console.log('\n📋 Checking Projects and Task Assignments...\n');

    for (const employee of employees) {
      console.log(`\n👤 Employee: ${employee.fullName}`);
      
      // Check projects assigned to this employee
      const assignedProjects = await Project.find({ 
        assignedTeam: employee._id 
      }).select('name status assignedTeam');
      
      console.log(`  📁 Assigned Projects: ${assignedProjects.length}`);
      assignedProjects.forEach(project => {
        console.log(`    - ${project.name} (${project.status})`);
      });

      // Check tasks assigned to this employee
      const assignedTasks = await Task.find({ 
        assignedTo: employee._id 
      }).populate('project', 'name').select('title status priority project');
      
      console.log(`  📝 Assigned Tasks: ${assignedTasks.length}`);
      assignedTasks.forEach(task => {
        console.log(`    - ${task.title} (${task.status}) - Project: ${task.project?.name || 'No Project'}`);
      });

      // Check tasks in assigned projects
      const projectIds = assignedProjects.map(p => p._id);
      if (projectIds.length > 0) {
        const tasksInProjects = await Task.find({ 
          project: { $in: projectIds },
          assignedTo: employee._id 
        }).populate('project', 'name').select('title status priority project');
        
        console.log(`  🔗 Tasks in Assigned Projects: ${tasksInProjects.length}`);
        tasksInProjects.forEach(task => {
          console.log(`    - ${task.title} (${task.status}) - Project: ${task.project?.name || 'No Project'}`);
        });
      }
    }

    console.log('\n📊 Overall Statistics:');
    const totalTasks = await Task.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    
    console.log(`  - Total Tasks: ${totalTasks}`);
    console.log(`  - Total Projects: ${totalProjects}`);
    console.log(`  - Total Employees: ${totalEmployees}`);

    // Check for tasks without proper assignment
    const tasksWithoutAssignment = await Task.find({
      $or: [
        { assignedTo: { $exists: false } },
        { assignedTo: { $size: 0 } }
      ]
    }).populate('project', 'name').select('title status project');
    
    console.log(`\n⚠️  Tasks without proper assignment: ${tasksWithoutAssignment.length}`);
    tasksWithoutAssignment.forEach(task => {
      console.log(`  - ${task.title} (${task.status}) - Project: ${task.project?.name || 'No Project'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugEmployeeTasks();
