const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test the complete task functionality
const testTaskFunctionality = async () => {
  try {
    console.log('🔍 Testing complete task functionality...');
    
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
    
    // Create test file
    const testFile = path.join(__dirname, 'test-task.txt');
    fs.writeFileSync(testFile, 'This is a test file for task upload - TASK FUNCTIONALITY TEST');
    
    // Test data
    const taskData = {
      title: 'Test Task - Complete Functionality',
      description: 'Test task with file upload functionality',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: ['68cc48d092069796798ae3ec'],
      status: 'pending',
      priority: 'high',
      milestone: '68cc7e209d16f225b7d2bf0a', // Use existing milestone ID
      project: '68cc6139504c4a6c34d781b4' // Use existing project ID
    };
    
    const formData = new FormData();
    formData.append('taskData', JSON.stringify(taskData));
    formData.append('attachments', fs.createReadStream(testFile));
    
    console.log('📤 Sending task creation request...');
    const response = await axios.post('http://localhost:5000/api/tasks', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('🎉 SUCCESS! Task created with attachments!');
    console.log('Response:', response.data);
    
    // Check if attachments are in the response
    if (response.data.data && response.data.data.task && response.data.data.task.attachments) {
      const attachments = response.data.data.task.attachments;
      console.log('✅ Attachments found in response:', attachments.length);
      attachments.forEach((att, index) => {
        console.log(`  Attachment ${index + 1}:`, {
          originalName: att.originalName,
          mimetype: att.mimetype,
          size: att.size,
          cloudinaryId: att.cloudinaryId,
          url: att.url
        });
      });
    } else {
      console.log('⚠️  No attachments found in response');
    }
    
    // Test getting tasks by milestone
    console.log('\n📋 Testing get tasks by milestone...');
    const tasksResponse = await axios.get(
      `http://localhost:5000/api/tasks/milestone/${taskData.milestone}/project/${taskData.project}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (tasksResponse.data.success) {
      console.log('✅ Tasks retrieved successfully:', tasksResponse.data.data.tasks.length);
    } else {
      console.log('❌ Failed to retrieve tasks:', tasksResponse.data.message);
    }
    
    // Test getting team members
    console.log('\n👥 Testing get team members...');
    const teamResponse = await axios.get(
      `http://localhost:5000/api/tasks/team/${taskData.project}`,
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
    
    // Clean up
    fs.unlinkSync(testFile);
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
testTaskFunctionality().catch(console.error);
