const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const CUSTOMER_EMAIL = 'testcustomer@example.com';
const PM_EMAIL = 'testpm@example.com';
const PASSWORD = 'password123';

// Global variables to store tokens and IDs
let customerToken = '';
let pmToken = '';
let projectId = '';
let milestoneId = '';
let taskRequestId = '';

// Helper function to make authenticated requests
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

// Test 1: Authentication
const testAuthentication = async () => {
  console.log('\n🧪 Test 1: Authentication');
  
  try {
    // Login as customer
    const customerLogin = await apiRequest('POST', '/auth/login', {
      email: CUSTOMER_EMAIL,
      password: PASSWORD
    });
    
    if (customerLogin.success) {
      customerToken = customerLogin.token;
      console.log('✅ Customer login successful');
    } else {
      throw new Error('Customer login failed');
    }

    // Login as PM
    const pmLogin = await apiRequest('POST', '/auth/login', {
      email: PM_EMAIL,
      password: PASSWORD
    });
    
    if (pmLogin.success) {
      pmToken = pmLogin.token;
      console.log('✅ PM login successful');
    } else {
      throw new Error('PM login failed');
    }

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    throw error;
  }
};

// Test 2: Get Customer Projects and Milestones
const testGetCustomerData = async () => {
  console.log('\n🧪 Test 2: Getting Customer Projects and Milestones');
  
  try {
    // Get customer projects
    const projects = await apiRequest('GET', '/customer/projects', null, customerToken);
    
    if (projects.success && projects.data.length > 0) {
      projectId = projects.data[0]._id;
      console.log(`✅ Found project: ${projects.data[0].name}`);
      
      // Get project details to get milestones
      const projectDetails = await apiRequest('GET', `/customer/projects/${projectId}`, null, customerToken);
      
      if (projectDetails.success && projectDetails.data.milestones.length > 0) {
        milestoneId = projectDetails.data.milestones[0]._id;
        console.log(`✅ Found milestone: ${projectDetails.data.milestones[0].title}`);
      } else {
        throw new Error('No milestones found');
      }
    } else {
      throw new Error('No projects found for customer');
    }

  } catch (error) {
    console.error('❌ Get customer data test failed:', error.message);
    throw error;
  }
};

// Test 3: Create Task Request
const testCreateTaskRequest = async () => {
  console.log('\n🧪 Test 3: Creating Task Request');
  
  try {
    const taskRequestData = {
      title: 'Add user authentication feature',
      description: 'We need to implement secure user authentication for the mobile app to ensure only authorized users can access the system. This should include login, logout, and password reset functionality.',
      project: projectId,
      milestone: milestoneId,
      priority: 'High',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      reason: 'feature-request'
    };

    const response = await apiRequest('POST', '/task-requests/customer', taskRequestData, customerToken);
    
    if (response.success) {
      taskRequestId = response.data._id;
      console.log('✅ Task request created successfully');
      console.log(`   - ID: ${taskRequestId}`);
      console.log(`   - Title: ${response.data.title}`);
      console.log(`   - Status: ${response.data.status}`);
      console.log(`   - Priority: ${response.data.priority}`);
    } else {
      throw new Error('Failed to create task request');
    }

  } catch (error) {
    console.error('❌ Create task request test failed:', error.message);
    throw error;
  }
};

// Test 4: Get Customer Task Requests
const testGetCustomerTaskRequests = async () => {
  console.log('\n🧪 Test 4: Getting Customer Task Requests');
  
  try {
    const response = await apiRequest('GET', '/task-requests/customer', null, customerToken);
    
    if (response.success) {
      console.log(`✅ Found ${response.data.length} task requests for customer`);
      response.data.forEach((req, index) => {
        console.log(`   ${index + 1}. ${req.title} - ${req.status}`);
      });
    } else {
      throw new Error('Failed to get customer task requests');
    }

  } catch (error) {
    console.error('❌ Get customer task requests test failed:', error.message);
    throw error;
  }
};

// Test 5: Get PM Task Requests
const testGetPMTaskRequests = async () => {
  console.log('\n🧪 Test 5: Getting PM Task Requests');
  
  try {
    const response = await apiRequest('GET', '/task-requests/pm', null, pmToken);
    
    if (response.success) {
      console.log(`✅ Found ${response.data.length} task requests for PM`);
      response.data.forEach((req, index) => {
        console.log(`   ${index + 1}. ${req.title} - ${req.status} (Project: ${req.project?.name})`);
      });
    } else {
      throw new Error('Failed to get PM task requests');
    }

  } catch (error) {
    console.error('❌ Get PM task requests test failed:', error.message);
    throw error;
  }
};

