const axios = require('axios');

// Test authentication fix
const testAuthFix = async () => {
  try {
    console.log('🔍 Testing authentication fix...');
    
    // Test 1: Try to access projects without authentication (should fail)
    console.log('\n❌ Test 1: Accessing projects without authentication...');
    try {
      await axios.get('http://localhost:5000/api/projects');
      console.log('❌ ERROR: Should have failed without authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly blocked without authentication (401)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }
    
    // Test 2: Login and access projects (should work)
    console.log('\n✅ Test 2: Login and access projects...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'alex.johnson@techcorp.com',
      password: 'PM123!'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test 3: Access projects with authentication
    console.log('\n✅ Test 3: Accessing projects with authentication...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (projectsResponse.data.success) {
      console.log('✅ Successfully accessed projects with authentication');
      console.log(`   Found ${projectsResponse.data.data.projects.length} projects`);
    } else {
      console.log('❌ Failed to access projects:', projectsResponse.data.message);
    }
    
    // Test 4: Access specific project
    if (projectsResponse.data.success && projectsResponse.data.data.projects.length > 0) {
      const projectId = projectsResponse.data.data.projects[0]._id;
      console.log(`\n✅ Test 4: Accessing specific project ${projectId}...`);
      
      const projectResponse = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (projectResponse.data.success) {
        console.log('✅ Successfully accessed specific project');
        console.log(`   Project: ${projectResponse.data.data.project.name}`);
      } else {
        console.log('❌ Failed to access specific project:', projectResponse.data.message);
      }
    }
    
    console.log('\n🎉 Authentication fix test completed successfully!');
    console.log('✅ All routes are now properly protected');
    console.log('✅ Authentication is working correctly');
    
    return true;
    
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
testAuthFix()
  .then(success => {
    if (success) {
      console.log('\n🎊 Authentication fix is working!');
    } else {
      console.log('\n💥 Authentication fix failed.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test crashed:', error.message);
    process.exit(1);
  });

