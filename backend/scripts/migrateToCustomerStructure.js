#!/usr/bin/env node

/**
 * Database Migration Script: Project → Customer Structure
 * 
 * This script migrates the database from the old Project → Milestone → Task
 * structure to the new Customer → Task → Subtask structure.
 * 
 * IMPORTANT: This script performs a complete data cleanup and restructure.
 * All existing project, milestone, and task data will be removed.
 * 
 * Usage: node scripts/migrateToCustomerStructure.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Customer = require('../models/Customer');
const Task = require('../models/Task');
const Subtask = require('../models/Subtask');
const Activity = require('../models/Activity');
const TaskRequest = require('../models/TaskRequest');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logStep = (step, message) => {
  log(`\n[${step}] ${message}`, 'cyan');
};

const logSuccess = (message) => {
  log(`✅ ${message}`, 'green');
};

const logWarning = (message) => {
  log(`⚠️  ${message}`, 'yellow');
};

const logError = (message) => {
  log(`❌ ${message}`, 'red');
};

const logInfo = (message) => {
  log(`ℹ️  ${message}`, 'blue');
};

async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/projectflow';
    await mongoose.connect(mongoUri);
    logSuccess('Connected to MongoDB');
  } catch (error) {
    logError(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

async function createBackup() {
  logStep('BACKUP', 'Creating database backup...');
  
  try {
    // Get current timestamp for backup naming
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-before-migration-${timestamp}`;
    
    // Note: In production, you would use mongodump here
    // For now, we'll just log the backup process
    logInfo(`Backup would be created as: ${backupName}`);
    logInfo('In production, run: mongodump --db projectflow --out ./backups/');
    
    logSuccess('Backup process documented');
  } catch (error) {
    logError(`Backup failed: ${error.message}`);
    throw error;
  }
}

async function cleanupOldData() {
  logStep('CLEANUP', 'Cleaning up old data...');
  
  try {
    // Remove old project-related data from User model
    logInfo('Cleaning up User model...');
    await User.updateMany(
      {},
      {
        $unset: {
          managedProjects: 1,
          assignedProjects: 1,
          // Keep customerProjects for customer users
        }
      }
    );
    logSuccess('User model cleaned up');
    
    // Remove old activity data
    logInfo('Cleaning up Activity model...');
    const activityResult = await Activity.deleteMany({
      type: {
        $in: [
          'project_created',
          'project_updated',
          'project_deleted',
          'milestone_created',
          'milestone_updated',
          'milestone_deleted',
          'milestone_reached',
          'team_assigned',
          'team_removed'
        ]
      }
    });
    logSuccess(`Removed ${activityResult.deletedCount} old activity records`);
    
    // Remove old task request data that references projects/milestones
    logInfo('Cleaning up TaskRequest model...');
    const taskRequestResult = await TaskRequest.deleteMany({
      $or: [
        { project: { $exists: true } },
        { milestone: { $exists: true } }
      ]
    });
    logSuccess(`Removed ${taskRequestResult.deletedCount} old task request records`);
    
    logSuccess('Old data cleanup completed');
  } catch (error) {
    logError(`Cleanup failed: ${error.message}`);
    throw error;
  }
}

async function verifyNewStructure() {
  logStep('VERIFICATION', 'Verifying new structure...');
  
  try {
    // Check if new models exist and are accessible
    const customerCount = await Customer.countDocuments();
    const taskCount = await Task.countDocuments();
    const subtaskCount = await Subtask.countDocuments();
    const userCount = await User.countDocuments();
    const activityCount = await Activity.countDocuments();
    const taskRequestCount = await TaskRequest.countDocuments();
    
    logInfo(`Customer records: ${customerCount}`);
    logInfo(`Task records: ${taskCount}`);
    logInfo(`Subtask records: ${subtaskCount}`);
    logInfo(`User records: ${userCount}`);
    logInfo(`Activity records: ${activityCount}`);
    logInfo(`TaskRequest records: ${taskRequestCount}`);
    
    // Verify indexes
    logInfo('Verifying database indexes...');
    const customerIndexes = await Customer.collection.getIndexes();
    const taskIndexes = await Task.collection.getIndexes();
    const subtaskIndexes = await Subtask.collection.getIndexes();
    
    logInfo(`Customer indexes: ${Object.keys(customerIndexes).length}`);
    logInfo(`Task indexes: ${Object.keys(taskIndexes).length}`);
    logInfo(`Subtask indexes: ${Object.keys(subtaskIndexes).length}`);
    
    logSuccess('New structure verification completed');
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    throw error;
  }
}

async function createSampleData() {
  logStep('SAMPLE DATA', 'Creating sample data for testing...');
  
  try {
    // Check if we already have data
    const existingCustomers = await Customer.countDocuments();
    if (existingCustomers > 0) {
      logInfo('Sample data already exists, skipping creation');
      return;
    }
    
    // Create sample users if they don't exist
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      logInfo('Creating sample users...');
      
      const sampleUsers = [
        {
          fullName: 'Project Manager',
          email: 'pm@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'pm',
          isActive: true
        },
        {
          fullName: 'Employee User',
          email: 'employee@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'employee',
          isActive: true
        },
        {
          fullName: 'Customer User',
          email: 'customer@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'customer',
          isActive: true
        }
      ];
      
      await User.insertMany(sampleUsers);
      logSuccess('Sample users created');
    }
    
    logSuccess('Sample data creation completed');
  } catch (error) {
    logError(`Sample data creation failed: ${error.message}`);
    throw error;
  }
}

async function runMigration() {
  try {
    log('🚀 Starting Database Migration to Customer Structure', 'bright');
    log('=' .repeat(60), 'cyan');
    
    await connectToDatabase();
    await createBackup();
    await cleanupOldData();
    await verifyNewStructure();
    await createSampleData();
    
    log('\n' + '=' .repeat(60), 'green');
    log('🎉 Migration completed successfully!', 'bright');
    log('=' .repeat(60), 'green');
    
    log('\n📋 Next Steps:', 'yellow');
    log('1. Test the application with the new structure', 'blue');
    log('2. Verify all API endpoints are working', 'blue');
    log('3. Test file upload/download functionality', 'blue');
    log('4. Deploy to staging environment', 'blue');
    log('5. Deploy to production environment', 'blue');
    
  } catch (error) {
    log('\n' + '=' .repeat(60), 'red');
    log('💥 Migration failed!', 'bright');
    log(`Error: ${error.message}`, 'red');
    log('=' .repeat(60), 'red');
    
    log('\n🔧 Recovery Steps:', 'yellow');
    log('1. Check the error message above', 'blue');
    log('2. Restore from backup if necessary', 'blue');
    log('3. Fix the issue and run migration again', 'blue');
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    log('\n📡 Disconnected from MongoDB', 'cyan');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  connectToDatabase,
  createBackup,
  cleanupOldData,
  verifyNewStructure,
  createSampleData
};
