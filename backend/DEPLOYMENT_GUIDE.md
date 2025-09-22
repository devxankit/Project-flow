# Project Flow - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the restructured Project Flow application from the old **Project → Milestone → Task** structure to the new **Customer → Task → Subtask** structure.

## 🚨 Pre-Deployment Checklist

### Environment Requirements
- [ ] Node.js 16+ installed
- [ ] MongoDB Atlas cluster configured
- [ ] Render account for backend deployment
- [ ] Vercel account for frontend deployment
- [ ] Environment variables configured
- [ ] File storage system set up

### Code Requirements
- [ ] All Phase 1-4 tasks completed
- [ ] Database migration scripts ready
- [ ] File system setup scripts ready
- [ ] Environment configuration updated
- [ ] All tests passing
- [ ] Documentation updated

## 📋 Deployment Steps

### Step 1: Environment Configuration

#### 1.1 Update Environment Variables

**Backend Environment Variables:**
```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Database Configuration
MONGODB_URI=your-mongodb-atlas-connection-string

# Frontend Configuration
FRONTEND_URL=https://your-frontend-app.vercel.app

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
JWT_REFRESH_EXPIRE=30d

# File Upload Configuration (Local Storage)
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
UPLOAD_TASKS_PATH=./uploads/tasks
UPLOAD_SUBTASKS_PATH=./uploads/subtasks

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend Environment Variables:**
```env
VITE_API_URL=https://your-backend-app.onrender.com/api
```

#### 1.2 Verify Configuration
```bash
# Test environment variables
node -e "console.log(process.env.MONGODB_URI)"
node -e "console.log(process.env.JWT_SECRET)"
```

### Step 2: Database Migration

#### 2.1 Create Database Backup
```bash
# Create backup before migration
mongodump --uri="your-mongodb-connection-string" --out ./backups/backup-before-migration-$(date +%Y%m%d-%H%M%S)
```

#### 2.2 Run Migration Script
```bash
# Navigate to backend directory
cd backend

# Run migration script
node scripts/migrateToCustomerStructure.js
```

#### 2.3 Verify Migration
```bash
# Test database connection
node scripts/testDatabaseConnection.js

# Verify new structure
node scripts/verifyNewStructure.js
```

### Step 3: File System Setup

#### 3.1 Set Up Local File Storage
```bash
# Run file system setup script
node scripts/setupFileSystem.js
```

#### 3.2 Verify File System
```bash
# Check directory structure
ls -la uploads/
ls -la uploads/tasks/
ls -la uploads/subtasks/

# Check permissions
ls -la uploads/ | grep "^d"
```

### Step 4: Backend Deployment

#### 4.1 Deploy to Render

**Create Render Service:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure service settings:
   - **Name**: `project-flow-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Starter` or `Standard`

**Environment Variables:**
Add all environment variables from Step 1.1 to the Render service.

**Deploy:**
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note the service URL (e.g., `https://project-flow-backend.onrender.com`)

#### 4.2 Verify Backend Deployment
```bash
# Test API endpoints
curl https://your-backend-app.onrender.com/api/health
curl https://your-backend-app.onrender.com/api/customers
```

### Step 5: Frontend Deployment

#### 5.1 Deploy to Vercel

**Create Vercel Project:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

**Environment Variables:**
Add the frontend environment variables from Step 1.1.

**Deploy:**
1. Click "Deploy"
2. Wait for deployment to complete
3. Note the deployment URL (e.g., `https://project-flow-frontend.vercel.app`)

#### 5.2 Verify Frontend Deployment
1. Open the deployment URL in a browser
2. Test user authentication
3. Test all three modules (PM, Employee, Customer)
4. Test file upload/download functionality

### Step 6: Post-Deployment Verification

#### 6.1 Functional Testing
- [ ] User authentication works
- [ ] PM module functions correctly
- [ ] Employee module functions correctly
- [ ] Customer module functions correctly
- [ ] File upload/download works
- [ ] All API endpoints respond correctly
- [ ] Database operations work
- [ ] File system operations work

#### 6.2 Performance Testing
- [ ] Page load times are acceptable
- [ ] API response times are acceptable
- [ ] File upload/download is fast enough
- [ ] Database queries are optimized
- [ ] No memory leaks detected

#### 6.3 Security Testing
- [ ] Authentication is secure
- [ ] Authorization works correctly
- [ ] File uploads are secure
- [ ] API endpoints are protected
- [ ] No sensitive data exposed

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(console.error)"
```

#### File Upload Issues
```bash
# Check file system permissions
ls -la uploads/
chmod -R 755 uploads/
```

#### Environment Variable Issues
```bash
# Check environment variables
node -e "console.log(Object.keys(process.env).filter(k => k.includes('MONGODB') || k.includes('JWT') || k.includes('UPLOAD')))"
```

### Rollback Procedures

#### Database Rollback
```bash
# Restore from backup
mongorestore --uri="your-mongodb-connection-string" ./backups/backup-before-migration-YYYYMMDD-HHMMSS
```

#### Application Rollback
1. Revert to previous commit in Git
2. Redeploy to Render/Vercel
3. Restore database from backup
4. Verify rollback success

## 📊 Monitoring

### Health Checks
- **Backend Health**: `GET /api/health`
- **Database Health**: Check MongoDB Atlas dashboard
- **File System Health**: Monitor disk usage
- **API Performance**: Monitor response times

### Logs
- **Backend Logs**: Check Render service logs
- **Frontend Logs**: Check Vercel deployment logs
- **Database Logs**: Check MongoDB Atlas logs
- **File System Logs**: Check server logs

### Alerts
Set up alerts for:
- High error rates
- Slow response times
- Database connection issues
- File system issues
- High memory usage

## 📚 Documentation

### User Documentation
- [Customer Management Guide](docs/customer-management.md)
- [Task Management Guide](docs/task-management.md)
- [Subtask Management Guide](docs/subtask-management.md)
- [File Management Guide](docs/file-management.md)

### Technical Documentation
- [API Documentation](docs/api-documentation.md)
- [Database Schema](docs/database-schema.md)
- [File System Architecture](docs/file-system.md)
- [Security Guide](docs/security.md)

### Maintenance Documentation
- [Backup Procedures](docs/backup-procedures.md)
- [Monitoring Guide](docs/monitoring.md)
- [Troubleshooting Guide](docs/troubleshooting.md)
- [Update Procedures](docs/update-procedures.md)

## 🎯 Success Criteria

### Deployment Success
- [ ] All services deployed successfully
- [ ] All functionality working correctly
- [ ] Performance meets requirements
- [ ] Security requirements met
- [ ] Documentation complete
- [ ] Monitoring in place

### User Acceptance
- [ ] Users can access the application
- [ ] All workflows function correctly
- [ ] File operations work properly
- [ ] No critical bugs reported
- [ ] User feedback is positive

### System Stability
- [ ] No system crashes
- [ ] No data loss
- [ ] No security breaches
- [ ] Performance is stable
- [ ] Monitoring shows healthy metrics

## 🚀 Go Live Checklist

### Final Verification
- [ ] All deployment steps completed
- [ ] All tests passing
- [ ] All documentation updated
- [ ] All monitoring in place
- [ ] All users notified
- [ ] Support team ready
- [ ] Rollback plan ready

### Launch
- [ ] Deploy to production
- [ ] Monitor system health
- [ ] Collect user feedback
- [ ] Address any issues
- [ ] Document lessons learned
- [ ] Plan future improvements

---

**🎉 Congratulations! Your Project Flow application has been successfully restructured and deployed with the new Customer → Task → Subtask architecture!**
