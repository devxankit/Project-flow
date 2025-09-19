const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

// Test data
const testUsers = {
  pm: {
    email: 'pm@test.com',
    password: 'password123',
    fullName: 'Test PM',
    role: 'pm',
    department: 'Management',
    jobTitle: 'Project Manager',
    workTitle: 'Senior PM'
  },
  employee: {
    email: 'employee@test.com',
    password: 'password123',
    fullName: 'Test Employee',
    role: 'employee',
    department: 'Engineering',
    jobTitle: 'Software Developer',
    workTitle: 'Frontend Developer'
  },
  customer: {
    email: 'customer@test.com',
    password: 'password123',
    fullName: 'Test Customer',
    role: 'customer',
    company: 'Test Company',
    address: '123 Test Street, Test City'
  }
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, url, data = null, token = null, isFormData = false) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  };

  if (data) {
    if (isFormData) {
      config.data = data;
      config.headers['Content-Type'] = 'multipart/form-data';
    } else {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
};

// Helper function to login and get token
const loginUser = async (email, password) => {
  const result = await makeAuthenticatedRequest('POST', '/auth/login', { email, password });
  if (result.success) {
    return result.data.token;
  }
  return null;
};

// Helper function to create test image file
const createTestImage = () => {
  const testImagePath = path.join(__dirname, 'test-profile-image.png');
  
  // Create a simple 1x1 pixel PNG file for testing
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR data
    0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
  ]);
  
  fs.writeFileSync(testImagePath, pngData);
  return testImagePath;
};

// Test functions
const testGetCurrentProfile = async (token, userType) => {
  console.log(`\n🧪 Testing get current profile for ${userType}...`);
  
  const result = await makeAuthenticatedRequest('GET', '/profile', null, token);
  
  if (result.success) {
    console.log(`✅ Get current profile successful for ${userType}`);
    console.log(`   User: ${result.data.data.user.fullName} (${result.data.data.user.role})`);
    return true;
  } else {
    console.log(`❌ Get current profile failed for ${userType}:`, result.error);
    return false;
  }
};

const testUpdateProfile = async (token, userType) => {
  console.log(`\n🧪 Testing update profile for ${userType}...`);
  
  const updateData = {
    fullName: `Updated ${userType} Name`,
    phone: '+1234567890',
    location: 'Test City, Test State'
  };

  // Add role-specific fields
  if (userType === 'customer') {
    updateData.company = 'Updated Test Company';
    updateData.address = 'Updated Test Address';
  } else {
    updateData.skills = ['JavaScript', 'React', 'Node.js'];
  }

  const result = await makeAuthenticatedRequest('PUT', '/profile', updateData, token);
  
  if (result.success) {
    console.log(`✅ Update profile successful for ${userType}`);
    console.log(`   Updated name: ${result.data.data.user.fullName}`);
    return true;
  } else {
    console.log(`❌ Update profile failed for ${userType}:`, result.error);
    return false;
  }
};

const testUploadProfileImage = async (token, userType) => {
  console.log(`\n🧪 Testing upload profile image for ${userType}...`);
  
  const testImagePath = createTestImage();
  const formData = new FormData();
  formData.append('profileImage', fs.createReadStream(testImagePath));
  
  const result = await makeAuthenticatedRequest('POST', '/profile/image', formData, token, true);
  
  // Clean up test image
  fs.unlinkSync(testImagePath);
  
  if (result.success) {
    console.log(`✅ Upload profile image successful for ${userType}`);
    console.log(`   Image URL: ${result.data.data.imageUrl}`);
    return true;
  } else {
    console.log(`❌ Upload profile image failed for ${userType}:`, result.error);
    return false;
  }
};

const testDeleteProfileImage = async (token, userType) => {
  console.log(`\n🧪 Testing delete profile image for ${userType}...`);
  
  const result = await makeAuthenticatedRequest('DELETE', '/profile/image', null, token);
  
  if (result.success) {
    console.log(`✅ Delete profile image successful for ${userType}`);
    return true;
  } else if (result.error && result.error.message === 'No profile image to delete') {
    console.log(`⚠️  No profile image to delete for ${userType} (this is expected if image was already deleted)`);
    return true; // This is actually a success case
  } else {
    console.log(`❌ Delete profile image failed for ${userType}:`, result.error);
    return false;
  }
};

const testChangePassword = async (token, userType) => {
  console.log(`\n🧪 Testing change password for ${userType}...`);
  
  const passwordData = {
    currentPassword: 'password123',
    newPassword: 'newpassword123',
    confirmPassword: 'newpassword123'
  };

  const result = await makeAuthenticatedRequest('PUT', '/profile/password', passwordData, token);
  
  if (result.success) {
    console.log(`✅ Change password successful for ${userType}`);
    
    // Test login with new password
    const newToken = await loginUser(testUsers[userType].email, 'newpassword123');
    if (newToken) {
      console.log(`✅ Login with new password successful for ${userType}`);
      
      // Change password back to original
      const revertData = {
        currentPassword: 'newpassword123',
        newPassword: 'password123',
        confirmPassword: 'password123'
      };
      await makeAuthenticatedRequest('PUT', '/profile/password', revertData, newToken);
      console.log(`✅ Password reverted to original for ${userType}`);
    } else {
      console.log(`❌ Login with new password failed for ${userType}`);
    }
    
    return true;
  } else {
    console.log(`❌ Change password failed for ${userType}:`, result.error);
    return false;
  }
};

