const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Task = require('../models/Task');
const Subtask = require('../models/Subtask');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ram312908_db_user:Ankit@cluster0.vigazjy.mongodb.net/Project-flow');

async function createTestData() {
  try {
    console.log('Creating test data...');

    // Create a test PM user
    const pmUser = await User.findOne({ email: 'pm@test.com' });
    if (!pmUser) {
      const newPM = new User({
        fullName: 'Test PM',
        email: 'pm@test.com',
        password: 'password123',
        role: 'pm',
        status: 'active',
        department: 'Management',
        jobTitle: 'Project Manager',
        workTitle: 'Senior Project Manager'
      });
      await newPM.save();
      console.log('Created PM user');
    }

    // Create a test customer user
    const customerUser = await User.findOne({ email: 'customer@test.com' });
    if (!customerUser) {
      const newCustomer = new User({
        fullName: 'Test Customer',
        email: 'customer@test.com',
        password: 'password123',
        role: 'customer',
        status: 'active',
        company: 'Test Company Inc.'
      });
      await newCustomer.save();
      console.log('Created customer user');
    }

    // Create a test employee user
    const employeeUser = await User.findOne({ email: 'employee@test.com' });
    if (!employeeUser) {
      const newEmployee = new User({
        fullName: 'Test Employee',
        email: 'employee@test.com',
        password: 'password123',
        role: 'employee',
        status: 'active',
        department: 'Development',
        jobTitle: 'Software Developer',
        workTitle: 'Senior Developer'
      });
      await newEmployee.save();
      console.log('Created employee user');
    }

    // Get the users
    const pm = await User.findOne({ email: 'pm@test.com' });
    const customer = await User.findOne({ email: 'customer@test.com' });
    const employee = await User.findOne({ email: 'employee@test.com' });

    // Create test customers
    const existingCustomer = await Customer.findOne({ name: 'Test Customer Project' });
    if (!existingCustomer) {
      const newCustomer = new Customer({
        name: 'Test Customer Project',
        description: 'This is a test customer project for demonstration',
        status: 'active',
        priority: 'normal',
        startDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        customer: customer._id,
        projectManager: pm._id,
        assignedTeam: [employee._id],
        createdBy: pm._id,
        lastModifiedBy: pm._id,
        progress: 0,
        tags: ['test', 'demo'],
        visibility: 'team'
      });
      await newCustomer.save();
      console.log('Created test customer');

      // Create test tasks for the customer
      const task1 = new Task({
        title: 'Setup Project Environment',
        description: 'Set up the development environment and tools',
        status: 'completed',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        customer: newCustomer._id,
        assignedTo: [employee._id],
        createdBy: pm._id,
        sequence: 1,
        progress: 100
      });
      await task1.save();

      const task2 = new Task({
        title: 'Design User Interface',
        description: 'Create wireframes and mockups for the user interface',
        status: 'in-progress',
        priority: 'normal',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        customer: newCustomer._id,
        assignedTo: [employee._id],
        createdBy: pm._id,
        sequence: 2,
        progress: 60
      });
      await task2.save();

      const task3 = new Task({
        title: 'Implement Backend API',
        description: 'Develop the backend API endpoints and database models',
        status: 'pending',
        priority: 'normal',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        customer: newCustomer._id,
        assignedTo: [employee._id],
        createdBy: pm._id,
        sequence: 3,
        progress: 0
      });
      await task3.save();

      // Create test subtasks for task2
      const subtask1 = new Subtask({
        title: 'Create Wireframes',
        description: 'Design basic wireframes for all pages',
        status: 'completed',
        priority: 'normal',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        task: task2._id,
        customer: newCustomer._id,
        assignedTo: [employee._id],
        createdBy: pm._id,
        sequence: 1
      });
      await subtask1.save();

      const subtask2 = new Subtask({
        title: 'Create Mockups',
        description: 'Design detailed mockups with colors and styling',
        status: 'in-progress',
        priority: 'normal',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        task: task2._id,
        customer: newCustomer._id,
        assignedTo: [employee._id],
        createdBy: pm._id,
        sequence: 2
      });
      await subtask2.save();

      // Update customer with tasks
      newCustomer.tasks = [task1._id, task2._id, task3._id];
      await newCustomer.save();

      console.log('Created test tasks and subtasks');
    }

    console.log('Test data creation completed!');
    console.log('You can now login with:');
    console.log('PM: pm@test.com / password123');
    console.log('Customer: customer@test.com / password123');
    console.log('Employee: employee@test.com / password123');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestData();
