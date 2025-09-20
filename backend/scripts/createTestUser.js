const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';

// Helper function to make API requests
const apiRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ API Error (${method} ${endpoint}):`, error.response?.data || error.message);
    throw error;
  }
};

const createTestUsers = async () => {
  console.log('🚀 Creating Test Users via API\n');
  
  try {
    // Create test customer
    console.log('🔧 Creating test customer...');
    const customerData = {
      fullName: 'Test Customer',
      email: 'testcustomer@example.com',
      password: 'password123',
      role: 'customer'
    };
    
    try {
      const customerResponse = await apiRequest('POST', '/auth/register', customerData);
      if (customerResponse.success) {
        console.log('✅ Test customer created successfully!');
        console.log(`   Email: ${customerData.email}`);
        console.log(`   Password: ${customerData.password}`);
      }
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️  Test customer already exists');
      } else {
        console.log('❌ Failed to create test customer:', error.response?.data?.error);
      }
    }
    
    // Create test PM
    console.log('\n🔧 Creating test PM...');
    const pmData = {
      fullName: 'Test Project Manager',
      email: 'testpm@example.com',
      password: 'password123',
      role: 'project-manager'
    };
    
    try {
      const pmResponse = await apiRequest('POST', '/auth/register', pmData);
      if (pmResponse.success) {
        console.log('✅ Test PM created successfully!');
        console.log(`   Email: ${pmData.email}`);
        console.log(`   Password: ${pmData.password}`);
      }
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️  Test PM already exists');
      } else {
        console.log('❌ Failed to create test PM:', error.response?.data?.error);
      }
    }
    
    // Create test employee
    console.log('\n🔧 Creating test employee...');
    const employeeData = {
      fullName: 'Test Employee',
      email: 'testemployee@example.com',
      password: 'password123',
      role: 'employee'
    };
    
    try {
      const employeeResponse = await apiRequest('POST', '/auth/register', employeeData);
      if (employeeResponse.success) {
        console.log('✅ Test employee created successfully!');
        console.log(`   Email: ${employeeData.email}`);
        console.log(`   Password: ${employeeData.password}`);
      }
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️  Test employee already exists');
      } else {
        console.log('❌ Failed to create test employee:', error.response?.data?.error);
      }
    }
    
    console.log('\n🎉 Test user creation completed!');
    console.log('\n📋 Test Credentials:');
    console.log('   Customer: testcustomer@example.com / password123');
    console.log('   PM: testpm@example.com / password123');
    console.log('   Employee: testemployee@example.com / password123');
    
  } catch (error) {
    console.error('❌ Failed to create test users:', error.message);
  }
};

// Run the script
createTestUsers();
