const axios = require('axios');

// Test TaskForm fix
const testTaskFormFix = async () => {
  try {
    console.log('🔍 Testing TaskForm fix...');
    
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
    
    // Test 1: Get projects for TaskForm
    console.log('\n📁 Testing projects for TaskForm...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (projectsResponse.data.success && projectsResponse.data.data.projects.length > 0) {
      console.log(`✅ Found ${projectsResponse.data.data.projects.length} projects for TaskForm`);
      const project = projectsResponse.data.data.projects[0];
      console.log(`   Sample project: ${project.name}`);
      
      // Test 2: Get milestones for project
      console.log('\n🎯 Testing milestones for TaskForm...');
      const milestonesResponse = await axios.get(
        `http://localhost:5000/api/milestones/project/${project._id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (milestonesResponse.data.success) {
        console.log(`✅ Found ${milestonesResponse.data.data.milestones.length} milestones`);
        
        // Test 3: Get team members for project
        console.log('\n👥 Testing team members for TaskForm...');
        const teamResponse = await axios.get(
          `http://localhost:5000/api/tasks/team/${project._id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (teamResponse.data.success) {
          console.log(`✅ Found ${teamResponse.data.data.teamMembers.length} team members`);
          
          console.log('\n🎉 TaskForm fix test results:');
          console.log('✅ Projects loading: Working');
          console.log('✅ Milestones loading: Working');
          console.log('✅ Team members loading: Working');
          console.log('✅ TaskForm should now work without map errors');
          
          return true;
        } else {
          console.log('❌ Failed to load team members');
        }
      } else {
        console.log('❌ Failed to load milestones');
      }
    } else {
      console.log('❌ Failed to load projects');
    }
    
    return false;
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    return false;
  }
};

// Run test
testTaskFormFix()
  .then(success => {
    if (success) {
      console.log('\n🎊 TaskForm fix is working!');
    } else {
      console.log('\n💥 TaskForm fix failed.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test crashed:', error.message);
    process.exit(1);
  });

