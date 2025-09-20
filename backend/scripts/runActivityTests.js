#!/usr/bin/env node

/**
 * Activity Functionality Test Runner
 * 
 * This script runs comprehensive tests for the Activity functionality
 * to ensure proper role-based access control and data integrity.
 * 
 * Usage: node scripts/runActivityTests.js
 */

const { runTests } = require('./testActivityFunctionality');

console.log('🎯 Activity Functionality Test Runner');
console.log('=====================================\n');

runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});
