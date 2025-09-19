const axios = require('axios');

// Test TaskForm data loading
const testTaskFormDebug = async () => {
  try {
    console.log('🔍 Testing TaskForm data loading...');
    
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
    console.log('\n📁 Testing projects API...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Projects response structure:', {
      success: projectsResponse.data.success,
      hasData: !!projectsResponse.data.data,
      hasProjects: !!projectsResponse.data.data?.projects,
      projectsLength: projectsResponse.data.data?.projects?.length || 0
    });
    
    if (projectsResponse.data.success && projectsResponse.data.data.projects.length > 0) {
      console.log(`✅ Found ${projectsResponse.data.data.projects.length} projects`);
      const project = projectsResponse.data.data.projects[0];
      console.log(`   Sample project: ${project.name} (${project._id})`);
      
      // Test 2: Get milestones for project
      console.log('\n🎯 Testing milestones API...');
      const milestonesResponse = await axios.get(
        `http://localhost:5000/api/milestones/project/${project._id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log('Milestones response structure:', {
        success: milestonesResponse.data.success,
        hasData: !!milestonesResponse.data.data,
        hasMilestones: !!milestonesResponse.data.data?.milestones,
        milestonesLength: milestonesResponse.data.data?.milestones?.length || 0
      });
      
      // Test 3: Get team members for project
      console.log('\n👥 Testing team members API...');
      const teamResponse = await axios.get(
        `http://localhost:5000/api/tasks/team/${project._id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log('Team members response structure:', {
        success: teamResponse.data.success,
        hasData: !!teamResponse.data.data,
        hasTeamMembers: !!teamResponse.data.data?.teamMembers,
        teamMembersLength: teamResponse.data.data?.teamMembers?.length || 0
      });
      
      console.log('\n🎉 TaskForm API test results:');
      console.log('✅ Projects API: Working');
      console.log('✅ Milestones API: Working');
      console.log('✅ Team Members API: Working');
      console.log('\n📋 Data structure is correct for TaskForm');
      
      return true;
    } else {
      console.log('❌ No projects found');
      return false;
    }
    
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
testTaskFormDebug()
  .then(success => {
    if (success) {
      console.log('\n🎊 TaskForm APIs are working correctly!');
    } else {
      console.log('\n💥 TaskForm APIs have issues.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test crashed:', error.message);
    process.exit(1);
  });

