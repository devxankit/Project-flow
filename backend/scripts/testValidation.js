const { param, validationResult } = require('express-validator');

// Test the validation middleware
const validateMilestoneId = [
  param('milestoneId')
    .isMongoId()
    .withMessage('Valid milestone ID is required')
];

// Test with a valid MongoDB ObjectId
const validId = '68ce4786c371121b8c3aec7e';
const invalidId = 'invalid-id';

console.log('Testing validation middleware...');

// Simulate validation
const mockReq = {
  params: { milestoneId: validId }
};

const mockRes = {
  status: (code) => ({
    json: (data) => {
      console.log(`Status ${code}:`, data);
      return mockRes;
    }
  })
};

// Test validation
const validation = validateMilestoneId[0];
validation.run(mockReq).then(() => {
  const errors = validationResult(mockReq);
  console.log('Validation result:', errors.isEmpty() ? 'Valid' : 'Invalid');
  if (!errors.isEmpty()) {
    console.log('Errors:', errors.array());
  }
});

// Test with invalid ID
const mockReqInvalid = {
  params: { milestoneId: invalidId }
};

validation.run(mockReqInvalid).then(() => {
  const errors = validationResult(mockReqInvalid);
  console.log('Invalid ID validation result:', errors.isEmpty() ? 'Valid' : 'Invalid');
  if (!errors.isEmpty()) {
    console.log('Errors:', errors.array());
  }
});
