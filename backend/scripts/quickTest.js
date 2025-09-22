#!/usr/bin/env node

/**
 * Quick Test to Check Current Status
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function quickTest() {
  console.log('🧪 Quick Test - Checking Current Status');
  console.log('=' .repeat(50));

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const healthCheck = await axios.get(`${API_BASE_URL}/health`);
    console.log('   ✅ Server is running');
  } catch (error) {
    console.log('   ❌ Server not running or health endpoint not available');
    console.log('   Error:', error.message);
    return;
  }

  try {
    // Test 2: Test activity endpoint
    console.log('2. Testing activity endpoint...');
    const activityTest = await axios.get(`${API_BASE_URL}/activities`, {
      headers: { 'Authorization': 'Bearer test-token' }
    });
    console.log('   ✅ Activity endpoint working');
  } catch (error) {
    console.log('   ❌ Activity endpoint failed');
    console.log('   Error:', error.response?.data || error.message);
  }

  try {
    // Test 3: Test customer endpoint with invalid ID
    console.log('3. Testing 404 error handling...');
    const notFoundTest = await axios.get(`${API_BASE_URL}/customers/507f1f77bcf86cd799439011`, {
      headers: { 'Authorization': 'Bearer test-token' }
    });
    console.log('   ❌ Should have returned 404 but got:', notFoundTest.status);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ✅ 404 error handling working');
    } else {
      console.log('   ❌ 404 error handling failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
    }
  }

  console.log('\n🎉 Quick test completed!');
}

quickTest().catch(console.error);
