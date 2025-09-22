const { body, param, query } = require('express-validator');

// Customer creation validation
const validateCustomerCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ max: 200 })
    .withMessage('Customer name cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Customer description cannot exceed 2000 characters'),
  
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled'])
    .withMessage('Status must be planning, active, on-hold, completed, or cancelled'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be low, normal, high, or urgent'),
  
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      const dueDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    }),
  
  body('customer')
    .notEmpty()
    .withMessage('Customer user is required')
    .isMongoId()
    .withMessage('Invalid customer user ID'),
  
  body('assignedTeam')
    .optional()
    .isArray()
    .withMessage('Assigned team must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        const isValid = value.every(id => {
          try {
            return require('mongoose').Types.ObjectId.isValid(id);
          } catch (error) {
            return false;
          }
        });
        if (!isValid) {
          throw new Error('All assigned team members must have valid IDs');
        }
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        const isValid = value.every(tag => 
          typeof tag === 'string' && tag.trim().length > 0 && tag.length <= 50
        );
        if (!isValid) {
          throw new Error('All tags must be non-empty strings with maximum 50 characters');
        }
      }
      return true;
    }),
  
  body('visibility')
    .optional()
    .isIn(['private', 'team', 'public'])
    .withMessage('Visibility must be private, team, or public')
];

// Customer update validation
const validateCustomerUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid customer ID'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Customer name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Customer name cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Customer description cannot exceed 2000 characters'),
  
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled'])
    .withMessage('Status must be planning, active, on-hold, completed, or cancelled'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be low, normal, high, or urgent'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      if (value) {
        const dueDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          throw new Error('Due date cannot be in the past');
        }
      }
      return true;
    }),
  
  body('assignedTeam')
    .optional()
    .isArray()
    .withMessage('Assigned team must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        const isValid = value.every(id => {
          try {
            return require('mongoose').Types.ObjectId.isValid(id);
          } catch (error) {
            return false;
          }
        });
        if (!isValid) {
          throw new Error('All assigned team members must have valid IDs');
        }
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        const isValid = value.every(tag => 
          typeof tag === 'string' && tag.trim().length > 0 && tag.length <= 50
        );
        if (!isValid) {
          throw new Error('All tags must be non-empty strings with maximum 50 characters');
        }
      }
      return true;
    }),
  
  body('visibility')
    .optional()
    .isIn(['private', 'team', 'public'])
    .withMessage('Visibility must be private, team, or public')
];

// Customer ID validation
const validateCustomerId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid customer ID')
];

// Customer query validation
const validateCustomerQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled'])
    .withMessage('Status must be planning, active, on-hold, completed, or cancelled'),
  
  query('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be low, normal, high, or urgent'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  
  query('role')
    .optional()
    .isIn(['customer', 'team'])
    .withMessage('Role must be customer or team')
];

module.exports = {
  validateCustomerCreation,
  validateCustomerUpdate,
  validateCustomerId,
  validateCustomerQuery
};
