# Project Flow - API Documentation

## Overview

This document provides comprehensive API documentation for the restructured Project Flow application with the new **Customer → Task → Subtask** architecture.

## 🔗 Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-backend-app.onrender.com/api`

## 🔐 Authentication

All API endpoints require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Refresh
```
POST /api/auth/refresh
```

## 📊 API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "employee"
    },
    "token": "jwt_token"
  }
}
```

#### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "employee"
    },
    "token": "jwt_token"
  }
}
```

### Customer Endpoints

#### GET /api/customers
Get all customers with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status
- `priority` (string): Filter by priority
- `search` (string): Search term
- `sort` (string): Sort field
- `order` (string): Sort order (asc/desc)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "id": "customer_id",
      "name": "Customer Name",
      "description": "Customer description",
      "status": "active",
      "priority": "high",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "progress": 75,
      "customer": {
        "id": "user_id",
        "fullName": "Customer User",
        "email": "customer@example.com"
      },
      "projectManager": {
        "id": "pm_id",
        "fullName": "Project Manager",
        "email": "pm@example.com"
      },
      "assignedTeam": [
        {
          "id": "employee_id",
          "fullName": "Employee Name",
          "email": "employee@example.com"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/customers
Create a new customer (PM only).

**Request Body:**
```json
{
  "name": "Customer Name",
  "description": "Customer description",
  "customer": "customer_user_id",
  "priority": "high",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "assignedTeam": ["employee_id_1", "employee_id_2"],
  "status": "planning",
  "tags": ["tag1", "tag2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "customer_id",
    "name": "Customer Name",
    "description": "Customer description",
    "status": "planning",
    "priority": "high",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "progress": 0,
    "customer": "customer_user_id",
    "projectManager": "pm_id",
    "assignedTeam": ["employee_id_1", "employee_id_2"],
    "tags": ["tag1", "tag2"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/customers/:id
Get a single customer by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "customer_id",
    "name": "Customer Name",
    "description": "Customer description",
    "status": "active",
    "priority": "high",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "progress": 75,
    "customer": {
      "id": "user_id",
      "fullName": "Customer User",
      "email": "customer@example.com"
    },
    "projectManager": {
      "id": "pm_id",
      "fullName": "Project Manager",
      "email": "pm@example.com"
    },
    "assignedTeam": [
      {
        "id": "employee_id",
        "fullName": "Employee Name",
        "email": "employee@example.com"
      }
    ],
    "tasks": [
      {
        "id": "task_id",
        "title": "Task Title",
        "description": "Task description",
        "status": "in-progress",
        "priority": "high",
        "progress": 50,
        "dueDate": "2024-12-31T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/customers/:id
Update a customer (PM only).

**Request Body:**
```json
{
  "name": "Updated Customer Name",
  "status": "active",
  "priority": "urgent"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "id": "customer_id",
    "name": "Updated Customer Name",
    "status": "active",
    "priority": "urgent",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### DELETE /api/customers/:id
Delete a customer (PM only).

**Response:**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

#### GET /api/customers/stats
Get customer statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "active": 25,
    "completed": 15,
    "onHold": 5,
    "planning": 3,
    "cancelled": 2,
    "urgent": 10,
    "high": 20,
    "normal": 15,
    "low": 5,
    "avgProgress": 65
  }
}
```

### Task Endpoints

#### GET /api/tasks
Get all tasks with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `customer` (string): Filter by customer ID
- `status` (string): Filter by status
- `priority` (string): Filter by priority
- `assignedTo` (string): Filter by assigned user
- `search` (string): Search term

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10,
  "data": [
    {
      "id": "task_id",
      "title": "Task Title",
      "description": "Task description",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "progress": 50,
      "sequence": 1,
      "customer": {
        "id": "customer_id",
        "name": "Customer Name"
      },
      "assignedTo": [
        {
          "id": "employee_id",
          "fullName": "Employee Name",
          "email": "employee@example.com"
        }
      ],
      "createdBy": {
        "id": "pm_id",
        "fullName": "Project Manager",
        "email": "pm@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/tasks
Create a new task (PM only).

**Request Body:**
```json
{
  "title": "Task Title",
  "description": "Task description",
  "customer": "customer_id",
  "priority": "high",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "assignedTo": ["employee_id_1", "employee_id_2"],
  "status": "pending"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "task_id",
    "title": "Task Title",
    "description": "Task description",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "progress": 0,
    "sequence": 1,
    "customer": "customer_id",
    "assignedTo": ["employee_id_1", "employee_id_2"],
    "createdBy": "pm_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/tasks/:id
Get a single task by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "title": "Task Title",
    "description": "Task description",
    "status": "in-progress",
    "priority": "high",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "progress": 50,
    "sequence": 1,
    "customer": {
      "id": "customer_id",
      "name": "Customer Name"
    },
    "assignedTo": [
      {
        "id": "employee_id",
        "fullName": "Employee Name",
        "email": "employee@example.com"
      }
    ],
    "subtasks": [
      {
        "id": "subtask_id",
        "title": "Subtask Title",
        "status": "completed",
        "priority": "normal"
      }
    ],
    "attachments": [
      {
        "id": "attachment_id",
        "originalName": "document.pdf",
        "filename": "2024-01-01T00-00-00-document.pdf",
        "fileType": "application/pdf",
        "fileSize": 1024000,
        "uploadedBy": "employee_id",
        "uploadedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "comments": [
      {
        "id": "comment_id",
        "text": "Comment text",
        "user": {
          "id": "user_id",
          "fullName": "User Name"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/tasks/:id
Update a task.

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "status": "completed",
  "priority": "urgent"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "task_id",
    "title": "Updated Task Title",
    "status": "completed",
    "priority": "urgent",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### DELETE /api/tasks/:id
Delete a task (PM only).

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### Subtask Endpoints

#### GET /api/subtasks
Get all subtasks with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `task` (string): Filter by task ID
- `customer` (string): Filter by customer ID
- `status` (string): Filter by status
- `priority` (string): Filter by priority
- `assignedTo` (string): Filter by assigned user

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "id": "subtask_id",
      "title": "Subtask Title",
      "description": "Subtask description",
      "status": "in-progress",
      "priority": "normal",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "sequence": 1,
      "task": {
        "id": "task_id",
        "title": "Task Title"
      },
      "customer": {
        "id": "customer_id",
        "name": "Customer Name"
      },
      "assignedTo": [
        {
          "id": "employee_id",
          "fullName": "Employee Name",
          "email": "employee@example.com"
        }
      ],
      "createdBy": {
        "id": "pm_id",
        "fullName": "Project Manager",
        "email": "pm@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/subtasks
Create a new subtask (PM only).

**Request Body:**
```json
{
  "title": "Subtask Title",
  "description": "Subtask description",
  "task": "task_id",
  "customer": "customer_id",
  "priority": "normal",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "assignedTo": ["employee_id_1"],
  "status": "pending"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subtask created successfully",
  "data": {
    "id": "subtask_id",
    "title": "Subtask Title",
    "description": "Subtask description",
    "status": "pending",
    "priority": "normal",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "sequence": 1,
    "task": "task_id",
    "customer": "customer_id",
    "assignedTo": ["employee_id_1"],
    "createdBy": "pm_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/subtasks/:id
Get a single subtask by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "subtask_id",
    "title": "Subtask Title",
    "description": "Subtask description",
    "status": "in-progress",
    "priority": "normal",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "sequence": 1,
    "task": {
      "id": "task_id",
      "title": "Task Title"
    },
    "customer": {
      "id": "customer_id",
      "name": "Customer Name"
    },
    "assignedTo": [
      {
        "id": "employee_id",
        "fullName": "Employee Name",
        "email": "employee@example.com"
      }
    ],
    "attachments": [
      {
        "id": "attachment_id",
        "originalName": "document.pdf",
        "filename": "2024-01-01T00-00-00-document.pdf",
        "fileType": "application/pdf",
        "fileSize": 1024000,
        "uploadedBy": "employee_id",
        "uploadedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "comments": [
      {
        "id": "comment_id",
        "text": "Comment text",
        "user": {
          "id": "user_id",
          "fullName": "User Name"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/subtasks/:id
Update a subtask.

**Request Body:**
```json
{
  "title": "Updated Subtask Title",
  "status": "completed",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subtask updated successfully",
  "data": {
    "id": "subtask_id",
    "title": "Updated Subtask Title",
    "status": "completed",
    "priority": "high",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### DELETE /api/subtasks/:id
Delete a subtask (PM only).

**Response:**
```json
{
  "success": true,
  "message": "Subtask deleted successfully"
}
```

### File Endpoints

#### POST /api/files/upload
Upload a file for a task or subtask.

**Request Body (multipart/form-data):**
- `file`: The file to upload
- `entityType`: "Task" or "Subtask"
- `entityId`: ID of the task or subtask

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "attachment_id",
    "originalName": "document.pdf",
    "filename": "2024-01-01T00-00-00-document.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024000,
    "entityType": "Task",
    "entityId": "task_id",
    "uploadedBy": "user_id",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/files/download/:fileId
Download a file.

**Response:**
File download with appropriate headers.

#### DELETE /api/files/:fileId
Delete a file.

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### GET /api/files/:entityType/:entityId
Get all files for a specific entity.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "attachment_id",
      "originalName": "document.pdf",
      "filename": "2024-01-01T00-00-00-document.pdf",
      "fileType": "application/pdf",
      "fileSize": 1024000,
      "uploadedBy": {
        "id": "user_id",
        "fullName": "User Name"
      },
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Activity Endpoints

#### GET /api/activities
Get activity feed with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `type` (string): Filter by activity type
- `customer` (string): Filter by customer ID
- `actor` (string): Filter by actor ID

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10,
  "data": [
    {
      "id": "activity_id",
      "type": "customer_created",
      "description": "Customer 'Customer Name' was created",
      "actor": {
        "id": "pm_id",
        "fullName": "Project Manager",
        "avatar": "avatar_url"
      },
      "target": {
        "id": "customer_id",
        "name": "Customer Name"
      },
      "customer": {
        "id": "customer_id",
        "name": "Customer Name"
      },
      "metadata": {
        "status": "planning",
        "priority": "high"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Employee Endpoints

#### GET /api/employee/dashboard
Get employee dashboard data.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCustomers": 5,
      "activeCustomers": 3,
      "completedCustomers": 1,
      "totalTasks": 20,
      "pendingTasks": 5,
      "inProgressTasks": 10,
      "completedTasks": 5,
      "urgentTasks": 3,
      "overallTaskProgress": 75
    },
    "recentTasks": [
      {
        "id": "task_id",
        "title": "Task Title",
        "status": "in-progress",
        "priority": "high",
        "dueDate": "2024-12-31T00:00:00.000Z",
        "customer": {
          "id": "customer_id",
          "name": "Customer Name"
        }
      }
    ],
    "assignedCustomersCount": 5
  }
}
```

#### GET /api/employee/customers
Get customers assigned to the employee.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "id": "customer_id",
      "name": "Customer Name",
      "status": "active",
      "priority": "high",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "progress": 75,
      "customer": {
        "id": "user_id",
        "fullName": "Customer User",
        "email": "customer@example.com"
      },
      "projectManager": {
        "id": "pm_id",
        "fullName": "Project Manager",
        "email": "pm@example.com"
      }
    }
  ]
}
```

#### GET /api/employee/tasks
Get tasks assigned to the employee.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 20,
  "page": 1,
  "pages": 2,
  "data": [
    {
      "id": "task_id",
      "title": "Task Title",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "progress": 50,
      "customer": {
        "id": "customer_id",
        "name": "Customer Name"
      },
      "assignedTo": [
        {
          "id": "employee_id",
          "fullName": "Employee Name",
          "email": "employee@example.com"
        }
      ]
    }
  ]
}
```

## 🔒 Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "errors": [
    {
      "field": "field_name",
      "message": "Field-specific error message"
    }
  ]
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## 📝 Rate Limiting

- **Limit**: 100 requests per 15 minutes
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## 🔧 Testing

### Test Endpoints
```bash
# Health check
curl https://your-api-url/api/health

# Test authentication
curl -X POST https://your-api-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test customer endpoint
curl https://your-api-url/api/customers \
  -H "Authorization: Bearer your-jwt-token"
```

### Postman Collection
Import the Postman collection for comprehensive API testing.

---

**📚 This API documentation covers all endpoints for the new Customer → Task → Subtask structure. For additional examples and integration guides, refer to the specific module documentation.**
