const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test the fixed file upload functionality
const testFixedUpload = async () => {
  try {
    console.log('🔍 Testing fixed file upload functionality...');
    
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
    const testFile = path.join(__dirname, 'test.txt');
    fs.writeFileSync(testFile, 'This is a test file for milestone upload - FIXED VERSION');
    
    // Use a unique sequence number
    const uniqueSequence = Date.now() % 1000;
    
    const formData = new FormData();
    formData.append('milestoneData', JSON.stringify({
      title: 'Test Milestone - FIXED',
      description: 'Test milestone with fixed file upload functionality',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: ['68cc48d092069796798ae3ec'],
      status: 'pending',
      priority: 'normal',
      sequence: uniqueSequence,
      projectId: '68cc6139504c4a6c34d781b4'
    }));
    formData.append('attachments', fs.createReadStream(testFile));
    
    console.log(`📤 Sending milestone creation request with sequence ${uniqueSequence}...`);
    const response = await axios.post('http://localhost:5000/api/milestones', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('🎉 SUCCESS! Milestone created with attachments!');
    console.log('Response:', response.data);
    
    // Check if attachments are in the response
    if (response.data.data && response.data.data.milestone && response.data.data.milestone.attachments) {
      const attachments = response.data.data.milestone.attachments;
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
testFixedUpload().catch(console.error);
