const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';

// Helper function to make API requests
const apiRequest = async (method, endpoint, data = null, token = '') => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
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

const testTaskRequestFunctionality = async () => {
  console.log('🚀 Testing Task Request Functionality with Existing Data\n');
  
  try {
    // Step 1: Try to login with existing users
    console.log('🔍 Step 1: Testing authentication with existing users...');
    
    // Let's try some common test emails
    const testEmails = [
      'admin@example.com',
      'customer@example.com', 
      'pm@example.com',
      'test@example.com',
      'user@example.com'
    ];
    
    let customerToken = '';
    let pmToken = '';
    let customerEmail = '';
    let pmEmail = '';
    
    for (const email of testEmails) {
      try {
        const loginResponse = await apiRequest('POST', '/auth/login', {
          email: email,
          password: 'password123'
        });
        
        if (loginResponse.success) {
          console.log(`✅ Login successful for: ${email}`);
          
          // Get user info to determine role
          const userResponse = await apiRequest('GET', '/auth/me', null, loginResponse.token);
          if (userResponse.success) {
            const role = userResponse.data.role;
            if (role === 'customer' && !customerToken) {
              customerToken = loginResponse.token;
              customerEmail = email;
              console.log(`   → Customer token obtained for: ${email}`);
            } else if (role === 'project-manager' && !pmToken) {
              pmToken = loginResponse.token;
              pmEmail = email;
              console.log(`   → PM token obtained for: ${email}`);
            }
          }
        }
      } catch (error) {
        // Continue to next email
      }
    }
    
    if (!customerToken || !pmToken) {
      console.log('⚠️  Could not find both customer and PM users. Let\'s test with available users...');
      
      // Try to get any user's projects
      if (customerToken) {
        console.log('\n🔍 Step 2: Testing with customer user...');
        await testWithCustomer(customerToken, customerEmail);
      }
      
      if (pmToken) {
        console.log('\n🔍 Step 3: Testing with PM user...');
        await testWithPM(pmToken, pmEmail);
      }
      
      return;
    }
    
    console.log(`\n✅ Found both users:`);
    console.log(`   Customer: ${customerEmail}`);
    console.log(`   PM: ${pmEmail}`);
    
    // Step 2: Test customer functionality
    console.log('\n🔍 Step 2: Testing customer functionality...');
    await testWithCustomer(customerToken, customerEmail);
    
    // Step 3: Test PM functionality  
    console.log('\n🔍 Step 3: Testing PM functionality...');
    await testWithPM(pmToken, pmEmail);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

const testWithCustomer = async (token, email) => {
  try {
    // Get customer projects
    const projectsResponse = await apiRequest('GET', '/customer/projects', null, token);
    if (projectsResponse.success && projectsResponse.data.length > 0) {
      console.log(`✅ Found ${projectsResponse.data.length} projects for customer`);
      
      const project = projectsResponse.data[0];
      console.log(`   → Testing with project: ${project.name}`);
      
      // Get project details to get milestones
      const projectDetailsResponse = await apiRequest('GET', `/customer/projects/${project._id}`, null, token);
      if (projectDetailsResponse.success && projectDetailsResponse.data.milestones.length > 0) {
        const milestone = projectDetailsResponse.data.milestones[0];
        console.log(`   → Found milestone: ${milestone.title}`);
        
        // Test creating a task request
        console.log('   → Testing task request creation...');
        const taskRequestData = {
          title: 'Test Task Request - API Test',
          description: 'This is a test task request created via API to verify the functionality is working correctly.',
          project: project._id,
          milestone: milestone._id,
          priority: 'Medium',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          reason: 'feature-request'
        };
        
        const createResponse = await apiRequest('POST', '/task-requests/customer', taskRequestData, token);
        if (createResponse.success) {
          console.log('   ✅ Task request created successfully!');
          console.log(`      - ID: ${createResponse.data._id}`);
          console.log(`      - Status: ${createResponse.data.status}`);
          
          // Test getting customer task requests
          const requestsResponse = await apiRequest('GET', '/task-requests/customer', null, token);
          if (requestsResponse.success) {
            console.log(`   ✅ Found ${requestsResponse.data.length} task requests for customer`);
          }
          
          return createResponse.data._id;
        }
      }
    } else {
      console.log('⚠️  No projects found for customer');
    }
  } catch (error) {
    console.log(`❌ Customer test failed: ${error.message}`);
  }
};

const testWithPM = async (token, email) => {
  try {
    // Get PM task requests
    const requestsResponse = await apiRequest('GET', '/task-requests/pm', null, token);
    if (requestsResponse.success) {
      console.log(`✅ Found ${requestsResponse.data.length} task requests for PM`);
      
      if (requestsResponse.data.length > 0) {
        const pendingRequests = requestsResponse.data.filter(req => req.status === 'Pending');
        console.log(`   → ${pendingRequests.length} pending requests found`);
        
        if (pendingRequests.length > 0) {
          const request = pendingRequests[0];
          console.log(`   → Testing approval of request: ${request.title}`);
          
          // Test approving the request
          const approvalData = {
            action: 'approve',
            reviewComments: 'Test approval via API - functionality working correctly!'
          };
          
          const approvalResponse = await apiRequest('POST', `/task-requests/pm/${request._id}/review`, approvalData, token);
          if (approvalResponse.success) {
            console.log('   ✅ Task request approved successfully!');
            console.log(`      - Status: ${approvalResponse.data.status}`);
            if (approvalResponse.data.createdTask) {
              console.log(`      - Created Task ID: ${approvalResponse.data.createdTask._id}`);
            }
          }
        } else {
          console.log('   → No pending requests to approve');
        }
      }
    }
  } catch (error) {
    console.log(`❌ PM test failed: ${error.message}`);
  }
};

// Run the test
testTaskRequestFunctionality();
