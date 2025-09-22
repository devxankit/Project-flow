#!/usr/bin/env node

/**
 * Test Runner for Project Flow Restructure
 * 
 * This script runs the comprehensive test suite and provides a user-friendly interface.
 * 
 * Usage: node scripts/runTests.js
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

const logStep = (step, message) => {
  log(`\n[${step}] ${message}`, 'cyan');
};

const logSuccess = (message) => {
  log(`✅ ${message}`, 'green');
};

const logError = (message) => {
  log(`❌ ${message}`, 'red');
};

const logInfo = (message) => {
  log(`ℹ️  ${message}`, 'blue');
};

// Check if server is running
const checkServerRunning = async () => {
  const axios = require('axios');
  try {
    await axios.get('http://localhost:5000/api/health');
    return true;
  } catch (error) {
    return false;
  }
};

// Start the server if not running
const startServer = () => {
  return new Promise((resolve, reject) => {
    logStep('SERVER', 'Starting the server...');
    
    const serverProcess = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server running on port')) {
        logSuccess('Server started successfully');
        resolve(serverProcess);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      logError(`Server error: ${data.toString()}`);
    });

    serverProcess.on('error', (error) => {
      logError(`Failed to start server: ${error.message}`);
      reject(error);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!serverProcess.killed) {
        logError('Server startup timeout');
        reject(new Error('Server startup timeout'));
      }
    }, 30000);
  });
};

// Run the comprehensive test suite
const runTests = async () => {
  try {
    log('🧪 Project Flow Restructure - Comprehensive Test Runner', 'bright');
    log('=' .repeat(60), 'cyan');
    
    // Check if server is running
    logStep('CHECK', 'Checking if server is running...');
    const serverRunning = await checkServerRunning();
    
    let serverProcess = null;
    
    if (!serverRunning) {
      logInfo('Server is not running. Starting server...');
      serverProcess = await startServer();
      
      // Wait a bit for server to fully start
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      logSuccess('Server is already running');
    }
    
    // Run the comprehensive test suite
    logStep('TESTS', 'Running comprehensive test suite...');
    
    const testProcess = spawn('node', ['scripts/comprehensiveTestSuite.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        logSuccess('All tests completed successfully!');
      } else {
        logError(`Tests failed with exit code: ${code}`);
      }
      
      // Clean up server if we started it
      if (serverProcess) {
        logStep('CLEANUP', 'Stopping server...');
        serverProcess.kill();
        logSuccess('Server stopped');
      }
      
      process.exit(code);
    });

    testProcess.on('error', (error) => {
      logError(`Failed to run tests: ${error.message}`);
      
      // Clean up server if we started it
      if (serverProcess) {
        serverProcess.kill();
      }
      
      process.exit(1);
    });

  } catch (error) {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  log('\n⚠️  Test runner interrupted by user', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n⚠️  Test runner terminated', 'yellow');
  process.exit(0);
});

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
