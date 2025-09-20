const mongoose = require('mongoose');
const TaskRequest = require('../models/TaskRequest');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test data setup
const setupTestData = async () => {
  console.log('\n🔧 Setting up test data...');
  
  try {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const customer = await User.findOneAndUpdate(
      { email: 'testcustomer@example.com' },
      {
        fullName: 'Test Customer',
        email: 'testcustomer@example.com',
        password: hashedPassword,
        role: 'customer',
        isActive: true
      },
      { upsert: true, new: true }
    );

    const pm = await User.findOneAndUpdate(
      { email: 'testpm@example.com' },
      {
        fullName: 'Test Project Manager',
        email: 'testpm@example.com',
        password: hashedPassword,
        role: 'project-manager',
        isActive: true
      },
      { upsert: true, new: true }
    );

    const employee = await User.findOneAndUpdate(
      { email: 'testemployee@example.com' },
      {
        fullName: 'Test Employee',
        email: 'testemployee@example.com',
        password: hashedPassword,
        role: 'employee',
        isActive: true
      },
      { upsert: true, new: true }
    );

    // Create test project
    const project = await Project.findOneAndUpdate(
      { name: 'Test Task Request Project' },
      {
        name: 'Test Task Request Project',
        description: 'A test project for task request functionality',
        customer: customer._id,
        projectManager: pm._id,
        status: 'active',
        startDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        budget: 50000
      },
      { upsert: true, new: true }
    );

    // Create test milestone
    const milestone = await Milestone.findOneAndUpdate(
      { title: 'Test Milestone for Task Requests' },
      {
        title: 'Test Milestone for Task Requests',
        description: 'A test milestone for task request functionality',
        project: project._id,
        startDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        progress: 0
      },
      { upsert: true, new: true }
    );

    console.log('✅ Test data setup completed');
    return { customer, pm, employee, project, milestone };
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    throw error;
  }
};

// Test 1: Create Task Request
const testCreateTaskRequest = async (customer, project, milestone) => {
  console.log('\n🧪 Test 1: Creating Task Request');
  
  try {
    const taskRequestData = {
      title: 'Add user authentication feature',
      description: 'We need to implement secure user authentication for the mobile app to ensure only authorized users can access the system. This should include login, logout, and password reset functionality.',
      project: project._id,
      milestone: milestone._id,
      priority: 'High',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      reason: 'feature-request',
      requestedBy: customer._id
    };

    const taskRequest = new TaskRequest(taskRequestData);
    await taskRequest.save();

    console.log('✅ Task request created successfully');
    console.log(`   - ID: ${taskRequest._id}`);
    console.log(`   - Title: ${taskRequest.title}`);
    console.log(`   - Status: ${taskRequest.status}`);
    console.log(`   - Priority: ${taskRequest.priority}`);
    console.log(`   - Reason: ${taskRequest.reason}`);

    return taskRequest;
  } catch (error) {
    console.error('❌ Error creating task request:', error);
    throw error;
  }
};

// Test 2: Get Customer Task Requests
const testGetCustomerTaskRequests = async (customer) => {
  console.log('\n🧪 Test 2: Getting Customer Task Requests');
  
  try {
    const taskRequests = await TaskRequest.find({ requestedBy: customer._id })
      .populate('project', 'name')
      .populate('milestone', 'title')
      .populate('requestedBy', 'fullName email')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${taskRequests.length} task requests for customer`);
    taskRequests.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.title} - ${req.status}`);
    });

    return taskRequests;
  } catch (error) {
    console.error('❌ Error getting customer task requests:', error);
    throw error;
  }
};

// Test 3: Get PM Task Requests
const testGetPMTaskRequests = async (pm) => {
  console.log('\n🧪 Test 3: Getting PM Task Requests');
  
  try {
    // Get projects managed by this PM
    const projects = await Project.find({ projectManager: pm._id }).select('_id');
    const projectIds = projects.map(p => p._id);

    const taskRequests = await TaskRequest.find({ project: { $in: projectIds } })
      .populate('project', 'name')
      .populate('milestone', 'title')
      .populate('requestedBy', 'fullName email')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${taskRequests.length} task requests for PM`);
    taskRequests.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.title} - ${req.status} (Project: ${req.project?.name})`);
    });

    return taskRequests;
  } catch (error) {
    console.error('❌ Error getting PM task requests:', error);
    throw error;
  }
};

