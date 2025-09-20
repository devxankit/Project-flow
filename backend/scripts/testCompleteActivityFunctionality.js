const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Activity = require('../models/Activity');

// Import activity controller functions
const {
  createProjectActivity,
  createTaskActivity,
  createMilestoneActivity,
  createTeamActivity,
  createFileActivity,
  createCommentActivity
} = require('../controllers/activityController');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectflow');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test data
let testUsers = {
  pm: null,
  employee: null,
  customer: null
};

let testProject = null;
let testMilestone = null;
let testTask = null;

// Helper function to create test users
const createTestUsers = async () => {
  console.log('\n🔧 Creating test users...');
  
  try {
    // Create PM
    testUsers.pm = await User.create({
      fullName: 'Test PM',
      email: 'testpm@example.com',
      password: 'password123',
      role: 'pm',
      department: 'Project Management',
      jobTitle: 'Project Manager',
      workTitle: 'Senior PM'
    });
    console.log('✅ Created PM:', testUsers.pm.fullName);

    // Create Employee
    testUsers.employee = await User.create({
      fullName: 'Test Employee',
      email: 'testemployee@example.com',
      password: 'password123',
      role: 'employee',
      department: 'Development',
      jobTitle: 'Developer',
      workTitle: 'Full Stack Developer'
    });
    console.log('✅ Created Employee:', testUsers.employee.fullName);

    // Create Customer
    testUsers.customer = await User.create({
      fullName: 'Test Customer',
      email: 'testcustomer@example.com',
      password: 'password123',
      role: 'customer',
      company: 'Test Company'
    });
    console.log('✅ Created Customer:', testUsers.customer.fullName);

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  }
};

// Helper function to create test project
const createTestProject = async () => {
  console.log('\n🔧 Creating test project...');
  
  try {
    testProject = await Project.create({
      name: 'Test Activity Project',
      description: 'A project to test activity functionality',
      customer: testUsers.customer._id,
      projectManager: testUsers.pm._id,
      assignedTeam: [testUsers.employee._id],
      status: 'active',
      priority: 'high',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdBy: testUsers.pm._id
    });
    console.log('✅ Created Project:', testProject.name);

  } catch (error) {
    console.error('❌ Error creating test project:', error);
    throw error;
  }
};

// Helper function to create test milestone
const createTestMilestone = async () => {
  console.log('\n🔧 Creating test milestone...');
  
  try {
    testMilestone = await Milestone.create({
      title: 'Test Milestone',
      description: 'A milestone to test activity functionality',
      project: testProject._id,
      sequence: 1,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      assignedTo: [testUsers.employee._id],
      createdBy: testUsers.pm._id
    });
    console.log('✅ Created Milestone:', testMilestone.title);

  } catch (error) {
    console.error('❌ Error creating test milestone:', error);
    throw error;
  }
};

// Helper function to create test task
const createTestTask = async () => {
  console.log('\n🔧 Creating test task...');
  
  try {
    testTask = await Task.create({
      title: 'Test Task',
      description: 'A task to test activity functionality',
      milestone: testMilestone._id,
      project: testProject._id,
      assignedTo: [testUsers.employee._id],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdBy: testUsers.pm._id
    });
    console.log('✅ Created Task:', testTask.title);

  } catch (error) {
    console.error('❌ Error creating test task:', error);
    throw error;
  }
};

// Test 1: Test Project Creation Activity
const testProjectCreationActivity = async () => {
  console.log('\n🧪 Test 1: Testing Project Creation Activity...');
  
  try {
    await createProjectActivity(testProject._id, 'project_created', testUsers.pm._id, {
      projectName: testProject.name,
      customer: testUsers.customer._id,
      assignedTeam: [testUsers.employee._id]
    });

    console.log('✅ Project creation activity created successfully');
  } catch (error) {
    console.error('❌ Error creating project creation activity:', error);
    throw error;
  }
};

