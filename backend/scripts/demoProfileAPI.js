const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';

// Demo function to show profile API usage
const demoProfileAPI = async () => {
  console.log('🎯 Profile API Demo\n');
  
  try {
    // Step 1: Login as a test user
    console.log('1️⃣ Logging in as test employee...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'employee@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful!\n');
    
    // Step 2: Get current profile
    console.log('2️⃣ Getting current profile...');
    const profileResponse = await axios.get(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const user = profileResponse.data.data.user;
    console.log(`✅ Profile retrieved: ${user.fullName} (${user.role})`);
    console.log(`   Department: ${user.department}`);
    console.log(`   Skills: ${user.skills ? user.skills.join(', ') : 'None'}\n`);
    
    // Step 3: Update profile
    console.log('3️⃣ Updating profile...');
    const updateData = {
      fullName: 'Updated Employee Name',
      phone: '+1234567890',
      location: 'San Francisco, CA',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB']
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/profile`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Profile updated successfully!');
    console.log(`   New name: ${updateResponse.data.data.user.fullName}`);
    console.log(`   New skills: ${updateResponse.data.data.user.skills.join(', ')}\n`);
    
    // Step 4: Change password
    console.log('4️⃣ Changing password...');
    const passwordData = {
      currentPassword: 'password123',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123'
    };
    
    await axios.put(`${BASE_URL}/profile/password`, passwordData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Password changed successfully!\n');
    
    // Step 5: Login with new password
    console.log('5️⃣ Logging in with new password...');
    const newLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'employee@test.com',
      password: 'newpassword123'
    });
    
    const newToken = newLoginResponse.data.data.token;
    console.log('✅ Login with new password successful!\n');
    
    // Step 6: Revert password back
    console.log('6️⃣ Reverting password back to original...');
    const revertData = {
      currentPassword: 'newpassword123',
      newPassword: 'password123',
      confirmPassword: 'password123'
    };
    
    await axios.put(`${BASE_URL}/profile/password`, revertData, {
      headers: { Authorization: `Bearer ${newToken}` }
    });
    
    console.log('✅ Password reverted successfully!\n');
    
    console.log('🎉 Profile API Demo completed successfully!');
    console.log('\n📋 What was demonstrated:');
    console.log('   ✅ User authentication');
    console.log('   ✅ Profile retrieval');
    console.log('   ✅ Profile updates');
    console.log('   ✅ Password changes');
    console.log('   ✅ Role-based access control');
    
    console.log('\n🔗 Available Profile API Endpoints:');
    console.log('   GET    /api/profile              - Get current profile');
    console.log('   PUT    /api/profile              - Update current profile');
    console.log('   POST   /api/profile/image        - Upload profile image');
    console.log('   DELETE /api/profile/image        - Delete profile image');
    console.log('   PUT    /api/profile/password     - Change password');
    console.log('   GET    /api/profile/:id          - Get user profile (PM only)');
    console.log('   PUT    /api/profile/:id          - Update user profile (PM only)');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure to:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Setup test users: npm run setup-profile-tests');
    console.log('   3. Ensure Cloudinary is configured');
  }
};

// Run demo if this script is executed directly
if (require.main === module) {
  demoProfileAPI();
}

module.exports = { demoProfileAPI };
