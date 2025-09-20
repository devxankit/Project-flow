const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test credentials
const testUsers = {
  pm: { email: 'ankit@gmail.com', password: 'Ankit@1399' },
  customer: { email: 'abhay@gmail.com', password: 'Ankit@1399' },
  employee: { email: 'aditya@gmail.com', password: 'Ankit@1399' }
};

async function testAPIEndpoint() {
  try {
    console.log('🚀 Testing API Endpoint...');
    
    // Test employee login
    console.log('\n🔐 Testing employee login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUsers.employee.email,
      password: testUsers.employee.password
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Employee login successful');
      const token = loginResponse.data.token;
      console.log('Token received:', token ? 'Yes' : 'No');
      
      // Test getting employee projects
      console.log('\n📊 Testing employee projects...');
      const projectsResponse = await axios.get(`${API_BASE_URL}/employee/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (projectsResponse.data.success) {
        console.log('✅ Employee projects retrieved');
        const projects = projectsResponse.data.data.projects;
        console.log(`Found ${projects.length} projects`);
        
        // Find a project with milestones
        for (const project of projects) {
          console.log(`\nProject: ${project.name}`);
          
          // Test getting project details
          const projectDetailsResponse = await axios.get(`${API_BASE_URL}/employee/projects/${project._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (projectDetailsResponse.data.success) {
            const milestones = projectDetailsResponse.data.data.milestones;
            console.log(`  - Milestones: ${milestones.length}`);
            
            // Test milestone progress recalculation
            for (const milestone of milestones) {
              console.log(`\n  Milestone: ${milestone.title}`);
              console.log(`    - Current Progress: ${milestone.progress}%`);
              
              // Test recalculate progress endpoint
              try {
                const recalcResponse = await axios.post(`${API_BASE_URL}/employee/milestones/${milestone._id}/recalculate-progress`, {}, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                
                if (recalcResponse.data.success) {
                  console.log(`    ✅ Progress recalculated: ${recalcResponse.data.data.progress}%`);
                } else {
                  console.log(`    ❌ Recalculation failed: ${recalcResponse.data.message}`);
                }
              } catch (recalcError) {
                console.log(`    ❌ Recalculation error: ${recalcError.response?.data?.message || recalcError.message}`);
                console.log(`    Status: ${recalcError.response?.status}`);
                console.log(`    Response: ${JSON.stringify(recalcError.response?.data)}`);
              }
            }
          }
        }
      } else {
        console.log('❌ Failed to get employee projects');
      }
    } else {
      console.log('❌ Employee login failed');
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    }
  }
}

// Wait a bit for server to start, then test
setTimeout(() => {
  testAPIEndpoint();
}, 3000);
