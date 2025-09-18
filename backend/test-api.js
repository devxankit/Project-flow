const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials from our database
const testCredentials = {
  pm: { email: 'john.doe@example.com', password: 'TempPass123!' },
  employee: { email: 'jane.smith@example.com', password: 'TempPass456!' },
  customer: { email: 'bob.johnson@company.com', password: 'TempPass789!' }
};

async function testAPI() {
  try {
    console.log('🧪 Testing API Endpoints...\n');

    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);

    // Test 2: PM Login
    console.log('\n2. Testing PM Login...');
    const pmLoginResponse = await axios.post(`${BASE_URL}/auth/login`, testCredentials.pm);
    console.log('✅ PM Login Success:', pmLoginResponse.data.data.user.fullName);
    const pmToken = pmLoginResponse.data.data.token;

    // Test 3: Employee Login
    console.log('\n3. Testing Employee Login...');
    const employeeLoginResponse = await axios.post(`${BASE_URL}/auth/login`, testCredentials.employee);
    console.log('✅ Employee Login Success:', employeeLoginResponse.data.data.user.fullName);

    // Test 4: Customer Login
    console.log('\n4. Testing Customer Login...');
    const customerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, testCredentials.customer);
    console.log('✅ Customer Login Success:', customerLoginResponse.data.data.user.fullName);

    // Test 5: Get All Users (PM only)
    console.log('\n5. Testing Get All Users (PM only)...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${pmToken}` }
    });
    console.log('✅ Get Users Success:', `Found ${usersResponse.data.data.users.length} users`);

    // Test 6: Create New User (PM only)
    console.log('\n6. Testing Create New User (PM only)...');
    const newUser = {
      fullName: 'Test User',
      email: 'test.user@example.com',
      password: 'TestPass123!',
      role: 'employee',
      status: 'active',
      department: 'Engineering',
      jobTitle: 'Test Developer',
      workTitle: 'web-developer'
    };
    
    const createUserResponse = await axios.post(`${BASE_URL}/users`, newUser, {
      headers: { Authorization: `Bearer ${pmToken}` }
    });
    console.log('✅ Create User Success:', createUserResponse.data.data.user.fullName);
    console.log('📧 Credentials:', createUserResponse.data.data.credentials);

    // Test 7: Test login with newly created user
    console.log('\n7. Testing Login with New User...');
    const newUserLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test.user@example.com',
      password: 'TestPass123!'
    });
    console.log('✅ New User Login Success:', newUserLoginResponse.data.data.user.fullName);

    console.log('\n🎉 All API tests passed!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Health check working');
    console.log('- ✅ PM login working');
    console.log('- ✅ Employee login working');
    console.log('- ✅ Customer login working');
    console.log('- ✅ PM can view all users');
    console.log('- ✅ PM can create new users');
    console.log('- ✅ New users can login with provided credentials');

  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testAPI();
