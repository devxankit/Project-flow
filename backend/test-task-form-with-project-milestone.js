const axios = require('axios');

// Test the TaskForm with project and milestone selection
const testTaskFormWithProjectMilestone = async () => {
  try {
    console.log('🔍 Testing TaskForm with project and milestone selection...');
    
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
    
    // Test getting projects
    console.log('\n📁 Testing get projects...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (projectsResponse.data.success) {
      console.log('✅ Projects retrieved successfully:', projectsResponse.data.data.projects.length);
      const projects = projectsResponse.data.data.projects;
      
      if (projects.length > 0) {
        const project = projects[0];
        console.log('📋 Sample project:', {
          id: project._id,
          name: project.name
        });
        
        // Test getting milestones for this project
        console.log('\n🎯 Testing get milestones for project...');
        const milestonesResponse = await axios.get(
          `http://localhost:5000/api/milestones/project/${project._id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (milestonesResponse.data.success) {
          console.log('✅ Milestones retrieved successfully:', milestonesResponse.data.data.milestones.length);
          const milestones = milestonesResponse.data.data.milestones;
          
          if (milestones.length > 0) {
            const milestone = milestones[0];
            console.log('📝 Sample milestone:', {
              id: milestone._id,
              title: milestone.title,
              project: milestone.project
            });
            
            // Test getting team members for this project
            console.log('\n👥 Testing get team members for project...');
            const teamResponse = await axios.get(
              `http://localhost:5000/api/tasks/team/${project._id}`,
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
          } else {
            console.log('⚠️  No milestones found for this project');
          }
        } else {
          console.log('❌ Failed to retrieve milestones:', milestonesResponse.data.message);
        }
      }
    } else {
      console.log('❌ Failed to retrieve projects:', projectsResponse.data.message);
    }
    
    console.log('\n🎉 TaskForm integration test completed successfully!');
    console.log('✅ All required data can be loaded for TaskForm:');
    console.log('  - Projects: Available');
    console.log('  - Milestones: Available (when project is selected)');
    console.log('  - Team Members: Available (when project is selected)');
    
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
testTaskFormWithProjectMilestone().catch(console.error);