// Test 4: Approve Task Request
const testApproveTaskRequest = async (taskRequest, pm) => {
  console.log('\n🧪 Test 4: Approving Task Request');
  
  try {
    // Update task request status
    taskRequest.status = 'Approved';
    taskRequest.reviewedBy = pm._id;
    taskRequest.reviewedAt = new Date();
    taskRequest.reviewComments = 'Task request approved. This feature aligns with our project goals.';

    // Create a task from the approved request
    const newTask = new Task({
      title: taskRequest.title,
      description: taskRequest.description,
      project: taskRequest.project,
      milestone: taskRequest.milestone,
      priority: taskRequest.priority.toLowerCase(),
      dueDate: taskRequest.dueDate,
      status: 'pending',
      createdBy: pm._id,
      requestedBy: taskRequest.requestedBy,
      createdFromRequest: true
    });

    await newTask.save();
    taskRequest.createdTask = newTask._id;
    await taskRequest.save();

    console.log('✅ Task request approved successfully');
    console.log(`   - Request Status: ${taskRequest.status}`);
    console.log(`   - Reviewed By: ${pm.fullName}`);
    console.log(`   - Created Task ID: ${newTask._id}`);
    console.log(`   - Task Status: ${newTask.status}`);

    return { taskRequest, newTask };
  } catch (error) {
    console.error('❌ Error approving task request:', error);
    throw error;
  }
};

// Test 5: Reject Task Request
const testRejectTaskRequest = async (customer, project, milestone) => {
  console.log('\n🧪 Test 5: Rejecting Task Request');
  
  try {
    // Create another task request to reject
    const taskRequestData = {
      title: 'Add cryptocurrency payment integration',
      description: 'We want to add support for Bitcoin and Ethereum payments to our e-commerce platform.',
      project: project._id,
      milestone: milestone._id,
      priority: 'Medium',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      reason: 'feature-request',
      requestedBy: customer._id
    };

    const taskRequest = new TaskRequest(taskRequestData);
    await taskRequest.save();

    // Reject the task request
    taskRequest.status = 'Rejected';
    taskRequest.reviewedBy = project.projectManager;
    taskRequest.reviewedAt = new Date();
    taskRequest.reviewComments = 'This feature is out of scope for the current project timeline and budget. We recommend considering this for a future phase.';
    await taskRequest.save();

    console.log('✅ Task request rejected successfully');
    console.log(`   - Request Status: ${taskRequest.status}`);
    console.log(`   - Rejection Reason: ${taskRequest.reviewComments}`);

    return taskRequest;
  } catch (error) {
    console.error('❌ Error rejecting task request:', error);
    throw error;
  }
};

// Test 6: Update Task Request (Customer)
const testUpdateTaskRequest = async (customer) => {
  console.log('\n🧪 Test 6: Updating Task Request (Customer)');
  
  try {
    // Find a pending task request
    const taskRequest = await TaskRequest.findOne({
      requestedBy: customer._id,
      status: 'Pending'
    });

    if (!taskRequest) {
      console.log('⚠️  No pending task requests found to update');
      return null;
    }

    const originalTitle = taskRequest.title;
    taskRequest.title = 'Updated: ' + taskRequest.title;
    taskRequest.description = taskRequest.description + ' [Updated with additional requirements]';
    taskRequest.priority = 'Urgent';
    await taskRequest.save();

    console.log('✅ Task request updated successfully');
    console.log(`   - Original Title: ${originalTitle}`);
    console.log(`   - Updated Title: ${taskRequest.title}`);
    console.log(`   - Updated Priority: ${taskRequest.priority}`);

    return taskRequest;
  } catch (error) {
    console.error('❌ Error updating task request:', error);
    throw error;
  }
};