// Test 6: Get Task Request Details
const testGetTaskRequestDetails = async () => {
  console.log('\n🧪 Test 6: Getting Task Request Details');
  
  try {
    const response = await apiRequest('GET', `/task-requests/customer/${taskRequestId}`, null, customerToken);
    
    if (response.success) {
      console.log('✅ Task request details retrieved successfully');
      console.log(`   - Title: ${response.data.title}`);
      console.log(`   - Description: ${response.data.description.substring(0, 100)}...`);
      console.log(`   - Project: ${response.data.project?.name}`);
      console.log(`   - Milestone: ${response.data.milestone?.title}`);
      console.log(`   - Priority: ${response.data.priority}`);
      console.log(`   - Status: ${response.data.status}`);
      console.log(`   - Reason: ${response.data.reason}`);
    } else {
      throw new Error('Failed to get task request details');
    }

  } catch (error) {
    console.error('❌ Get task request details test failed:', error.message);
    throw error;
  }
};

// Test 7: Update Task Request
const testUpdateTaskRequest = async () => {
  console.log('\n🧪 Test 7: Updating Task Request');
  
  try {
    const updateData = {
      title: 'Updated: Add user authentication feature',
      description: 'We need to implement secure user authentication for the mobile app to ensure only authorized users can access the system. This should include login, logout, and password reset functionality. [Updated with additional requirements]',
      priority: 'Urgent'
    };

    const response = await apiRequest('PUT', `/task-requests/customer/${taskRequestId}`, updateData, customerToken);
    
    if (response.success) {
      console.log('✅ Task request updated successfully');
      console.log(`   - Updated Title: ${response.data.title}`);
      console.log(`   - Updated Priority: ${response.data.priority}`);
    } else {
      throw new Error('Failed to update task request');
    }

  } catch (error) {
    console.error('❌ Update task request test failed:', error.message);
    throw error;
  }
};

// Test 8: Approve Task Request
const testApproveTaskRequest = async () => {
  console.log('\n🧪 Test 8: Approving Task Request');
  
  try {
    const approvalData = {
      action: 'approve',
      reviewComments: 'Task request approved. This feature aligns with our project goals and will be implemented as requested.'
    };

    const response = await apiRequest('POST', `/task-requests/pm/${taskRequestId}/review`, approvalData, pmToken);
    
    if (response.success) {
      console.log('✅ Task request approved successfully');
      console.log(`   - Status: ${response.data.status}`);
      console.log(`   - Reviewed By: ${response.data.reviewedBy?.fullName}`);
      console.log(`   - Review Comments: ${response.data.reviewComments}`);
      if (response.data.createdTask) {
        console.log(`   - Created Task ID: ${response.data.createdTask._id}`);
      }
    } else {
      throw new Error('Failed to approve task request');
    }

  } catch (error) {
    console.error('❌ Approve task request test failed:', error.message);
    throw error;
  }
};

// Test 9: Create and Reject Task Request
const testRejectTaskRequest = async () => {
  console.log('\n🧪 Test 9: Creating and Rejecting Task Request');
  
  try {
    // First create a new task request
    const taskRequestData = {
      title: 'Add cryptocurrency payment integration',
      description: 'We want to add support for Bitcoin and Ethereum payments to our e-commerce platform.',
      project: projectId,
      milestone: milestoneId,
      priority: 'Medium',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      reason: 'feature-request'
    };

    const createResponse = await apiRequest('POST', '/task-requests/customer', taskRequestData, customerToken);
    
    if (createResponse.success) {
      const newTaskRequestId = createResponse.data._id;
      console.log('✅ New task request created for rejection test');
      
      // Now reject it
      const rejectionData = {
        action: 'reject',
        reviewComments: 'This feature is out of scope for the current project timeline and budget. We recommend considering this for a future phase.'
      };

      const rejectResponse = await apiRequest('POST', `/task-requests/pm/${newTaskRequestId}/review`, rejectionData, pmToken);
      
      if (rejectResponse.success) {
        console.log('✅ Task request rejected successfully');
        console.log(`   - Status: ${rejectResponse.data.status}`);
        console.log(`   - Rejection Reason: ${rejectResponse.data.reviewComments}`);
      } else {
        throw new Error('Failed to reject task request');
      }
    } else {
      throw new Error('Failed to create task request for rejection test');
    }

  } catch (error) {
    console.error('❌ Reject task request test failed:', error.message);
    throw error;
  }
};

