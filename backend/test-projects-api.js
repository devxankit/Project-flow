const axios = require('axios');

// Test the projects API directly
const testProjectsAPI = async () => {
  try {
    console.log('🔍 Testing Projects API...');
    
    // Login with correct PM credentials
    const pmUser = {
      email: 'alex.johnson@techcorp.com',
      password: 'PM123!'
    };
    
    console.log(`\n🔐 Logging in with: ${pmUser.email}`);
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', pmUser);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return false;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test getting projects
    console.log('\n📁 Testing GET /api/projects...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', projectsResponse.status);
    console.log('Response data:', JSON.stringify(projectsResponse.data, null, 2));
    
    if (projectsResponse.data.success) {
      const projects = projectsResponse.data.data?.projects || [];
      console.log(`✅ Found ${projects.length} projects`);
      
      if (projects.length > 0) {
        console.log('📋 Sample project:', {
          id: projects[0]._id,
          name: projects[0].name,
          status: projects[0].status
        });
      }
    } else {
      console.log('❌ Failed to get projects:', projectsResponse.data.message);
    }
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    return false;
  }
};

// Run the test
console.log('🚀 Starting Projects API Test...');
testProjectsAPI()
  .then(success => {
    if (success) {
      console.log('\n🎊 Projects API test completed.');
      process.exit(0);
    } else {
      console.log('\n💥 Projects API test failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test script crashed:', error.message);
    process.exit(1);
  });

