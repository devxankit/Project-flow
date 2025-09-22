# Project Flow - Technical Documentation

## Overview

This document provides comprehensive technical documentation for the restructured Project Flow application with the new **Customer → Task → Subtask** architecture.

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ - PM Module     │    │ - REST API      │    │ - Customer      │
│ - Employee      │    │ - Authentication│    │ - Task          │
│ - Customer      │    │ - File Storage  │    │ - Subtask       │
│                 │    │ - Activity Log  │    │ - User          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React.js 18+
- **Routing**: React Router DOM
- **State Management**: React Context API
- **UI Components**: Custom components with Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Build Tool**: Vite

#### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local file system with Multer
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

#### Database
- **Primary Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Connection**: MongoDB Atlas cluster

## 📊 Database Schema

### Customer Model

```javascript
{
  // Basic Information
  name: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  description: {
    type: String,
    maxlength: 2000,
    trim: true
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Dates
  startDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  
  // Relationships
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTeam: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Progress & Tracking
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  
  // System Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'team'
  }
}
```

### Task Model

```javascript
{
  // Basic Information
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Relationships
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Dates
  dueDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Progress & Tracking
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sequence: {
    type: Number,
    required: true
  },
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subtask'
  }],
  
  // Content
  attachments: [{
    originalName: String,
    filename: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}
```

### Subtask Model

```javascript
{
  // Basic Information
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Relationships
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Dates
  dueDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Progress & Tracking
  sequence: {
    type: Number,
    required: true
  },
  
  // Content
  attachments: [{
    originalName: String,
    filename: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}
```

### User Model

```javascript
{
  // Basic Information
  fullName: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['pm', 'employee', 'customer'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    maxlength: 20
  },
  department: {
    type: String,
    maxlength: 100
  },
  
  // Relationships (Updated for new structure)
  managedCustomers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  assignedCustomers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  customerProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  
  // System Fields
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

## 🔌 API Architecture

### RESTful API Design

#### Base URL Structure
```
https://your-api-domain.com/api
```

#### Endpoint Patterns
```
GET    /api/customers           # List all customers
POST   /api/customers           # Create new customer
GET    /api/customers/:id       # Get customer by ID
PUT    /api/customers/:id       # Update customer
DELETE /api/customers/:id       # Delete customer

GET    /api/tasks               # List all tasks
POST   /api/tasks               # Create new task
GET    /api/tasks/:id           # Get task by ID
PUT    /api/tasks/:id           # Update task
DELETE /api/tasks/:id           # Delete task

GET    /api/subtasks            # List all subtasks
POST   /api/subtasks            # Create new subtask
GET    /api/subtasks/:id        # Get subtask by ID
PUT    /api/subtasks/:id        # Update subtask
DELETE /api/subtasks/:id        # Delete subtask
```

#### Response Format
```javascript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "errors": [
    {
      "field": "field_name",
      "message": "Field-specific error"
    }
  ]
}
```

### Authentication & Authorization

#### JWT Token Structure
```javascript
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "pm|employee|customer",
    "iat": 1640995200,
    "exp": 1641600000
  }
}
```

#### Role-Based Access Control
```javascript
// PM Role - Full Access
const pmPermissions = {
  customers: ['create', 'read', 'update', 'delete'],
  tasks: ['create', 'read', 'update', 'delete'],
  subtasks: ['create', 'read', 'update', 'delete'],
  files: ['upload', 'download', 'delete'],
  users: ['read', 'update']
};

// Employee Role - Limited Access
const employeePermissions = {
  customers: ['read'], // Only assigned customers
  tasks: ['read', 'update'], // Only assigned tasks
  subtasks: ['read', 'update'], // Only assigned subtasks
  files: ['upload', 'download'], // Only assigned entities
  users: ['read'] // Only team members
};

// Customer Role - View Only
const customerPermissions = {
  customers: ['read'], // Only own customer records
  tasks: ['read'], // Only own customer tasks
  subtasks: ['read'], // Only own customer subtasks
  files: ['download'], // Only own customer files
  users: ['read'] // Only assigned team members
};
```

## 📁 File Storage Architecture

### Local File System Structure

```
uploads/
├── tasks/
│   ├── {taskId}/
│   │   ├── 2024-01-01T00-00-00-document.pdf
│   │   ├── 2024-01-01T00-00-00-image.jpg
│   │   └── ...
│   └── ...
├── subtasks/
│   ├── {subtaskId}/
│   │   ├── 2024-01-01T00-00-00-document.pdf
│   │   ├── 2024-01-01T00-00-00-image.jpg
│   │   └── ...
│   └── ...
├── temp/
│   └── temporary-upload-files
└── backups/
    └── file-backups
