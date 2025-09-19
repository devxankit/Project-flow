const axios = require('axios');

// Test the employee API endpoints
async function testEmployeeAPI() {
  try {
    console.log('🧪 Testing Employee API Endpoints...\n');

    // First, let's try to login as an employee
    console.log('1. Testing employee login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sarah.chen@techcorp.com',
      password: 'Employee123!'
    });

    if (loginResponse.data.success) {
      console.log('✅ Employee login successful');
      const token = loginResponse.data.token;
      const headers = { Authorization: `Bearer ${token}` };

      // Test dashboard endpoint
      console.log('\n2. Testing employee dashboard...');
      const dashboardResponse = await axios.get('http://localhost:5000/api/employee/dashboard', { headers });
      console.log('Dashboard response:', JSON.stringify(dashboardResponse.data, null, 2));

      // Test projects endpoint
      console.log('\n3. Testing employee projects...');
      const projectsResponse = await axios.get('http://localhost:5000/api/employee/projects', { headers });
      console.log('Projects response:', JSON.stringify(projectsResponse.data, null, 2));

      // Test tasks endpoint
      console.log('\n4. Testing employee tasks...');
      const tasksResponse = await axios.get('http://localhost:5000/api/employee/tasks', { headers });
      console.log('Tasks response:', JSON.stringify(tasksResponse.data, null, 2));

    } else {
      console.log('❌ Employee login failed');
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testEmployeeAPI();
