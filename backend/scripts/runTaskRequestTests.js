#!/usr/bin/env node

const { runTests } = require('./testTaskRequestFunctionality');
const { runAPITests } = require('./testTaskRequestAPI');

const runAllTests = async () => {
  console.log('🎯 Task Request Functionality Test Suite');
  console.log('==========================================\n');
  
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  try {
    switch (testType) {
      case 'database':
        console.log('📊 Running Database Tests...\n');
        await runTests();
        break;
        
      case 'api':
        console.log('🌐 Running API Tests...\n');
        await runAPITests();
        break;
        
      case 'all':
      default:
        console.log('📊 Running Database Tests...\n');
        await runTests();
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        console.log('🌐 Running API Tests...\n');
        await runAPITests();
        break;
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Types Available:');
    console.log('   - database: Run database functionality tests');
    console.log('   - api: Run API endpoint tests');
    console.log('   - all: Run both database and API tests (default)');
    console.log('\n💡 Usage:');
    console.log('   node runTaskRequestTests.js [database|api|all]');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
};

// Run the tests
runAllTests();
