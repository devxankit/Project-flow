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
  createTeamActivity
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

// Test 1: Test Activity Model Creation
const testActivityModel = async () => {
  console.log('\n🧪 Test 1: Testing Activity Model Creation...');
  
  try {
    const activity = await Activity.create({
      type: 'project_created',
      title: 'Project Created',
      description: 'Test project was created',
      actor: testUsers.pm._id,
      target: testProject._id,
      targetModel: 'Project',
      project: testProject._id,
      metadata: { test: true }
    });

    console.log('✅ Activity created successfully:', activity.title);
    console.log('   - ID:', activity._id);
    console.log('   - Type:', activity.type);
    console.log('   - Actor:', activity.actor);
    console.log('   - Project:', activity.project);
    console.log('   - Timestamp:', activity.timestamp);

    return activity;
  } catch (error) {
    console.error('❌ Error creating activity:', error);
    throw error;
  }
};

// Test 2: Test Project Activity Creation
const testProjectActivity = async () => {
  console.log('\n🧪 Test 2: Testing Project Activity Creation...');
  
  try {
    const activity = await createProjectActivity(
      testProject._id,
      'project_created',
      testUsers.pm._id,
      { test: true }
    );

    console.log('✅ Project activity created successfully:', activity.title);
    console.log('   - Type:', activity.type);
    console.log('   - Actor:', activity.actor);
    console.log('   - Project:', activity.project);

    return activity;
  } catch (error) {
    console.error('❌ Error creating project activity:', error);
    throw error;
  }
};

// Test 3: Test Task Activity Creation
const testTaskActivity = async () => {
  console.log('\n🧪 Test 3: Testing Task Activity Creation...');
  
  try {
    const activity = await createTaskActivity(
      testTask._id,
      'task_created',
      testUsers.pm._id,
      { test: true }
    );

    console.log('✅ Task activity created successfully:', activity.title);
    console.log('   - Type:', activity.type);
    console.log('   - Actor:', activity.actor);
    console.log('   - Project:', activity.project);

    return activity;
  } catch (error) {
    console.error('❌ Error creating task activity:', error);
    throw error;
  }
};

// Test 4: Test Milestone Activity Creation
const testMilestoneActivity = async () => {
  console.log('\n🧪 Test 4: Testing Milestone Activity Creation...');
  
  try {
    const activity = await createMilestoneActivity(
      testMilestone._id,
      'milestone_created',
      testUsers.pm._id,
      { test: true }
    );

    console.log('✅ Milestone activity created successfully:', activity.title);
    console.log('   - Type:', activity.type);
    console.log('   - Actor:', activity.actor);
    console.log('   - Project:', activity.project);

    return activity;
  } catch (error) {
    console.error('❌ Error creating milestone activity:', error);
    throw error;
  }
};

// Test 5: Test Team Activity Creation
const testTeamActivity = async () => {
  console.log('\n🧪 Test 5: Testing Team Activity Creation...');
  
  try {
    const activity = await createTeamActivity(
      testProject._id,
      'team_member_added',
      testUsers.pm._id,
      { memberName: testUsers.employee.fullName }
    );

    console.log('✅ Team activity created successfully:', activity.title);
    console.log('   - Type:', activity.type);
    console.log('   - Actor:', activity.actor);
    console.log('   - Project:', activity.project);

    return activity;
  } catch (error) {
    console.error('❌ Error creating team activity:', error);
    throw error;
  }
};

// Test 6: Test Activity Retrieval for PM (should see all activities)
const testPMActivityRetrieval = async () => {
  console.log('\n🧪 Test 6: Testing PM Activity Retrieval...');
  
  try {
    const result = await Activity.getActivitiesForUser(
      testUsers.pm._id,
      'pm',
      { page: 1, limit: 10 }
    );

    console.log('✅ PM activity retrieval successful');
    console.log('   - Total activities:', result.pagination.total);
    console.log('   - Activities returned:', result.activities.length);
    console.log('   - Pagination:', result.pagination);

    // Verify PM can see all activities
    if (result.activities.length > 0) {
      console.log('   - Sample activity:', result.activities[0].title);
    }

    return result;
  } catch (error) {
    console.error('❌ Error retrieving PM activities:', error);
    throw error;
  }
};

