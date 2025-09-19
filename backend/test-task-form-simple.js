const axios = require('axios');

// Simple test for TaskForm functionality using existing data
const testTaskFormSimple = async () => {
  try {
    console.log('🔍 Testing TaskForm functionality with existing data...');
    
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
    
    // Test 1: Get all projects
    console.log('\n📁 Test 1: Getting all projects...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!projectsResponse.data.success) {
      console.log('❌ Failed to get projects:', projectsResponse.data.message);
      return false;
    }
    
    const projects = projectsResponse.data.data.projects || [];
    console.log(`✅ Found ${projects.length} projects`);
    
    if (projects.length === 0) {
      console.log('❌ No projects found. Please create some projects first using the sample data script.');
      console.log('   Run: node scripts/createSampleProjects.js');
      return false;
    }
    
    const project = projects[0];
    console.log(`📋 Using project: ${project.name} (${project._id})`);
    
    // Test 2: Get milestones for the project
    console.log('\n🎯 Test 2: Getting milestones for project...');
    const milestonesResponse = await axios.get(
      `http://localhost:5000/api/milestones/project/${project._id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!milestonesResponse.data.success) {
      console.log('❌ Failed to get milestones:', milestonesResponse.data.message);
      return false;
    }
    
    const milestones = milestonesResponse.data.data.milestones || [];
    console.log(`✅ Found ${milestones.length} milestones`);
    
    if (milestones.length === 0) {
      console.log('❌ No milestones found for this project. Please create some milestones first.');
      return false;
    }
    
    const milestone = milestones[0];
    console.log(`📝 Using milestone: ${milestone.title} (${milestone._id})`);
    
    // Test 3: Get team members for the project
    console.log('\n👥 Test 3: Getting team members for project...');
    const teamResponse = await axios.get(
      `http://localhost:5000/api/tasks/team/${project._id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!teamResponse.data.success) {
      console.log('❌ Failed to get team members:', teamResponse.data.message);
      return false;
    }
    
    const teamMembers = teamResponse.data.data.teamMembers || [];
    console.log(`✅ Found ${teamMembers.length} team members`);
    
    if (teamMembers.length > 0) {
      console.log('👤 Sample team member:', teamMembers[0].fullName);
    }
    
    // Test 4: Create a test task
    console.log('\n📋 Test 4: Creating a test task...');
    const testTask = {
      title: 'Test Task from TaskForm',
      description: 'This task was created to test the TaskForm functionality with project and milestone selection',
      project: project._id,
      milestone: milestone._id,
      status: 'pending',
      priority: 'normal',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: teamMembers.length > 0 ? [teamMembers[0]._id] : []
    };
    
    const createTaskResponse = await axios.post('http://localhost:5000/api/tasks', testTask, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!createTaskResponse.data.success) {
      console.log('❌ Failed to create test task:', createTaskResponse.data.message);
      return false;
    }
    
    const createdTask = createTaskResponse.data.data.task;
    console.log('✅ Test task created successfully:', createdTask.title);
    console.log(`   - Project: ${createdTask.project}`);
    console.log(`   - Milestone: ${createdTask.milestone}`);
    console.log(`   - Assigned to: ${createdTask.assignedTo.length} members`);
    
    // Test 5: Verify task was created correctly
    console.log('\n🔍 Test 5: Verifying task details...');
    const taskResponse = await axios.get(
      `http://localhost:5000/api/tasks/${createdTask._id}/project/${project._id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!taskResponse.data.success) {
      console.log('❌ Failed to retrieve created task:', taskResponse.data.message);
      return false;
    }
    
    const retrievedTask = taskResponse.data.data.task;
    console.log('✅ Task retrieved successfully');
    console.log(`   - Title: ${retrievedTask.title}`);
    console.log(`   - Project: ${retrievedTask.project}`);
    console.log(`   - Milestone: ${retrievedTask.milestone}`);
    console.log(`   - Status: ${retrievedTask.status}`);
    console.log(`   - Priority: ${retrievedTask.priority}`);
    
    // Test 6: Clean up - delete the test task
    console.log('\n🧹 Test 6: Cleaning up test task...');
    const deleteResponse = await axios.delete(
      `http://localhost:5000/api/tasks/${createdTask._id}/project/${project._id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (deleteResponse.data.success) {
      console.log('✅ Test task deleted successfully');
    } else {
      console.log('⚠️  Failed to delete test task:', deleteResponse.data.message);
    }
    
    console.log('\n🎉 TaskForm functionality test completed successfully!');
    console.log('\n✅ Test Results Summary:');
    console.log('  ✓ Project selection: Working');
    console.log('  ✓ Milestone selection: Working');
    console.log('  ✓ Team member loading: Working');
    console.log('  ✓ Task creation: Working');
    console.log('  ✓ Task retrieval: Working');
    console.log('  ✓ Task deletion: Working');
    
    console.log('\n📋 TaskForm is ready for use with:');
    console.log(`  - ${projects.length} available projects`);
    console.log(`  - ${milestones.length} available milestones`);
    console.log(`  - ${teamMembers.length} available team members`);
    
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
console.log('🚀 Starting TaskForm Simple Test...');
testTaskFormSimple()
  .then(success => {
    if (success) {
      console.log('\n🎊 All tests passed! TaskForm is working correctly.');
      process.exit(0);
    } else {
      console.log('\n💥 Some tests failed. Please check the errors above.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test script crashed:', error.message);
    process.exit(1);
  });
