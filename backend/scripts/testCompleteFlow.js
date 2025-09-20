// Load environment variables first
require('dotenv').config({ path: './.env' });

console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? 'Found' : 'Not found');
console.log('MONGODB_URI from env:', process.env.MONGODB_URI ? 'Found' : 'Not found');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const User = require('../models/User');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ram312908_db_user:Ankit@cluster0.vigazjy.mongodb.net/Project-flow';

// Test credentials
const testUsers = {
  pm: { email: 'ankit@gmail.com', password: 'Ankit@1399' },
  customer: { email: 'abhay@gmail.com', password: 'Ankit@1399' },
  employee: { email: 'aditya@gmail.com', password: 'Ankit@1399' }
};

const API_BASE_URL = 'http://localhost:5000/api';

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Test user authentication and get tokens
async function authenticateUsers() {
  console.log('\n🔐 Authenticating Users...');
  
  for (const [role, credentials] of Object.entries(testUsers)) {
    try {
      console.log(`\nAuthenticating ${role.toUpperCase()}...`);
      
      // Find user
      const user = await User.findOne({ email: credentials.email });
      if (!user) {
        console.log(`❌ User not found: ${credentials.email}`);
        continue;
      }
      
      console.log(`✅ User found: ${user.fullName} (${user.role})`);
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordValid) {
        console.log(`❌ Invalid password for: ${credentials.email}`);
        continue;
      }
      
      console.log(`✅ Password valid for: ${credentials.email}`);
      
      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      console.log(`JWT_SECRET value: "${jwtSecret}"`);
      console.log(`User ID: ${user._id}`);
      console.log(`User role: ${user.role}`);
      
      if (!jwtSecret) {
        console.log(`❌ JWT_SECRET not found in environment variables`);
        continue;
      }
      
      let token;
      try {
        token = jwt.sign(
          { id: user._id, role: user.role },
          jwtSecret,
          { expiresIn: '7d' }
        );
        console.log(`✅ JWT token generated successfully`);
      } catch (jwtError) {
        console.log(`❌ JWT token generation failed:`, jwtError.message);
        continue;
      }
      
      console.log(`✅ JWT token generated for: ${credentials.email}`);
      
      // Store token for API testing
      testUsers[role].user = user;
      testUsers[role].token = token;
      
    } catch (error) {
      console.error(`❌ Error authenticating ${role}:`, error.message);
    }
  }
}