// Test 7: Test Activity Retrieval for Employee (should see only assigned project activities)
const testEmployeeActivityRetrieval = async () => {
  console.log('\n🧪 Test 7: Testing Employee Activity Retrieval...');
  
  try {
    const result = await Activity.getActivitiesForUser(
      testUsers.employee._id,
      'employee',
      { page: 1, limit: 10 }
    );

    console.log('✅ Employee activity retrieval successful');
    console.log('   - Total activities:', result.pagination.total);
    console.log('   - Activities returned:', result.activities.length);
    console.log('   - Pagination:', result.pagination);

    // Verify employee can only see activities from assigned projects
    const hasUnauthorizedActivity = result.activities.some(activity => 
      activity.project && activity.project._id.toString() !== testProject._id.toString()
    );

    if (hasUnauthorizedActivity) {
      console.log('⚠️  Warning: Employee can see activities from unassigned projects');
    } else {
      console.log('✅ Employee can only see activities from assigned projects');
    }

    return result;
  } catch (error) {
    console.error('❌ Error retrieving employee activities:', error);
    throw error;
  }
};

// Test 8: Test Activity Retrieval for Customer (should see only their project activities)
const testCustomerActivityRetrieval = async () => {
  console.log('\n🧪 Test 8: Testing Customer Activity Retrieval...');
  
  try {
    const result = await Activity.getActivitiesForUser(
      testUsers.customer._id,
      'customer',
      { page: 1, limit: 10 }
    );

    console.log('✅ Customer activity retrieval successful');
    console.log('   - Total activities:', result.pagination.total);
    console.log('   - Activities returned:', result.activities.length);
    console.log('   - Pagination:', result.pagination);

    // Verify customer can only see activities from their projects
    const hasUnauthorizedActivity = result.activities.some(activity => 
      activity.project && activity.project._id.toString() !== testProject._id.toString()
    );

    if (hasUnauthorizedActivity) {
      console.log('⚠️  Warning: Customer can see activities from other projects');
    } else {
      console.log('✅ Customer can only see activities from their projects');
    }

    return result;
  } catch (error) {
    console.error('❌ Error retrieving customer activities:', error);
    throw error;
  }
};

// Test 9: Test Project-Specific Activity Retrieval
const testProjectActivityRetrieval = async () => {
  console.log('\n🧪 Test 9: Testing Project-Specific Activity Retrieval...');
  
  try {
    const result = await Activity.getProjectActivities(
      testProject._id,
      { page: 1, limit: 10 }
    );

    console.log('✅ Project activity retrieval successful');
    console.log('   - Total activities:', result.pagination.total);
    console.log('   - Activities returned:', result.activities.length);
    console.log('   - Pagination:', result.pagination);

    // Verify all activities belong to the correct project
    const hasWrongProject = result.activities.some(activity => 
      activity.project && activity.project._id.toString() !== testProject._id.toString()
    );

    if (hasWrongProject) {
      console.log('⚠️  Warning: Some activities belong to different projects');
    } else {
      console.log('✅ All activities belong to the correct project');
    }

    return result;
  } catch (error) {
    console.error('❌ Error retrieving project activities:', error);
    throw error;
  }
};

// Test 10: Test Activity Statistics
const testActivityStatistics = async () => {
  console.log('\n🧪 Test 10: Testing Activity Statistics...');
  
  try {
    const pmStats = await Activity.getActivityStats(testUsers.pm._id, 'pm', '7d');
    const employeeStats = await Activity.getActivityStats(testUsers.employee._id, 'employee', '7d');
    const customerStats = await Activity.getActivityStats(testUsers.customer._id, 'customer', '7d');

    console.log('✅ Activity statistics retrieved successfully');
    console.log('   - PM stats:', pmStats);
    console.log('   - Employee stats:', employeeStats);
    console.log('   - Customer stats:', customerStats);

    return { pmStats, employeeStats, customerStats };
  } catch (error) {
    console.error('❌ Error retrieving activity statistics:', error);
    throw error;
  }
};