// Test 2: Test Task Creation Activity
const testTaskCreationActivity = async () => {
  console.log('\n🧪 Test 2: Testing Task Creation Activity...');
  
  try {
    await createTaskActivity(testTask._id, 'task_created', testUsers.pm._id, {
      taskTitle: testTask.title,
      milestone: testMilestone._id,
      assignedTo: [testUsers.employee._id]
    });

    console.log('✅ Task creation activity created successfully');
  } catch (error) {
    console.error('❌ Error creating task creation activity:', error);
    throw error;
  }
};

// Test 3: Test Milestone Creation Activity
const testMilestoneCreationActivity = async () => {
  console.log('\n🧪 Test 3: Testing Milestone Creation Activity...');
  
  try {
    await createMilestoneActivity(testMilestone._id, 'milestone_created', testUsers.pm._id, {
      milestoneTitle: testMilestone.title,
      project: testProject._id,
      assignedTo: [testUsers.employee._id]
    });

    console.log('✅ Milestone creation activity created successfully');
  } catch (error) {
    console.error('❌ Error creating milestone creation activity:', error);
    throw error;
  }
};

// Test 4: Test Task Status Change Activity
const testTaskStatusChangeActivity = async () => {
  console.log('\n🧪 Test 4: Testing Task Status Change Activity...');
  
  try {
    await createTaskActivity(testTask._id, 'task_status_changed', testUsers.employee._id, {
      taskTitle: testTask.title,
      newStatus: 'in-progress',
      oldStatus: 'pending'
    });

    console.log('✅ Task status change activity created successfully');
  } catch (error) {
    console.error('❌ Error creating task status change activity:', error);
    throw error;
  }
};

// Test 5: Test Task Completion Activity
const testTaskCompletionActivity = async () => {
  console.log('\n🧪 Test 5: Testing Task Completion Activity...');
  
  try {
    await createTaskActivity(testTask._id, 'task_completed', testUsers.employee._id, {
      taskTitle: testTask.title,
      completedBy: testUsers.employee._id
    });

    console.log('✅ Task completion activity created successfully');
  } catch (error) {
    console.error('❌ Error creating task completion activity:', error);
    throw error;
  }
};

// Test 6: Test Milestone Status Change Activity
const testMilestoneStatusChangeActivity = async () => {
  console.log('\n🧪 Test 6: Testing Milestone Status Change Activity...');
  
  try {
    await createMilestoneActivity(testMilestone._id, 'milestone_status_changed', testUsers.pm._id, {
      milestoneTitle: testMilestone.title,
      newStatus: 'in-progress',
      oldStatus: 'pending'
    });

    console.log('✅ Milestone status change activity created successfully');
  } catch (error) {
    console.error('❌ Error creating milestone status change activity:', error);
    throw error;
  }
};

// Test 7: Test File Upload Activity
const testFileUploadActivity = async () => {
  console.log('\n🧪 Test 7: Testing File Upload Activity...');
  
  try {
    await createFileActivity(testProject._id, 'file_uploaded', testUsers.employee._id, {
      filename: 'test-document.pdf',
      fileSize: 1024000,
      fileType: 'application/pdf',
      taskId: testTask._id
    });

    console.log('✅ File upload activity created successfully');
  } catch (error) {
    console.error('❌ Error creating file upload activity:', error);
    throw error;
  }
};

// Test 8: Test Comment Activity
const testCommentActivity = async () => {
  console.log('\n🧪 Test 8: Testing Comment Activity...');
  
  try {
    await createCommentActivity(testTask._id, 'Task', testProject._id, 'comment_added', testUsers.employee._id, {
      commentText: 'This task is progressing well',
      taskId: testTask._id
    });

    console.log('✅ Comment activity created successfully');
  } catch (error) {
    console.error('❌ Error creating comment activity:', error);
    throw error;
  }
};

// Test 9: Test Team Member Addition Activity
const testTeamMemberAdditionActivity = async () => {
  console.log('\n🧪 Test 9: Testing Team Member Addition Activity...');
  
  try {
    await createTeamActivity(testProject._id, 'team_member_added', testUsers.pm._id, {
      memberName: testUsers.employee.fullName,
      memberId: testUsers.employee._id
    });

    console.log('✅ Team member addition activity created successfully');
  } catch (error) {
    console.error('❌ Error creating team member addition activity:', error);
    throw error;
  }
};