// Test employee task status update via API
async function testEmployeeTaskStatusUpdate() {
  console.log('\n🧪 Testing Employee Task Status Update via API...');
  
  const employee = testUsers.employee;
  if (!employee.token) {
    console.log('❌ Employee token not available');
    return null;
  }
  
  try {
    // Get employee's tasks
    console.log('\n📋 Getting employee tasks...');
    const tasksResponse = await axios.get(`${API_BASE_URL}/employee/tasks`, {
      headers: { Authorization: `Bearer ${employee.token}` }
    });
    
    if (!tasksResponse.data.success) {
      console.log('❌ Failed to get employee tasks');
      return null;
    }
    
    const tasks = tasksResponse.data.data.tasks;
    console.log(`✅ Found ${tasks.length} tasks for employee`);
    
    // Find a task that's not completed
    const incompleteTask = tasks.find(task => task.status !== 'completed');
    if (!incompleteTask) {
      console.log('❌ No incomplete tasks found');
      return null;
    }
    
    console.log(`\n📝 Found incomplete task: ${incompleteTask.title}`);
    console.log(`Current status: ${incompleteTask.status}`);
    console.log(`Milestone: ${incompleteTask.milestone?.title || 'No milestone'}`);
    console.log(`Milestone ID: ${incompleteTask.milestone?._id || 'No milestone ID'}`);
    
    // Get milestone progress before update
    const milestoneId = incompleteTask.milestone?._id;
    if (!milestoneId) {
      console.log('❌ Task has no milestone');
      return null;
    }
    
    console.log(`\n📊 Getting milestone progress before update...`);
    const milestoneResponse = await axios.get(`${API_BASE_URL}/employee/milestones/${milestoneId}/project/${incompleteTask.project._id}`, {
      headers: { Authorization: `Bearer ${employee.token}` }
    });
    
    if (!milestoneResponse.data.success) {
      console.log('❌ Failed to get milestone details');
      return null;
    }
    
    const milestone = milestoneResponse.data.data.milestone;
    console.log(`Milestone: ${milestone.title}`);
    console.log(`Progress before: ${milestone.progress}%`);
    
    // Update task status to completed
    console.log(`\n🔄 Updating task status to 'completed'...`);
    const updateResponse = await axios.put(`${API_BASE_URL}/employee/tasks/${incompleteTask._id}/status`, {
      status: 'completed'
    }, {
      headers: { Authorization: `Bearer ${employee.token}` }
    });
    
    if (!updateResponse.data.success) {
      console.log('❌ Failed to update task status');
      console.log('Response:', updateResponse.data);
      return null;
    }
    
    console.log('✅ Task status updated successfully');
    
    // Wait for middleware to process
    console.log('⏳ Waiting for middleware to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check milestone progress after update
    console.log(`\n📊 Getting milestone progress after update...`);
    const updatedMilestoneResponse = await axios.get(`${API_BASE_URL}/employee/milestones/${milestoneId}/project/${incompleteTask.project._id}`, {
      headers: { Authorization: `Bearer ${employee.token}` }
    });
    
    if (!updatedMilestoneResponse.data.success) {
      console.log('❌ Failed to get updated milestone details');
      return null;
    }
    
    const updatedMilestone = updatedMilestoneResponse.data.data.milestone;
    console.log(`Progress after: ${updatedMilestone.progress}%`);
    
    // Check if progress was updated
    if (updatedMilestone.progress !== milestone.progress) {
      console.log('✅ Milestone progress was updated!');
    } else {
      console.log('❌ Milestone progress was NOT updated');
    }
    
    return {
      task: incompleteTask,
      milestone: milestone,
      updatedMilestone: updatedMilestone,
      progressChanged: updatedMilestone.progress !== milestone.progress
    };
    
  } catch (error) {
    console.error('❌ Error testing employee task status update:', error.response?.data || error.message);
    return null;
  }
}

// Test milestone progress in PM module
async function testPMMilestoneProgress(milestoneId, projectId) {
  console.log('\n👨‍💼 Testing PM Milestone Progress...');
  
  const pm = testUsers.pm;
  if (!pm.token) {
    console.log('❌ PM token not available');
    return null;
  }
  
  try {
    // Get milestone details via PM API
    const milestoneResponse = await axios.get(`${API_BASE_URL}/projects/milestones/${milestoneId}/project/${projectId}`, {
      headers: { Authorization: `Bearer ${pm.token}` }
    });
    
    if (!milestoneResponse.data.success) {
      console.log('❌ Failed to get milestone details via PM API');
      return null;
    }
    
    const milestone = milestoneResponse.data.data.milestone;
    console.log(`✅ PM can see milestone: ${milestone.title}`);
    console.log(`Progress: ${milestone.progress}%`);
    
    return milestone;
    
  } catch (error) {
    console.error('❌ Error testing PM milestone progress:', error.response?.data || error.message);
    return null;
  }
}

// Test milestone progress in Customer module
async function testCustomerMilestoneProgress(milestoneId) {
  console.log('\n👤 Testing Customer Milestone Progress...');
  
  const customer = testUsers.customer;
  if (!customer.token) {
    console.log('❌ Customer token not available');
    return null;
  }
  
  try {
    // Get milestone details via Customer API
    const milestoneResponse = await axios.get(`${API_BASE_URL}/customer/milestones/${milestoneId}`, {
      headers: { Authorization: `Bearer ${customer.token}` }
    });
    
    if (!milestoneResponse.data.success) {
      console.log('❌ Failed to get milestone details via Customer API');
      return null;
    }
    
    const milestone = milestoneResponse.data.data.milestone;
    console.log(`✅ Customer can see milestone: ${milestone.title}`);
    console.log(`Progress: ${milestone.progress}%`);
    
    return milestone;
    
  } catch (error) {
    console.error('❌ Error testing Customer milestone progress:', error.response?.data || error.message);
    return null;
  }
}

// Test database milestone progress directly
async function testDatabaseMilestoneProgress(milestoneId) {
  console.log('\n🗄️ Testing Database Milestone Progress...');
  
  try {
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      console.log('❌ Milestone not found in database');
      return null;
    }
    
    console.log(`✅ Database milestone: ${milestone.title}`);
    console.log(`Progress: ${milestone.progress}%`);
    
    // Count tasks manually
    const totalTasks = await Task.countDocuments({ milestone: milestoneId });
    const completedTasks = await Task.countDocuments({ 
      milestone: milestoneId, 
      status: 'completed' 
    });
    
    const expectedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    console.log(`Total tasks: ${totalTasks}`);
    console.log(`Completed tasks: ${completedTasks}`);
    console.log(`Expected progress: ${expectedProgress}%`);
    
    if (milestone.progress === expectedProgress) {
      console.log('✅ Database progress is correct');
    } else {
      console.log('❌ Database progress is incorrect');
    }
    
    return {
      milestone,
      totalTasks,
      completedTasks,
      expectedProgress,
      isCorrect: milestone.progress === expectedProgress
    };
    
  } catch (error) {
    console.error('❌ Error testing database milestone progress:', error.message);
    return null;
  }
}

// Main test function
async function runCompleteFlowTest() {
  console.log('🚀 Starting Complete Flow Test...');
  console.log('=====================================');
  
  try {
    // Connect to database
    await connectDB();
    
    // Authenticate users
    await authenticateUsers();
    
    // Test employee task status update
    const taskUpdateResult = await testEmployeeTaskStatusUpdate();
    if (!taskUpdateResult) {
      console.log('❌ Task update test failed, stopping...');
      return;
    }
    
    const { task, milestone, updatedMilestone, progressChanged } = taskUpdateResult;
    const milestoneId = task.milestone._id;
    const projectId = task.project._id;
    
    // Test milestone progress in all modules
    console.log('\n🔍 Testing Milestone Progress Across All Modules...');
    
    // Test database progress
    const dbResult = await testDatabaseMilestoneProgress(milestoneId);
    
    // Test PM module progress
    const pmResult = await testPMMilestoneProgress(milestoneId, projectId);
    
    // Test Customer module progress
    const customerResult = await testCustomerMilestoneProgress(milestoneId);
    
    // Summary
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`Task Update: ${progressChanged ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Database Progress: ${dbResult?.isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`PM Module Progress: ${pmResult ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE'}`);
    console.log(`Customer Module Progress: ${customerResult ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE'}`);
    
    if (progressChanged && dbResult?.isCorrect) {
      console.log('\n✅ MILESTONE PROGRESS IS WORKING CORRECTLY!');
    } else {
      console.log('\n❌ MILESTONE PROGRESS HAS ISSUES!');
      console.log('\n🔍 ROOT CAUSE ANALYSIS:');
      
      if (!progressChanged) {
        console.log('- Task status update is not triggering milestone progress update');
      }
      if (!dbResult?.isCorrect) {
        console.log('- Database milestone progress is incorrect');
      }
      if (!pmResult) {
        console.log('- PM module cannot access milestone progress');
      }
      if (!customerResult) {
        console.log('- Customer module cannot access milestone progress');
      }
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
runCompleteFlowTest();