```

### File Upload Process

1. **Client Upload Request**
   ```javascript
   const formData = new FormData();
   formData.append('file', file);
   formData.append('entityType', 'Task');
   formData.append('entityId', taskId);
   ```

2. **Server Validation**
   ```javascript
   // File type validation
   const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
   if (!allowedTypes.includes(file.mimetype)) {
     throw new Error('Invalid file type');
   }
   
   // File size validation
   if (file.size > MAX_FILE_SIZE) {
     throw new Error('File too large');
   }
   ```

3. **File Storage**
   ```javascript
   // Generate unique filename
   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
   const filename = `${timestamp}-${file.originalname}`;
   
   // Save to appropriate directory
   const uploadPath = `uploads/${entityType.toLowerCase()}s/${entityId}`;
   await fs.mkdir(uploadPath, { recursive: true });
   await fs.writeFile(path.join(uploadPath, filename), file.buffer);
   ```

4. **Database Record**
   ```javascript
   // Save file metadata to database
   const attachment = {
     originalName: file.originalname,
     filename: filename,
     fileType: file.mimetype,
     fileSize: file.size,
     uploadedBy: userId,
     uploadedAt: new Date()
   };
   ```

### File Download Process

1. **Download Request**
   ```javascript
   GET /api/files/download/:fileId
   ```

2. **Permission Check**
   ```javascript
   // Verify user has access to the file
   const file = await File.findById(fileId);
   const hasAccess = await checkFileAccess(userId, file);
   if (!hasAccess) {
     throw new Error('Access denied');
   }
   ```

3. **File Retrieval**
   ```javascript
   // Read file from filesystem
   const filePath = path.join(uploadPath, file.filename);
   const fileBuffer = await fs.readFile(filePath);
   
   // Set appropriate headers
   res.setHeader('Content-Type', file.fileType);
   res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
   res.send(fileBuffer);
   ```

## 🔄 Progress Calculation System

### Real-Time Progress Updates

#### Customer Progress
```javascript
// Calculate customer progress based on task completion
const calculateCustomerProgress = async (customerId) => {
  const tasks = await Task.find({ customer: customerId });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  await Customer.findByIdAndUpdate(customerId, { progress });
  return progress;
};
```

#### Task Progress
```javascript
// Calculate task progress based on subtask completion
const calculateTaskProgress = async (taskId) => {
  const subtasks = await Subtask.find({ task: taskId });
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(subtask => subtask.status === 'completed').length;
  
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  
  await Task.findByIdAndUpdate(taskId, { progress });
  return progress;
};
```

#### Automatic Updates
```javascript
// Mongoose middleware for automatic progress updates
SubtaskSchema.post('save', async function() {
  await calculateTaskProgress(this.task);
  const task = await Task.findById(this.task);
  await calculateCustomerProgress(task.customer);
});

TaskSchema.post('save', async function() {
  await calculateCustomerProgress(this.customer);
});
```

## 📊 Activity Tracking System

### Activity Types

```javascript
const activityTypes = {
  // Customer Activities
  'customer_created': 'Customer was created',
  'customer_updated': 'Customer was updated',
  'customer_deleted': 'Customer was deleted',
  'customer_status_changed': 'Customer status was changed',
  
  // Task Activities
  'task_created': 'Task was created',
  'task_updated': 'Task was updated',
  'task_deleted': 'Task was deleted',
  'task_status_changed': 'Task status was changed',
  'task_assigned': 'Task was assigned',
  
  // Subtask Activities
  'subtask_created': 'Subtask was created',
  'subtask_updated': 'Subtask was updated',
  'subtask_deleted': 'Subtask was deleted',
  'subtask_status_changed': 'Subtask status was changed',
  'subtask_assigned': 'Subtask was assigned',
  
  // File Activities
  'file_uploaded': 'File was uploaded',
  'file_downloaded': 'File was downloaded',
  'file_deleted': 'File was deleted',
  
  // Comment Activities
  'comment_added': 'Comment was added',
  'comment_deleted': 'Comment was deleted'
};
```

### Activity Model

```javascript
{
  type: {
    type: String,
    required: true,
    enum: Object.keys(activityTypes)
  },
  description: {
    type: String,
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
    required: true
  },
  targetModel: {
    type: String,
    enum: ['Customer', 'Task', 'Subtask'],
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

## 🔒 Security Implementation

### Authentication Security

#### Password Hashing
```javascript
// Using bcrypt for password hashing
const bcrypt = require('bcryptjs');

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

#### JWT Security
```javascript
// JWT token generation
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// JWT token verification
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
```

### Authorization Security

#### Role-Based Access Control
```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};
```

#### Resource-Based Access Control
```javascript
const checkResourceAccess = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  
  // Check if user has access to the resource
  const hasAccess = await checkUserAccess(userId, userRole, id);
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You do not have permission to access this resource.'
    });
  }
  next();
};
```

### Input Validation

#### Request Validation
```javascript
const { body, validationResult } = require('express-validator');

