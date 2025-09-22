#!/usr/bin/env node

/**
 * Complete Test Runner for Project Flow Restructure
 * 
 * This script runs the comprehensive test suite and provides a clean summary.
 * 
 * Usage: node scripts/runCompleteTest.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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

const runCompleteTest = () => {
  log('🚀 Project Flow Restructure - Complete Test Suite', 'bright');
  log('=' .repeat(70), 'cyan');
  
  log('\n📋 Running comprehensive test suite...', 'blue');
  log('Testing the complete Customer → Task → Subtask architecture\n', 'yellow');
  
  const testProcess = spawn('node', ['scripts/comprehensiveTestSuite.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  testProcess.on('close', (code) => {
    log('\n' + '=' .repeat(70), 'green');
    
    // Read and display test results
    try {
      const reportPath = path.join(__dirname, '..', 'test-reports', 'comprehensive-test-report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const successRate = ((report.summary.passed / report.summary.total) * 100).toFixed(1);
        
        log('📊 FINAL TEST RESULTS:', 'bright');
        log(`Total Tests: ${report.summary.total}`, 'blue');
        log(`Passed: ${report.summary.passed}`, 'green');
        log(`Failed: ${report.summary.failed}`, 'red');
        log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
        log(`Duration: ${(report.duration / 1000).toFixed(2)} seconds`, 'blue');
        
        if (successRate >= 80) {
          log('\n🎉 EXCELLENT! Project restructure is SUCCESSFUL!', 'bright');
          log('✅ Ready for production deployment', 'green');
        } else if (successRate >= 60) {
          log('\n⚠️  Good progress, but some issues need attention', 'yellow');
        } else {
          log('\n❌ Significant issues found, needs more work', 'red');
        }
      }
    } catch (error) {
      log('Could not read test report', 'yellow');
    }
    
    log('\n📁 Test reports available at:', 'blue');
    log('   - backend/test-reports/comprehensive-test-report.json', 'cyan');
    log('   - backend/test-reports/FINAL_TEST_REPORT.md', 'cyan');
    log('   - backend/test-reports/test-summary.md', 'cyan');
    
    log('\n' + '=' .repeat(70), 'green');
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
  runCompleteTest();
}

module.exports = { runCompleteTest };
