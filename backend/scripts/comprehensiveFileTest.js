#!/usr/bin/env node

/**
 * Comprehensive File Upload Test
 * Tests file upload functionality for tasks and subtasks with various file types
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5000/api';

// Test file types and their content
const testFiles = [
  { name: 'test-image.jpg', content: 'fake-jpeg-data', mimetype: 'image/jpeg' },
  { name: 'test-document.pdf', content: 'fake-pdf-data', mimetype: 'application/pdf' },
  { name: 'test-video.mp4', content: 'fake-video-data', mimetype: 'video/mp4' },
  { name: 'test-audio.mp3', content: 'fake-audio-data', mimetype: 'audio/mp3' },
  { name: 'test-text.txt', content: 'This is a test text file', mimetype: 'text/plain' }
];

async function createTestFiles() {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  testFiles.forEach(file => {
    const filePath = path.join(testDir, file.name);
    fs.writeFileSync(filePath, file.content);
  });

  return testDir;
}

async function cleanupTestFiles(testDir) {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

async function testFileUpload(filePath, fileName, entityType, entityId, customerId, token) {
  try {
    const formData = new FormData();
    formData.append('attachments', fs.createReadStream(filePath));
    
    if (entityType === 'task') {
      formData.append('taskData', JSON.stringify({
        title: `Updated Task with ${fileName}`,
        description: `Task updated with ${fileName} attachment`
      }));
    } else if (entityType === 'subtask') {
      formData.append('subtaskData', JSON.stringify({
        title: `Updated Subtask with ${fileName}`,
        description: `Subtask updated with ${fileName} attachment`
      }));
    }

    const endpoint = entityType === 'task' 
      ? `/tasks/${entityId}/customer/${customerId}`
      : `/subtasks/${entityId}/customer/${customerId}`;

    const response = await axios.put(`${API_BASE_URL}${endpoint}`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

async function runComprehensiveFileTest() {
  console.log('🧪 Starting Comprehensive File Upload Test');
  console.log('=' .repeat(60));

  let testDir;
  try {
    // Create test files
    testDir = await createTestFiles();
    console.log('✅ Test files created');

    // Mock test data (you would get these from your actual test)
    const mockData = {
      taskId: '507f1f77bcf86cd799439011',
      subtaskId: '507f1f77bcf86cd799439012',
      customerId: '507f1f77bcf86cd799439013',
      token: 'mock-token'
    };

    console.log('\n📁 Testing file uploads for different file types...\n');

    // Test each file type
    for (const file of testFiles) {
      const filePath = path.join(testDir, file.name);
      
      console.log(`Testing ${file.name} (${file.mimetype})...`);
      
      // Test task upload
      const taskResult = await testFileUpload(
        filePath, 
        file.name, 
        'task', 
        mockData.taskId, 
        mockData.customerId, 
        mockData.token
      );
      
      console.log(`  Task Upload: ${taskResult.success ? '✅ Success' : '❌ Failed'}`);
      if (!taskResult.success) {
        console.log(`    Error: ${JSON.stringify(taskResult.error)}`);
      }

      // Test subtask upload
      const subtaskResult = await testFileUpload(
        filePath, 
        file.name, 
        'subtask', 
        mockData.subtaskId, 
        mockData.customerId, 
        mockData.token
      );
      
      console.log(`  Subtask Upload: ${subtaskResult.success ? '✅ Success' : '❌ Failed'}`);
      if (!subtaskResult.success) {
        console.log(`    Error: ${JSON.stringify(subtaskResult.error)}`);
      }
      
      console.log('');
    }

    console.log('🎉 Comprehensive file upload test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    if (testDir) {
      await cleanupTestFiles(testDir);
      console.log('🧹 Test files cleaned up');
    }
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  runComprehensiveFileTest();
}

module.exports = { runComprehensiveFileTest };
