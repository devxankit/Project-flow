const axios = require('axios');

// Test the complete task integration
const testTaskIntegration = async () => {
  try {
    console.log('🔍 Testing task integration...');
    
    // Login with correct PM credentials
    const pmUser = {
      email: 'alex.johnson@techcorp.com',
      password: 'PM123!'
    };
    
    console.log(`Logging in with: ${pmUser.email}`);
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', pmUser);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test getting tasks by milestone
    const milestoneId = '68cc7e209d16f225b7d2bf0a';
    const projectId = '68cc6139504c4a6c34d781b4';
    
    console.log('\n📋 Testing get tasks by milestone...');
    const tasksResponse = await axios.get(
      `http://localhost:5000/api/tasks/milestone/${milestoneId}/project/${projectId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (tasksResponse.data.success) {
      console.log('✅ Tasks retrieved successfully:', tasksResponse.data.data.tasks.length);
      const tasks = tasksResponse.data.data.tasks;
      
      if (tasks.length > 0) {
        const task = tasks[0];
        console.log('📝 Sample task:', {
          id: task._id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          attachments: task.attachments?.length || 0
        });
        
        // Test getting single task
        console.log('\n🔍 Testing get single task...');
        const singleTaskResponse = await axios.get(
          `http://localhost:5000/api/tasks/${task._id}/project/${projectId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (singleTaskResponse.data.success) {
          console.log('✅ Single task retrieved successfully');
        } else {
          console.log('❌ Failed to retrieve single task:', singleTaskResponse.data.message);
        }
      }
    } else {
      console.log('❌ Failed to retrieve tasks:', tasksResponse.data.message);
    }
    
    // Test getting team members
    console.log('\n👥 Testing get team members...');
    const teamResponse = await axios.get(
      `http://localhost:5000/api/tasks/team/${projectId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (teamResponse.data.success) {
      console.log('✅ Team members retrieved successfully:', teamResponse.data.data.teamMembers.length);
    } else {
      console.log('❌ Failed to retrieve team members:', teamResponse.data.message);
    }
    
    console.log('\n🎉 Task integration test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
    return false;
  }
};

// Run test
testTaskIntegration().catch(console.error);