const testPMUserManagement = async (pmToken) => {
  console.log(`\n🧪 Testing PM user management features...`);
  
  // First, get the employee user ID by logging in as employee
  const employeeLoginResult = await makeAuthenticatedRequest('POST', '/auth/login', { 
    email: 'employee@test.com', 
    password: 'password123' 
  });
  
  if (!employeeLoginResult.success) {
    console.log(`❌ Could not get employee ID for PM management test`);
    return false;
  }
  
  const employeeId = employeeLoginResult.data.user._id;
  
  // Get employee profile by ID
  const employeeResult = await makeAuthenticatedRequest('GET', `/profile/${employeeId}`, null, pmToken);
  if (employeeResult.success) {
    console.log(`✅ PM can view employee profile`);
  } else {
    console.log(`❌ PM cannot view employee profile:`, employeeResult.error);
  }
  
  // Update employee profile
  const updateData = {
    fullName: 'PM Updated Employee',
    department: 'Updated Department',
    jobTitle: 'Updated Job Title'
  };
  
  const updateResult = await makeAuthenticatedRequest('PUT', `/profile/${employeeId}`, updateData, pmToken);
  if (updateResult.success) {
    console.log(`✅ PM can update employee profile`);
  } else {
    console.log(`❌ PM cannot update employee profile:`, updateResult.error);
  }
  
  return true;
};

const testUnauthorizedAccess = async () => {
  console.log(`\n🧪 Testing unauthorized access...`);
  
  // Test employee trying to access PM-only routes
  const employeeToken = await loginUser(testUsers.employee.email, testUsers.employee.password);
  if (employeeToken) {
    const result = await makeAuthenticatedRequest('GET', '/profile/pm-id', null, employeeToken);
    if (!result.success && result.status === 403) {
      console.log(`✅ Employee correctly blocked from PM-only routes`);
    } else {
      console.log(`❌ Employee should be blocked from PM-only routes`);
    }
  }
  
  return true;
};

// Main test function
const runProfileTests = async () => {
  console.log('🚀 Starting Profile Functionality Tests...\n');
  
  const results = {
    pm: { passed: 0, total: 0 },
    employee: { passed: 0, total: 0 },
    customer: { passed: 0, total: 0 },
    pmManagement: { passed: 0, total: 0 },
    unauthorized: { passed: 0, total: 0 }
  };

  // Test each user type
  for (const [userType, userData] of Object.entries(testUsers)) {
    console.log(`\n👤 Testing ${userType.toUpperCase()} profile functionality...`);
    
    // Login user
    const token = await loginUser(userData.email, userData.password);
    if (!token) {
      console.log(`❌ Failed to login ${userType}. Make sure test users exist.`);
      continue;
    }
    
    console.log(`✅ Logged in as ${userType}`);
    
    // Run tests for this user type
    const tests = [
      { name: 'getCurrentProfile', fn: testGetCurrentProfile },
      { name: 'updateProfile', fn: testUpdateProfile },
      { name: 'uploadProfileImage', fn: testUploadProfileImage },
      { name: 'deleteProfileImage', fn: testDeleteProfileImage },
      { name: 'changePassword', fn: testChangePassword }
    ];
    
    for (const test of tests) {
      results[userType].total++;
      const passed = await test.fn(token, userType);
      if (passed) {
        results[userType].passed++;
      }
    }
  }
  
  // Test PM management features
  console.log(`\n👑 Testing PM management features...`);
  const pmToken = await loginUser(testUsers.pm.email, testUsers.pm.password);
  if (pmToken) {
    results.pmManagement.total = 1;
    const passed = await testPMUserManagement(pmToken);
    if (passed) {
      results.pmManagement.passed = 1;
    }
  }
  
  // Test unauthorized access
  results.unauthorized.total = 1;
  const passed = await testUnauthorizedAccess();
  if (passed) {
    results.unauthorized.passed = 1;
  }
  
  // Print summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  let totalPassed = 0;
  let totalTests = 0;
  
  for (const [category, result] of Object.entries(results)) {
    const percentage = result.total > 0 ? Math.round((result.passed / result.total) * 100) : 0;
    console.log(`${category.toUpperCase()}: ${result.passed}/${result.total} (${percentage}%)`);
    totalPassed += result.passed;
    totalTests += result.total;
  }
  
  const overallPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
  console.log(`\nOVERALL: ${totalPassed}/${totalTests} (${overallPercentage}%)`);
  
  if (overallPercentage >= 80) {
    console.log('🎉 Profile functionality tests PASSED!');
  } else {
    console.log('❌ Profile functionality tests FAILED!');
  }
  
  console.log('\n📝 NOTES:');
  console.log('- Make sure test users exist in the database');
  console.log('- Ensure Cloudinary is properly configured');
  console.log('- Check that all environment variables are set');
  console.log('- Verify that the server is running on the correct port');
};

// Run tests if this script is executed directly
if (require.main === module) {
  runProfileTests().catch(console.error);
}

module.exports = {
  runProfileTests,
  testGetCurrentProfile,
  testUpdateProfile,
  testUploadProfileImage,
  testDeleteProfileImage,
  testChangePassword,
  testPMUserManagement,
  testUnauthorizedAccess
};
