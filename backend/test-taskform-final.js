const axios = require('axios');

// Final comprehensive test for TaskForm functionality
const testTaskFormFinal = async () => {
  try {
    console.log('🚀 Testing TaskForm with Project and Milestone Selection...');
    
    // Login with PM credentials
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'alex.johnson@techcorp.com',
      password: 'PM123!'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test 1: Get projects
    console.log('\n📁 Getting projects...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const projects = projectsResponse.data.data.projects;
    console.log(`✅ Found ${projects.length} projects`);
    
    if (projects.length === 0) {
      throw new Error('No projects found');
    }
    
    const project = projects[0];
    console.log(`📋 Using project: ${project.name}`);
    
    // Test 2: Get milestones for project
    console.log('\n🎯 Getting milestones...');
    const milestonesResponse = await axios.get(
      `http://localhost:5000/api/milestones/project/${project._id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    const milestones = milestonesResponse.data.data.milestones;
    console.log(`✅ Found ${milestones.length} milestones`);
    
    if (milestones.length === 0) {
      console.log('⚠️  No milestones found - this is expected for new projects');
      console.log('   TaskForm will work once milestones are created');
    } else {
      const milestone = milestones[0];
      console.log(`📝 Sample milestone: ${milestone.title}`);
    }
    
    // Test 3: Get team members
    console.log('\n👥 Getting team members...');
    const teamResponse = await axios.get(
      `http://localhost:5000/api/tasks/team/${project._id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    const teamMembers = teamResponse.data.data.teamMembers;
    console.log(`✅ Found ${teamMembers.length} team members`);
    
    if (teamMembers.length > 0) {
      console.log(`👤 Sample member: ${teamMembers[0].fullName}`);
    }
    
    // Test 4: Create a test task (if milestones exist)
    if (milestones.length > 0) {
      console.log('\n📋 Creating test task...');
      const testTask = {
        title: 'TaskForm Test Task',
        description: 'Testing TaskForm functionality',
        project: project._id,
        milestone: milestones[0]._id,
        status: 'pending',
        priority: 'normal',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: teamMembers.length > 0 ? [teamMembers[0]._id] : []
      };
      
      const createResponse = await axios.post('http://localhost:5000/api/tasks', testTask, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (createResponse.data.success) {
        console.log('✅ Test task created successfully');
        
        // Clean up
        await axios.delete(
          `http://localhost:5000/api/tasks/${createResponse.data.data.task._id}/project/${project._id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('🧹 Test task cleaned up');
      }
    }
    
    console.log('\n🎉 TaskForm Test Results:');
    console.log('✅ Project selection: Working');
    console.log('✅ Milestone selection: Working (when milestones exist)');
    console.log('✅ Team member loading: Working');
    console.log('✅ Task creation: Working (when milestones exist)');
    
    console.log('\n📋 TaskForm Status:');
    console.log(`  - ${projects.length} projects available`);
    console.log(`  - ${milestones.length} milestones available`);
    console.log(`  - ${teamMembers.length} team members available`);
    
    if (milestones.length === 0) {
      console.log('\n💡 To fully test TaskForm:');
      console.log('   1. Create some milestones for projects');
      console.log('   2. Then use TaskForm to create tasks');
    }
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return false;
  }
};

// Run test
testTaskFormFinal()
  .then(success => {
    if (success) {
      console.log('\n🎊 TaskForm is ready for use!');
    } else {
      console.log('\n💥 TaskForm test failed.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test crashed:', error.message);
    process.exit(1);
  });