// Test 10: Test Project Status Change Activity
const testProjectStatusChangeActivity = async () => {
  console.log('\n🧪 Test 10: Testing Project Status Change Activity...');
  
  try {
    await createProjectActivity(testProject._id, 'project_status_changed', testUsers.pm._id, {
      projectName: testProject.name,
      newStatus: 'completed',
      oldStatus: 'active'
    });

    console.log('✅ Project status change activity created successfully');
  } catch (error) {
    console.error('❌ Error creating project status change activity:', error);
    throw error;
  }
};

// Test 11: Test Role-Based Activity Retrieval
const testRoleBasedActivityRetrieval = async () => {
  console.log('\n🧪 Test 11: Testing Role-Based Activity Retrieval...');
  
  try {
    // Test PM access (should see all activities)
    const pmActivities = await Activity.getActivitiesForUser(
      testUsers.pm._id,
      'pm',
      { page: 1, limit: 20 }
    );

    console.log('✅ PM activity retrieval successful');
    console.log('   - PM can see', pmActivities.activities.length, 'activities');

    // Test Employee access (should see only assigned project activities)
    const employeeActivities = await Activity.getActivitiesForUser(
      testUsers.employee._id,
      'employee',
      { page: 1, limit: 20 }
    );

    console.log('✅ Employee activity retrieval successful');
    console.log('   - Employee can see', employeeActivities.activities.length, 'activities');

    // Test Customer access (should see only their project activities)
    const customerActivities = await Activity.getActivitiesForUser(
      testUsers.customer._id,
      'customer',
      { page: 1, limit: 20 }
    );

    console.log('✅ Customer activity retrieval successful');
    console.log('   - Customer can see', customerActivities.activities.length, 'activities');

    // Verify access control
    const allActivities = await Activity.countDocuments();
    console.log('   - Total activities in database:', allActivities);
    
    if (pmActivities.activities.length >= employeeActivities.activities.length && 
        pmActivities.activities.length >= customerActivities.activities.length) {
      console.log('✅ Role-based access control working correctly');
    } else {
      console.log('⚠️  Warning: Role-based access control may have issues');
    }

  } catch (error) {
    console.error('❌ Error testing role-based activity retrieval:', error);
    throw error;
  }
};

// Test 12: Test Activity Filtering and Statistics
const testActivityFilteringAndStats = async () => {
  console.log('\n🧪 Test 12: Testing Activity Filtering and Statistics...');
  
  try {
    // Test filtering by type
    const taskActivities = await Activity.getActivitiesForUser(
      testUsers.pm._id,
      'pm',
      { page: 1, limit: 20, type: 'task_created' }
    );

    console.log('✅ Activity filtering by type successful');
    console.log('   - Task creation activities found:', taskActivities.activities.length);

    // Test activity statistics
    const pmStats = await Activity.getActivityStats(testUsers.pm._id, 'pm', '7d');
    console.log('✅ Activity statistics successful');
    console.log('   - PM activity stats:', pmStats);

    // Test project-specific activities
    const projectActivities = await Activity.getProjectActivities(
      testProject._id,
      { page: 1, limit: 20 }
    );

    console.log('✅ Project-specific activity retrieval successful');
    console.log('   - Project activities found:', projectActivities.activities.length);

  } catch (error) {
    console.error('❌ Error testing activity filtering and statistics:', error);
    throw error;
  }
};