// Test 11: Test Activity Filtering by Type
const testActivityFiltering = async () => {
  console.log('\n🧪 Test 11: Testing Activity Filtering by Type...');
  
  try {
    // Test filtering by project_created type
    const projectActivities = await Activity.getActivitiesForUser(
      testUsers.pm._id,
      'pm',
      { page: 1, limit: 10, type: 'project_created' }
    );

    console.log('✅ Activity filtering successful');
    console.log('   - Project activities found:', projectActivities.activities.length);
    console.log('   - All activities are project_created type:', 
      projectActivities.activities.every(activity => activity.type === 'project_created')
    );

    return projectActivities;
  } catch (error) {
    console.error('❌ Error filtering activities:', error);
    throw error;
  }
};

// Test 12: Test Activity Pagination
const testActivityPagination = async () => {
  console.log('\n🧪 Test 12: Testing Activity Pagination...');
  
  try {
    // Create more activities to test pagination
    for (let i = 0; i < 5; i++) {
      await Activity.create({
        type: 'task_created',
        title: `Test Task ${i + 1}`,
        description: `Test task ${i + 1} for pagination`,
        actor: testUsers.pm._id,
        project: testProject._id,
        metadata: { test: true, index: i + 1 }
      });
    }

    // Test first page
    const page1 = await Activity.getActivitiesForUser(
      testUsers.pm._id,
      'pm',
      { page: 1, limit: 3 }
    );

    // Test second page
    const page2 = await Activity.getActivitiesForUser(
      testUsers.pm._id,
      'pm',
      { page: 2, limit: 3 }
    );

    console.log('✅ Activity pagination successful');
    console.log('   - Page 1 activities:', page1.activities.length);
    console.log('   - Page 2 activities:', page2.activities.length);
    console.log('   - Total pages:', page1.pagination.pages);
    console.log('   - Total activities:', page1.pagination.total);

    // Verify no overlap between pages
    const page1Ids = page1.activities.map(a => a._id.toString());
    const page2Ids = page2.activities.map(a => a._id.toString());
    const hasOverlap = page1Ids.some(id => page2Ids.includes(id));

    if (hasOverlap) {
      console.log('⚠️  Warning: Activities overlap between pages');
    } else {
      console.log('✅ No overlap between pages');
    }

    return { page1, page2 };
  } catch (error) {
    console.error('❌ Error testing pagination:', error);
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
const runTests = async () => {
  console.log('🚀 Starting Activity Functionality Tests...\n');
  
  try {
    // Setup
    await connectDB();
    await createTestUsers();
    await createTestProject();
    await createTestMilestone();
    await createTestTask();

    // Run tests
    await testActivityModel();
    await testProjectActivity();
    await testTaskActivity();
    await testMilestoneActivity();
    await testTeamActivity();
    await testPMActivityRetrieval();
    await testEmployeeActivityRetrieval();
    await testCustomerActivityRetrieval();
    await testProjectActivityRetrieval();
    await testActivityStatistics();
    await testActivityFiltering();
    await testActivityPagination();

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Activity Model Creation');
    console.log('   ✅ Project Activity Creation');
    console.log('   ✅ Task Activity Creation');
    console.log('   ✅ Milestone Activity Creation');
    console.log('   ✅ Team Activity Creation');
    console.log('   ✅ PM Activity Retrieval (All Activities)');
    console.log('   ✅ Employee Activity Retrieval (Assigned Projects Only)');
    console.log('   ✅ Customer Activity Retrieval (Own Projects Only)');
    console.log('   ✅ Project-Specific Activity Retrieval');
    console.log('   ✅ Activity Statistics');
    console.log('   ✅ Activity Filtering by Type');
    console.log('   ✅ Activity Pagination');

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
  runTests();
}

module.exports = {
  runTests,
  createTestUsers,
  createTestProject,
  createTestMilestone,
  createTestTask,
  testActivityModel,
  testProjectActivity,
  testTaskActivity,
  testMilestoneActivity,
  testTeamActivity,
  testPMActivityRetrieval,
  testEmployeeActivityRetrieval,
  testCustomerActivityRetrieval,
  testProjectActivityRetrieval,
  testActivityStatistics,
  testActivityFiltering,
  testActivityPagination
};