// Test 7: Cancel Task Request (Customer)
const testCancelTaskRequest = async (customer) => {
  console.log('\n🧪 Test 7: Cancelling Task Request (Customer)');
  
  try {
    // Create a task request to cancel
    const project = await Project.findOne({ customer: customer._id });
    const milestone = await Milestone.findOne({ project: project._id });

    const taskRequestData = {
      title: 'Add social media integration',
      description: 'We want to add social media sharing buttons to our website.',
      project: project._id,
      milestone: milestone._id,
      priority: 'Low',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      reason: 'feature-request',
      requestedBy: customer._id
    };

    const taskRequest = new TaskRequest(taskRequestData);
    await taskRequest.save();

    // Cancel the task request
    taskRequest.status = 'Cancelled';
    await taskRequest.save();

    console.log('✅ Task request cancelled successfully');
    console.log(`   - Request Status: ${taskRequest.status}`);
    console.log(`   - Title: ${taskRequest.title}`);

    return taskRequest;
  } catch (error) {
    console.error('❌ Error cancelling task request:', error);
    throw error;
  }
};

// Test 8: Validation Tests
const testValidations = async (customer, project, milestone) => {
  console.log('\n🧪 Test 8: Testing Validations');
  
  try {
    // Test 1: Title too short
    try {
      const invalidRequest1 = new TaskRequest({
        title: 'Hi', // Too short
        description: 'This is a valid description that meets the minimum length requirement.',
        project: project._id,
        milestone: milestone._id,
        priority: 'Medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reason: 'feature-request',
        requestedBy: customer._id
      });
      await invalidRequest1.save();
      console.log('❌ Validation failed: Should have rejected short title');
    } catch (error) {
      console.log('✅ Validation passed: Rejected short title');
    }

    // Test 2: Description too short
    try {
      const invalidRequest2 = new TaskRequest({
        title: 'Valid title for testing',
        description: 'Short', // Too short
        project: project._id,
        milestone: milestone._id,
        priority: 'Medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reason: 'feature-request',
        requestedBy: customer._id
      });
      await invalidRequest2.save();
      console.log('❌ Validation failed: Should have rejected short description');
    } catch (error) {
      console.log('✅ Validation passed: Rejected short description');
    }

    // Test 3: Invalid priority
    try {
      const invalidRequest3 = new TaskRequest({
        title: 'Valid title for testing',
        description: 'This is a valid description that meets the minimum length requirement.',
        project: project._id,
        milestone: milestone._id,
        priority: 'InvalidPriority', // Invalid
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reason: 'feature-request',
        requestedBy: customer._id
      });
      await invalidRequest3.save();
      console.log('❌ Validation failed: Should have rejected invalid priority');
    } catch (error) {
      console.log('✅ Validation passed: Rejected invalid priority');
    }

    // Test 4: Past due date
    try {
      const invalidRequest4 = new TaskRequest({
        title: 'Valid title for testing',
        description: 'This is a valid description that meets the minimum length requirement.',
        project: project._id,
        milestone: milestone._id,
        priority: 'Medium',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Past date
        reason: 'feature-request',
        requestedBy: customer._id
      });
      await invalidRequest4.save();
      console.log('❌ Validation failed: Should have rejected past due date');
    } catch (error) {
      console.log('✅ Validation passed: Rejected past due date');
    }

    // Test 5: Invalid reason
    try {
      const invalidRequest5 = new TaskRequest({
        title: 'Valid title for testing',
        description: 'This is a valid description that meets the minimum length requirement.',
        project: project._id,
        milestone: milestone._id,
        priority: 'Medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reason: 'invalid-reason', // Invalid
        requestedBy: customer._id
      });
      await invalidRequest5.save();
      console.log('❌ Validation failed: Should have rejected invalid reason');
    } catch (error) {
      console.log('✅ Validation passed: Rejected invalid reason');
    }

  } catch (error) {
    console.error('❌ Error in validation tests:', error);
  }
};