const validateCustomerCreation = [
  body('name')
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ max: 200 })
    .withMessage('Customer name cannot exceed 200 characters'),
  body('status')
    .isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  // ... more validations
];
```

#### File Upload Security
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `uploads/${req.body.entityType.toLowerCase()}s/${req.body.entityId}`;
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}-${file.originalname}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});
```

## 🚀 Performance Optimization

### Database Optimization

#### Indexing Strategy
```javascript
// Customer indexes
CustomerSchema.index({ name: 'text', description: 'text' });
CustomerSchema.index({ status: 1 });
CustomerSchema.index({ priority: 1 });
CustomerSchema.index({ customer: 1 });
CustomerSchema.index({ projectManager: 1 });
CustomerSchema.index({ assignedTeam: 1 });
CustomerSchema.index({ dueDate: 1 });
CustomerSchema.index({ createdAt: -1 });

// Task indexes
TaskSchema.index({ title: 'text', description: 'text' });
TaskSchema.index({ customer: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdAt: -1 });

// Subtask indexes
SubtaskSchema.index({ title: 'text', description: 'text' });
SubtaskSchema.index({ task: 1 });
SubtaskSchema.index({ customer: 1 });
SubtaskSchema.index({ status: 1 });
SubtaskSchema.index({ priority: 1 });
SubtaskSchema.index({ assignedTo: 1 });
SubtaskSchema.index({ dueDate: 1 });
SubtaskSchema.index({ createdAt: -1 });
```

#### Query Optimization
```javascript
// Efficient customer query with population
const getCustomersWithDetails = async (filters = {}) => {
  return await Customer.find(filters)
    .populate('customer', 'fullName email avatar')
    .populate('projectManager', 'fullName email avatar')
    .populate('assignedTeam', 'fullName email avatar')
    .select('name description status priority dueDate progress assignedTeam')
    .sort({ createdAt: -1 })
    .limit(10);
};

// Efficient task query with population
const getTasksWithDetails = async (filters = {}) => {
  return await Task.find(filters)
    .populate('customer', 'name')
    .populate('assignedTo', 'fullName email avatar')
    .populate('createdBy', 'fullName email avatar')
    .select('title description status priority dueDate progress sequence')
    .sort({ sequence: 1 })
    .limit(20);
};
```

### API Optimization

#### Response Caching
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.sendResponse(body);
    };
    
    next();
  };
};
```

#### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);
```

## 📈 Monitoring & Logging

### Application Logging

#### Logging Configuration
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

#### Request Logging
```javascript
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: duration,
      user: req.user?.id,
      ip: req.ip
    });
  });
  
  next();
};
```

### Error Handling

#### Global Error Handler
```javascript
const errorHandler = (err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id
  });
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

#### Validation Error Handler
```javascript
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};
```

## 🔧 Development Setup

### Environment Setup

#### Required Environment Variables
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/projectflow

# Frontend Configuration
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRE=30d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
UPLOAD_TASKS_PATH=./uploads/tasks
UPLOAD_SUBTASKS_PATH=./uploads/subtasks

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Development Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "node scripts/migrateToCustomerStructure.js",
    "setup-files": "node scripts/setupFileSystem.js",
    "seed": "node scripts/seedData.js"
  }
}
```

### Testing Strategy

#### Unit Tests
```javascript
// Example unit test for Customer model
describe('Customer Model', () => {
  test('should create a customer with valid data', async () => {
    const customerData = {
      name: 'Test Customer',
      description: 'Test Description',
      customer: new mongoose.Types.ObjectId(),
      projectManager: new mongoose.Types.ObjectId(),
      dueDate: new Date(),
      createdBy: new mongoose.Types.ObjectId()
    };
    
    const customer = new Customer(customerData);
    const savedCustomer = await customer.save();
    
    expect(savedCustomer.name).toBe(customerData.name);
    expect(savedCustomer.progress).toBe(0);
  });
});
```

#### Integration Tests
```javascript
// Example integration test for Customer API
describe('Customer API', () => {
  test('should create a customer', async () => {
    const customerData = {
      name: 'Test Customer',
      description: 'Test Description',
      customer: customerUserId,
      projectManager: pmUserId,
      dueDate: new Date(),
      priority: 'high'
    };
    
    const response = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${pmToken}`)
      .send(customerData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(customerData.name);
  });
});
```

---

**📚 This technical documentation provides comprehensive information about the new Customer → Task → Subtask architecture. For additional implementation details, refer to the source code and API documentation.**
