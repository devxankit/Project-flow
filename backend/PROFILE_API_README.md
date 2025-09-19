# Profile API Documentation

This document describes the Profile API endpoints for the ProjectFlow application, which allows users to manage their profiles and profile images across all three user types: PM, Employee, and Customer.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Profile Image Upload](#profile-image-upload)
- [User Types and Permissions](#user-types-and-permissions)
- [Testing](#testing)
- [Error Handling](#error-handling)

## Overview

The Profile API provides comprehensive profile management functionality including:

- **Profile Information Management**: Update personal details, contact information, and role-specific fields
- **Profile Image Upload**: Upload, update, and delete profile images using Cloudinary
- **Password Management**: Change passwords with proper validation
- **Role-based Access Control**: Different permissions for PM, Employee, and Customer users
- **PM User Management**: PMs can view and update other users' profiles

## Authentication

All profile endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Current User Profile Routes

These routes are for users to manage their own profiles.

#### Get Current Profile
```http
GET /api/profile
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user-id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "employee",
      "avatar": "JD",
      "profileImage": {
        "url": "https://res.cloudinary.com/...",
        "cloudinaryId": "profile_image_id",
        "uploadedAt": "2024-01-15T10:30:00.000Z"
      },
      "department": "Engineering",
      "jobTitle": "Software Developer",
      "workTitle": "Frontend Developer",
      "phone": "+1234567890",
      "location": "New York, NY",
      "skills": ["JavaScript", "React", "Node.js"],
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Update Current Profile
```http
PUT /api/profile
```

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "phone": "+1234567890",
  "location": "San Francisco, CA",
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"]
}
```

**Role-specific fields:**
- **Employee/PM**: `department`, `jobTitle`, `workTitle`, `skills`
- **Customer**: `company`, `address`

#### Upload Profile Image
```http
POST /api/profile/image
Content-Type: multipart/form-data
```

**Request Body:**
- `profileImage`: Image file (JPEG, PNG, WebP)
- Maximum size: 5MB
- Recommended dimensions: 400x400px

**Response:**
```json
{
  "status": "success",
  "message": "Profile image uploaded successfully",
  "data": {
    "user": { /* updated user object */ },
    "imageUrl": "https://res.cloudinary.com/..."
  }
}
```

#### Delete Profile Image
```http
DELETE /api/profile/image
```

#### Change Password
```http
PUT /api/profile/password
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### PM-Only User Management Routes

These routes are only accessible to Project Managers.

#### Get User Profile by ID
```http
GET /api/profile/:id
```

#### Update User Profile by ID
```http
PUT /api/profile/:id
```

**Request Body:** Same as update current profile, plus:
```json
{
  "role": "employee",
  "status": "active"
}
```

## Profile Image Upload

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### File Size Limits
- Maximum size: 5MB
- Automatic optimization and resizing to 400x400px

### Cloudinary Integration
- Images are automatically uploaded to Cloudinary
- Automatic face detection and cropping
- Quality optimization
- CDN delivery for fast loading

### Image Storage Structure
```
projectflow/
  profile-images/
    {userId}/
      profile_{filename}_{timestamp}
```

## User Types and Permissions

### Project Manager (PM)
- ✅ View own profile
- ✅ Update own profile
- ✅ Upload/delete own profile image
- ✅ Change own password
- ✅ View any user's profile
- ✅ Update any user's profile
- ✅ Manage user roles and status

### Employee
- ✅ View own profile
- ✅ Update own profile (limited fields)
- ✅ Upload/delete own profile image
- ✅ Change own password
- ❌ View other users' profiles
- ❌ Update other users' profiles

### Customer
- ✅ View own profile
- ✅ Update own profile (limited fields)
- ✅ Upload/delete own profile image
- ✅ Change own password
- ❌ View other users' profiles
- ❌ Update other users' profiles

## Testing

### Setup Test Users
```bash
npm run setup-profile-tests
```

### Run Profile Tests
```bash
npm run test-profile
```

### Cleanup Test Users
```bash
npm run cleanup-profile-tests
```

### Test Coverage
The test suite covers:
- ✅ Profile retrieval for all user types
- ✅ Profile updates for all user types
- ✅ Profile image upload/delete
- ✅ Password changes
- ✅ PM user management features
- ✅ Unauthorized access prevention

## Error Handling

### Common Error Responses

#### Validation Error (400)
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": ["Full name is required", "Invalid email format"]
}
```

#### Unauthorized (401)
```json
{
  "status": "error",
  "message": "Access denied. No token provided."
}
```

#### Forbidden (403)
```json
{
  "status": "error",
  "message": "Access denied. Insufficient permissions."
}
```

#### Not Found (404)
```json
{
  "status": "error",
  "message": "User not found"
}
```

#### File Upload Error (400)
```json
{
  "status": "error",
  "message": "Profile image upload error",
  "error": "File type image/gif is not allowed"
}
```

## Environment Variables

Make sure these environment variables are set:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d

# Database
MONGODB_URI=mongodb://localhost:27017/projectflow
```

## Frontend Integration

### Profile Image Upload Example
```javascript
const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('profileImage', file);
  
  const response = await fetch('/api/profile/image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

### Profile Update Example
```javascript
const updateProfile = async (profileData) => {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  
  return response.json();
};
```

## Security Considerations

1. **File Upload Security**: Only image files are allowed, with size limits
2. **Authentication**: All endpoints require valid JWT tokens
3. **Authorization**: Role-based access control prevents unauthorized access
4. **Input Validation**: All inputs are validated and sanitized
5. **Password Security**: Passwords are hashed using bcrypt
6. **Image Processing**: Images are processed and optimized by Cloudinary

## Troubleshooting

### Common Issues

1. **Cloudinary Upload Fails**
   - Check Cloudinary credentials in environment variables
   - Verify file size is under 5MB
   - Ensure file format is supported

2. **Permission Denied**
   - Verify user has correct role
   - Check JWT token is valid and not expired
   - Ensure user is trying to access appropriate endpoints

3. **Profile Update Fails**
   - Check required fields are provided
   - Verify field validation rules
   - Ensure user has permission to update specific fields

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages in responses.