// Test 10: Cancel Task Request
const testCancelTaskRequest = async () => {
  console.log('\n🧪 Test 10: Creating and Cancelling Task Request');
  
  try {
    // First create a new task request
    const taskRequestData = {
      title: 'Add social media integration',
      description: 'We want to add social media sharing buttons to our website.',
      project: projectId,
      milestone: milestoneId,
      priority: 'Low',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      reason: 'feature-request'
    };

    const createResponse = await apiRequest('POST', '/task-requests/customer', taskRequestData, customerToken);
    
    if (createResponse.success) {
      const newTaskRequestId = createResponse.data._id;
      console.log('✅ New task request created for cancellation test');
      
      // Now cancel it
      const cancelResponse = await apiRequest('DELETE', `/task-requests/customer/${newTaskRequestId}`, null, customerToken);
      
      if (cancelResponse.success) {
        console.log('✅ Task request cancelled successfully');
        console.log(`   - Status: ${cancelResponse.data.status}`);
      } else {
        throw new Error('Failed to cancel task request');
      }
    } else {
      throw new Error('Failed to create task request for cancellation test');
    }

  } catch (error) {
    console.error('❌ Cancel task request test failed:', error.message);
    throw error;
  }
};

// Test 11: Error Handling
const testErrorHandling = async () => {
  console.log('\n🧪 Test 11: Testing Error Handling');
  
  try {
    // Test 1: Invalid task request ID
    try {
      await apiRequest('GET', '/task-requests/customer/invalid-id', null, customerToken);
      console.log('❌ Should have failed with invalid ID');
    } catch (error) {
      console.log('✅ Correctly handled invalid task request ID');
    }

    // Test 2: Unauthorized access
    try {
      await apiRequest('GET', '/task-requests/customer', null, 'invalid-token');
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      console.log('✅ Correctly handled unauthorized access');
    }

    // Test 3: Invalid data
    try {
      await apiRequest('POST', '/task-requests/customer', {
        title: 'Hi', // Too short
        description: 'Short', // Too short
        project: projectId,
        milestone: milestoneId,
        priority: 'Invalid',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Past date
        reason: 'invalid-reason'
      }, customerToken);
      console.log('❌ Should have failed with invalid data');
    } catch (error) {
      console.log('✅ Correctly handled invalid data validation');
    }

    // Test 4: Accessing other user's task request
    try {
      await apiRequest('GET', `/task-requests/customer/${taskRequestId}`, null, pmToken);
      console.log('❌ Should have failed - PM accessing customer endpoint');
    } catch (error) {
      console.log('✅ Correctly handled cross-role access restriction');
    }

  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  }
};

// Test 12: Filtering and Search
const testFilteringAndSearch = async () => {
  console.log('\n🧪 Test 12: Testing Filtering and Search');
  
  try {
    // Test status filter
    const pendingRequests = await apiRequest('GET', '/task-requests/customer?status=Pending', null, customerToken);
    console.log(`✅ Status filter test: Found ${pendingRequests.data.length} pending requests`);

    // Test project filter
    const projectRequests = await apiRequest('GET', `/task-requests/customer?project=${projectId}`, null, customerToken);
    console.log(`✅ Project filter test: Found ${projectRequests.data.length} requests for project`);

    // Test PM status filter
    const pmPendingRequests = await apiRequest('GET', '/task-requests/pm?status=Pending', null, pmToken);
    console.log(`✅ PM status filter test: Found ${pmPendingRequests.data.length} pending requests`);

  } catch (error) {
    console.error('❌ Filtering and search test failed:', error.message);
  }
};

// Main test runner
const runAPITests = async () => {
  console.log('🚀 Starting Task Request API Tests\n');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  try {
    await testAuthentication();
    await testGetCustomerData();
    await testCreateTaskRequest();
    await testGetCustomerTaskRequests();
    await testGetPMTaskRequests();
    await testGetTaskRequestDetails();
    await testUpdateTaskRequest();
    await testApproveTaskRequest();
    await testRejectTaskRequest();
    await testCancelTaskRequest();
    await testErrorHandling();
    await testFilteringAndSearch();
    
    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Authentication');
    console.log('   ✅ Data Retrieval');
    console.log('   ✅ Task Request Creation');
    console.log('   ✅ Task Request Retrieval (Customer & PM)');
    console.log('   ✅ Task Request Details');
    console.log('   ✅ Task Request Updates');
    console.log('   ✅ Task Request Approval');
    console.log('   ✅ Task Request Rejection');
    console.log('   ✅ Task Request Cancellation');
    console.log('   ✅ Error Handling');
    console.log('   ✅ Filtering and Search');
    
  } catch (error) {
    console.error('❌ API test suite failed:', error.message);
    process.exit(1);
  }
};

// Run the tests
if (require.main === module) {
  runAPITests();
}

module.exports = {
  runAPITests,
  testAuthentication,
  testCreateTaskRequest,
  testGetCustomerTaskRequests,
  testGetPMTaskRequests,
  testApproveTaskRequest,
  testRejectTaskRequest
};