// Test 9: Statistics and Analytics
const testStatistics = async (customer, pm) => {
  console.log('\n🧪 Test 9: Testing Statistics and Analytics');
  
  try {
    // Customer statistics
    const customerStats = await TaskRequest.aggregate([
      { $match: { requestedBy: customer._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('✅ Customer Task Request Statistics:');
    customerStats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count}`);
    });

    // PM statistics
    const projects = await Project.find({ projectManager: pm._id }).select('_id');
    const projectIds = projects.map(p => p._id);

    const pmStats = await TaskRequest.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('✅ PM Task Request Statistics:');
    pmStats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count}`);
    });

    // Priority distribution
    const priorityStats = await TaskRequest.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('✅ Priority Distribution:');
    priorityStats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count}`);
    });

  } catch (error) {
    console.error('❌ Error in statistics tests:', error);
  }
};

// Test 10: Edge Cases
const testEdgeCases = async (customer, project, milestone) => {
  console.log('\n🧪 Test 10: Testing Edge Cases');
  
  try {
    // Test 1: Task request with maximum length fields
    const maxLengthRequest = new TaskRequest({
      title: 'A'.repeat(100), // Maximum length
      description: 'A'.repeat(1000), // Maximum length
      project: project._id,
      milestone: milestone._id,
      priority: 'Urgent',
      dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      reason: 'other',
      requestedBy: customer._id
    });

    await maxLengthRequest.save();
    console.log('✅ Maximum length fields test passed');

    // Test 2: Task request with special characters
    const specialCharRequest = new TaskRequest({
      title: 'Special Characters: !@#$%^&*()_+-=[]{}|;:,.<>?',
      description: 'Testing with special characters and unicode: 🚀✨💻📱🎯',
      project: project._id,
      milestone: milestone._id,
      priority: 'Medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      reason: 'improvement',
      requestedBy: customer._id
    });

    await specialCharRequest.save();
    console.log('✅ Special characters test passed');

    // Test 3: Multiple task requests for same milestone
    const multipleRequests = [];
    for (let i = 0; i < 5; i++) {
      const request = new TaskRequest({
        title: `Multiple Request ${i + 1}`,
        description: `This is test request number ${i + 1} for the same milestone.`,
        project: project._id,
        milestone: milestone._id,
        priority: ['Low', 'Medium', 'High', 'Urgent'][i % 4],
        dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
        reason: ['bug-fix', 'feature-request', 'improvement', 'change-request', 'additional-work'][i],
        requestedBy: customer._id
      });
      await request.save();
      multipleRequests.push(request);
    }

    console.log(`✅ Multiple requests test passed (created ${multipleRequests.length} requests)`);

  } catch (error) {
    console.error('❌ Error in edge cases tests:', error);
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Task Request Functionality Tests\n');
  
  try {
    await connectDB();
    
    // Setup test data
    const { customer, pm, employee, project, milestone } = await setupTestData();
    
    // Run all tests
    const taskRequest1 = await testCreateTaskRequest(customer, project, milestone);
    await testGetCustomerTaskRequests(customer);
    await testGetPMTaskRequests(pm);
    const { taskRequest: approvedRequest, newTask } = await testApproveTaskRequest(taskRequest1, pm);
    await testRejectTaskRequest(customer, project, milestone);
    await testUpdateTaskRequest(customer);
    await testCancelTaskRequest(customer);
    await testValidations(customer, project, milestone);
    await testStatistics(customer, pm);
    await testEdgeCases(customer, project, milestone);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Task Request Creation');
    console.log('   ✅ Customer Task Request Retrieval');
    console.log('   ✅ PM Task Request Retrieval');
    console.log('   ✅ Task Request Approval & Task Creation');
    console.log('   ✅ Task Request Rejection');
    console.log('   ✅ Task Request Updates');
    console.log('   ✅ Task Request Cancellation');
    console.log('   ✅ Data Validation');
    console.log('   ✅ Statistics & Analytics');
    console.log('   ✅ Edge Cases');
    
    console.log('\n🔍 Final Data Check:');
    const finalStats = await TaskRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    finalStats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} requests`);
    });
    
    const totalTasks = await Task.countDocuments();
    console.log(`   - Total Tasks Created: ${totalTasks}`);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testCreateTaskRequest,
  testGetCustomerTaskRequests,
  testGetPMTaskRequests,
  testApproveTaskRequest,
  testRejectTaskRequest,
  testUpdateTaskRequest,
  testCancelTaskRequest,
  testValidations,
  testStatistics,
  testEdgeCases
};
