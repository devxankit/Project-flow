# Task Request Functionality Test Suite

This directory contains comprehensive test scripts for the task request functionality in the project management system.

## Overview

The task request system allows customers to submit requests for new tasks in their projects, which are then reviewed and approved/rejected by project managers. When approved, a new task is automatically created.

## Test Scripts

### 1. `testTaskRequestFunctionality.js`
**Database-level functionality tests**

Tests the core business logic and database operations:
- ✅ Task request creation and validation
- ✅ Customer task request retrieval
- ✅ PM task request retrieval
- ✅ Task request approval and task creation
- ✅ Task request rejection with reason notes
- ✅ Task request updates and cancellation
- ✅ Data validation and error handling
- ✅ Statistics and analytics
- ✅ Edge cases and special scenarios

### 2. `testTaskRequestAPI.js`
**API endpoint tests**

Tests the REST API endpoints:
- ✅ Authentication (Customer & PM login)
- ✅ Task request CRUD operations
- ✅ Approval/rejection workflows
- ✅ Error handling and validation
- ✅ Filtering and search functionality
- ✅ Cross-role access restrictions

### 3. `runTaskRequestTests.js`
**Test runner script**

Convenient script to run all tests or specific test types.

## Prerequisites

1. **Database Setup**: Ensure MongoDB is running and accessible
2. **Environment Variables**: Set up your `.env` file with database connection
3. **Test Data**: The scripts will create test users and projects automatically
4. **Dependencies**: Install required npm packages

## Running the Tests

### Option 1: Run All Tests
```bash
cd backend/scripts
node runTaskRequestTests.js
```

### Option 2: Run Specific Test Types
```bash
# Database tests only
node runTaskRequestTests.js database

# API tests only
node runTaskRequestTests.js api

# Both (default)
node runTaskRequestTests.js all
```

### Option 3: Run Individual Test Files
```bash
# Database functionality tests
node testTaskRequestFunctionality.js

# API endpoint tests
node testTaskRequestAPI.js
```

## Test Data

The tests automatically create the following test data:

### Test Users
- **Customer**: `testcustomer@example.com` / `password123`
- **Project Manager**: `testpm@example.com` / `password123`
- **Employee**: `testemployee@example.com` / `password123`

### Test Project
- **Name**: "Test Task Request Project"
- **Customer**: Test Customer
- **Project Manager**: Test Project Manager
- **Status**: Active

### Test Milestone
- **Name**: "Test Milestone for Task Requests"
- **Project**: Test Task Request Project
- **Progress**: 0%

## Test Scenarios

### 1. Task Request Creation
- Valid task request with all required fields
- Validation of title length (5-100 characters)
- Validation of description length (20-1000 characters)
- Validation of priority levels (Low, Medium, High, Urgent)
- Validation of due date (must be in future)
- Validation of reason types (bug-fix, feature-request, etc.)

### 2. Task Request Management
- Customer can view their own task requests
- Customer can update pending task requests
- Customer can cancel pending task requests
- PM can view all task requests for their projects
- PM can approve task requests (creates new task)
- PM can reject task requests with reason notes

### 3. Task Creation from Approved Requests
- When PM approves a task request, a new task is automatically created
- Task inherits properties from the request
- Task is linked to the original request
- Task status is set to 'pending'

### 4. Error Handling
- Invalid data validation
- Unauthorized access attempts
- Cross-role access restrictions
- Non-existent resource access
- Malformed request handling

### 5. Edge Cases
- Maximum length field values
- Special characters and unicode
- Multiple requests for same milestone
- Concurrent operations
- Large datasets

## Expected Results

### Database Tests
- All task request operations work correctly
- Data validation prevents invalid entries
- Relationships between models are maintained
- Statistics and analytics are accurate

### API Tests
- All endpoints respond correctly
- Authentication and authorization work
- Error responses are properly formatted
- Filtering and search functionality works

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   ❌ MongoDB connection error
   ```
   - Ensure MongoDB is running
   - Check connection string in `.env` file
   - Verify database permissions

2. **Authentication Failed**
   ```
   ❌ Authentication test failed
   ```
   - Ensure test users exist in database
   - Check password hashing
   - Verify JWT token generation

3. **No Projects Found**
   ```
   ❌ No projects found for customer
   ```
   - Run the database setup script first
   - Ensure test data is created properly
   - Check user-project relationships

4. **API Server Not Running**
   ```
   ❌ API Error: connect ECONNREFUSED
   ```
   - Start the backend server: `npm start`
   - Check server port configuration
   - Verify API base URL

### Debug Mode

To run tests with more verbose output:
```bash
DEBUG=true node runTaskRequestTests.js
```

## Test Coverage

The test suite covers:

- ✅ **Models**: TaskRequest, Task, Project, Milestone, User
- ✅ **Controllers**: All task request controller methods
- ✅ **Routes**: All task request API endpoints
- ✅ **Validation**: Input validation and error handling
- ✅ **Business Logic**: Approval/rejection workflows
- ✅ **Security**: Authentication and authorization
- ✅ **Edge Cases**: Boundary conditions and error scenarios

## Contributing

When adding new features to the task request system:

1. **Update Tests**: Add corresponding test cases
2. **Test Coverage**: Ensure new functionality is covered
3. **Documentation**: Update this README if needed
4. **Validation**: Run tests before submitting changes

## Performance Notes

- Database tests create and clean up test data automatically
- API tests use real HTTP requests to test endpoints
- Tests are designed to be run in any order
- No test dependencies on external services

## Security Considerations

- Test users have limited permissions
- Test data is isolated from production
- No sensitive information in test data
- Tests validate security boundaries

---

**Note**: These tests are designed for development and testing environments. Do not run them against production databases.