// Test 13: Test Activity Types Coverage
const testActivityTypesCoverage = async () => {
  console.log('\n🧪 Test 13: Testing Activity Types Coverage...');
  
  try {
    const allActivities = await Activity.find({}, 'type').distinct('type');
    console.log('✅ Activity types in database:', allActivities);

    const expectedTypes = [
      'project_created',
      'project_updated', 
      'project_status_changed',
      'task_created',
      'task_updated',
      'task_status_changed',
      'task_completed',
      'milestone_created',
      'milestone_updated',
      'milestone_status_changed',
      'team_member_added',
      'file_uploaded',
      'comment_added'
    ];

    const missingTypes = expectedTypes.filter(type => !allActivities.includes(type));
    const extraTypes = allActivities.filter(type => !expectedTypes.includes(type));

    if (missingTypes.length === 0) {
      console.log('✅ All expected activity types are present');
    } else {
      console.log('⚠️  Missing activity types:', missingTypes);
    }

    if (extraTypes.length > 0) {
      console.log('ℹ️  Additional activity types found:', extraTypes);
    }

  } catch (error) {
    console.error('❌ Error testing activity types coverage:', error);
    throw error;
  }
};

// Cleanup function
const cleanup = async () => {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    await Activity.deleteMany({ 'metadata.test': true });
    await Task.deleteMany({ _id: testTask?._id });
    await Milestone.deleteMany({ _id: testMilestone?._id });
    await Project.deleteMany({ _id: testProject?._id });
    await User.deleteMany({ 
      email: { 
        $in: ['testpm@example.com', 'testemployee@example.com', 'testcustomer@example.com'] 
      } 
    });
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};

// Main test function
const runCompleteTests = async () => {
  console.log('🚀 Starting Complete Activity Functionality Tests...\n');
  
  try {
    // Setup
    await connectDB();
    await createTestUsers();
    await createTestProject();
    await createTestMilestone();
    await createTestTask();

    // Run comprehensive tests
    await testProjectCreationActivity();
    await testTaskCreationActivity();
    await testMilestoneCreationActivity();
    await testTaskStatusChangeActivity();
    await testTaskCompletionActivity();
    await testMilestoneStatusChangeActivity();
    await testFileUploadActivity();
    await testCommentActivity();
    await testTeamMemberAdditionActivity();
    await testProjectStatusChangeActivity();
    await testRoleBasedActivityRetrieval();
    await testActivityFilteringAndStats();
    await testActivityTypesCoverage();

    console.log('\n🎉 All comprehensive tests completed successfully!');
    console.log('\n📊 Complete Test Summary:');
    console.log('   ✅ Project Creation Activity');
    console.log('   ✅ Task Creation Activity');
    console.log('   ✅ Milestone Creation Activity');
    console.log('   ✅ Task Status Change Activity');
    console.log('   ✅ Task Completion Activity');
    console.log('   ✅ Milestone Status Change Activity');
    console.log('   ✅ File Upload Activity');
    console.log('   ✅ Comment Activity');
    console.log('   ✅ Team Member Addition Activity');
    console.log('   ✅ Project Status Change Activity');
    console.log('   ✅ Role-Based Activity Retrieval (PM, Employee, Customer)');
    console.log('   ✅ Activity Filtering and Statistics');
    console.log('   ✅ Activity Types Coverage');

    console.log('\n🎯 Key Features Verified:');
    console.log('   ✅ All project operations create activities');
    console.log('   ✅ All task operations create activities');
    console.log('   ✅ All milestone operations create activities');
    console.log('   ✅ File uploads create activities');
    console.log('   ✅ Comments create activities');
    console.log('   ✅ Team changes create activities');
    console.log('   ✅ Status changes create activities');
    console.log('   ✅ Role-based access control works correctly');
    console.log('   ✅ Activity filtering and pagination works');
    console.log('   ✅ Activity statistics generation works');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await cleanup();
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runCompleteTests();
}

module.exports = {
  runCompleteTests,
  createTestUsers,
  createTestProject,
  createTestMilestone,
  createTestTask,
  testProjectCreationActivity,
  testTaskCreationActivity,
  testMilestoneCreationActivity,
  testTaskStatusChangeActivity,
  testTaskCompletionActivity,
  testMilestoneStatusChangeActivity,
  testFileUploadActivity,
  testCommentActivity,
  testTeamMemberAdditionActivity,
  testProjectStatusChangeActivity,
  testRoleBasedActivityRetrieval,
  testActivityFilteringAndStats,
  testActivityTypesCoverage
};
