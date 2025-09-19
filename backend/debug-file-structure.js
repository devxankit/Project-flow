const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Debug the file structure from Cloudinary
const debugFileStructure = async () => {
  try {
    console.log('🔍 Debugging file structure from Cloudinary...');
    
    // Create test file
    const testFile = path.join(__dirname, 'test.txt');
    fs.writeFileSync(testFile, 'This is a test file for milestone upload');
    
    const formData = new FormData();
    formData.append('attachments', fs.createReadStream(testFile));
    
    console.log('📤 Sending test upload request...');
    const response = await axios.post('http://localhost:5000/api/milestones/test-upload', formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Test upload successful!');
    console.log('Full response:', JSON.stringify(response.data, null, 2));
    
    // Analyze the file structure
    if (response.data.files && response.data.files.length > 0) {
      const file = response.data.files[0];
      console.log('\n📋 File structure analysis:');
      console.log('Original name:', file.originalname);
      console.log('MIME type:', file.mimetype);
      console.log('Size:', file.size);
      console.log('Public ID:', file.public_id);
      console.log('Path:', file.path);
      console.log('URL:', file.url);
      console.log('Cloudinary ID:', file.cloudinaryId);
      
      // Check what fields are available
      console.log('\n🔍 All available fields:');
      Object.keys(file).forEach(key => {
        console.log(`  ${key}: ${file[key]}`);
      });
    }
    
    // Clean up
    fs.unlinkSync(testFile);
    return true;
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
    return false;
  }
};

// Run debug
debugFileStructure().catch(console.error);
