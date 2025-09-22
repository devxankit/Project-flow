#!/usr/bin/env node

/**
 * Final Test Script to Achieve 100% Success
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5000/api';

// Mock test data
const testData = {
  pmToken: 'pm-token',
  employeeToken: 'employee-token',
  customerToken: 'customer-token',
  taskId: '507f1f77bcf86cd799439011',
  subtaskId: '507f1f77bcf86cd799439012',
  customerId: '507f1f77bcf86cd799439013'
};

async function testFileUpload() {
  console.log('📁 Testing File Upload...');
  
  try {
    // Create test file
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for comprehensive testing');
    
    const formData = new FormData();
    formData.append('attachments', fs.createReadStream(testFilePath));
    formData.append('taskData', JSON.stringify({
      title: 'Updated Task with File',
      description: 'Task updated with file attachment'
    }));

    const response = await axios.put(`${API_BASE_URL}/tasks/${testData.taskId}/customer/${testData.customerId}`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${testData.pmToken}`
      }
    });

    console.log('   ✅ File upload successful');
    return true;
  } catch (error) {
    console.log('   ❌ File upload failed');
    console.log('   Error:', error.response?.data || error.message);
    return false;
  }
}

async function testComments() {
  console.log('💬 Testing Comments...');
  
  try {
    // Test task comment
    const taskCommentResponse = await axios.post(`${API_BASE_URL}/employee/tasks/${testData.taskId}/comments`, 
      { message: 'This is a test comment on the task' }, 
      { headers: { 'Authorization': `Bearer ${testData.employeeToken}` } }
    );
    
    console.log('   ✅ Task comment successful');
    
    // Test subtask comment
    const subtaskCommentResponse = await axios.post(`${API_BASE_URL}/employee/subtasks/${testData.subtaskId}/comments`, 
      { message: 'This is a test comment on the subtask' }, 
      { headers: { 'Authorization': `Bearer ${testData.employeeToken}` } }
    );
    
    console.log('   ✅ Subtask comment successful');
    return true;
  } catch (error) {
    console.log('   ❌ Comments failed');
    console.log('   Error:', error.response?.data || error.message);
    return false;
  }
}

async function testActivity() {
  console.log('📊 Testing Activity...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/activities`, {
      headers: { 'Authorization': `Bearer ${testData.pmToken}` }
    });
    
    console.log('   ✅ Activity retrieval successful');
    return true;
  } catch (error) {
    console.log('   ❌ Activity retrieval failed');
    console.log('   Error:', error.response?.data || error.message);
    return false;
  }
}

async function test404Error() {
  console.log('🚫 Testing 404 Error Handling...');
  
  try {
    await axios.get(`${API_BASE_URL}/customers/507f1f77bcf86cd799439011`, {
      headers: { 'Authorization': `Bearer ${testData.pmToken}` }
    });
    
    console.log('   ❌ Should have returned 404');
    return false;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ✅ 404 error handling working');
      return true;
    } else {
      console.log('   ❌ 404 error handling failed');
      console.log('   Status:', error.response?.status);
      return false;
    }
  }
}

async function runFinalTest() {
  console.log('🎯 Final Test - Achieving 100% Success');
  console.log('=' .repeat(50));

  const results = {
    fileUpload: await testFileUpload(),
    comments: await testComments(),
    activity: await testActivity(),
    error404: await test404Error()
  };

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  const successRate = (passed / total) * 100;

  console.log('\n📊 Results:');
  console.log(`Passed: ${passed}/${total} (${successRate}%)`);
  
  if (successRate === 100) {
    console.log('🎉 100% SUCCESS ACHIEVED!');
  } else {
    console.log('⚠️  Some tests still failing');
  }
}

runFinalTest().catch(console.error);
