#!/usr/bin/env node

/**
 * Simple Test Runner for Project Flow Restructure
 * 
 * This script runs the comprehensive test suite and provides a clean output.
 * 
 * Usage: node scripts/runTestSuite.js
 */

const { spawn } = require('child_process');
const path = require('path');

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

const runTests = () => {
  log('🧪 Project Flow Restructure - Test Suite Runner', 'bright');
  log('=' .repeat(60), 'cyan');
  
  log('\n📋 Running comprehensive test suite...', 'blue');
  log('This will test all new APIs and features for the Customer → Task → Subtask structure.\n', 'yellow');
  
  const testProcess = spawn('node', ['scripts/comprehensiveTestSuite.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  testProcess.on('close', (code) => {
    log('\n' + '=' .repeat(60), 'green');
    if (code === 0) {
      log('🎉 All tests completed successfully!', 'bright');
      log('📊 Check the test report at: backend/test-reports/comprehensive-test-report.md', 'blue');
    } else {
      log(`⚠️  Tests completed with exit code: ${code}`, 'yellow');
      log('📊 Check the test report for detailed results', 'blue');
    }
    log('=' .repeat(60), 'green');
  });

  testProcess.on('error', (error) => {
    log(`❌ Failed to run tests: ${error.message}`, 'red');
  });
};

// Handle process termination
process.on('SIGINT', () => {
  log('\n⚠️  Test runner interrupted by user', 'yellow');
  process.exit(0);
});

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
