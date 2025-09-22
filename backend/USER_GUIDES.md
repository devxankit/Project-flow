# Project Flow - User Guides

## Overview

This document provides comprehensive user guides for the restructured Project Flow application with the new **Customer → Task → Subtask** architecture.

## 👥 User Roles

### Project Manager (PM)
- **Full Access**: Can manage all customers, tasks, and subtasks
- **Responsibilities**: Create customers, assign teams, manage tasks, monitor progress
- **Permissions**: Create, read, update, delete all entities

### Employee
- **Limited Access**: Can only access assigned customers and tasks
- **Responsibilities**: Work on assigned tasks and subtasks, update progress
- **Permissions**: Read assigned entities, update task/subtask status

### Customer
- **View-Only Access**: Can only view their own customer records
- **Responsibilities**: Monitor progress, view tasks and subtasks
- **Permissions**: Read own customer data only

## 📋 Customer Management Guide

### For Project Managers

#### Creating a New Customer

1. **Navigate to Customers**
   - Click on "Customers" in the navigation menu
   - You'll see the customer listing page

2. **Click "New Customer"**
   - Click the "New Customer" button in the top-right corner
   - This opens the customer creation form

3. **Fill in Customer Details**
   - **Customer Name**: Enter a descriptive name for the customer
   - **Description**: Provide a detailed description of the customer's needs
   - **Customer User**: Select the customer user from the dropdown
   - **Priority**: Choose priority level (Low, Normal, High, Urgent)
   - **Due Date**: Set the target completion date
   - **Assigned Team**: Select team members to work on this customer
   - **Status**: Set initial status (Planning, Active, On Hold, Completed, Cancelled)
   - **Tags**: Add relevant tags for categorization

4. **Save the Customer**
   - Click "Create Customer" to save
   - The customer will appear in your customer list

#### Managing Customer Details

1. **View Customer Details**
   - Click on any customer card to view details
   - You'll see customer information, tasks, and progress

2. **Edit Customer Information**
   - Click the "Edit" button on the customer details page
   - Update any fields as needed
   - Click "Save Changes" to update

3. **Assign Team Members**
   - In the customer details page, go to the "Team" tab
   - Click "Add Team Member" to assign employees
   - Click "Remove" next to a team member to unassign them

4. **Update Customer Status**
   - Use the status dropdown to change customer status
   - Status options: Planning, Active, On Hold, Completed, Cancelled

#### Customer Progress Tracking

1. **View Progress Overview**
   - Customer progress is calculated based on completed tasks
   - Progress bar shows overall completion percentage
   - Individual task progress is shown in the tasks list

2. **Monitor Task Completion**
   - Each task shows its own progress percentage
   - Progress is calculated based on completed subtasks
   - Real-time updates as team members complete work

### For Employees

#### Viewing Assigned Customers

1. **Access Customer Dashboard**
   - Log in to your employee account
   - You'll see your assigned customers on the dashboard

2. **View Customer Details**
   - Click on any assigned customer to view details
   - You can see customer information and assigned tasks

3. **Work on Assigned Tasks**
   - Go to the "Tasks" tab in customer details
   - Click on any assigned task to view and work on it

### For Customers

#### Viewing Your Customer Records

1. **Access Customer Dashboard**
   - Log in to your customer account
   - You'll see your customer records and progress

2. **Monitor Progress**
   - View overall progress percentage
   - See individual task progress
   - Track completion status

3. **View Task Details**
   - Click on tasks to see detailed information
   - View subtasks and their completion status
   - See assigned team members

## ✅ Task Management Guide

### For Project Managers

#### Creating Tasks

1. **Navigate to Tasks**
   - Click on "Tasks" in the navigation menu
   - Or create tasks from within a customer's details page

2. **Click "New Task"**
   - Click the "New Task" button
   - This opens the task creation form

3. **Fill in Task Details**
   - **Task Title**: Enter a clear, descriptive title
   - **Description**: Provide detailed task description
   - **Customer**: Select the customer this task belongs to
   - **Priority**: Choose priority level (Low, Normal, High, Urgent)
   - **Due Date**: Set the target completion date
   - **Assigned To**: Select team members to work on this task
   - **Status**: Set initial status (Pending, In Progress, Completed, Cancelled)

4. **Save the Task**
   - Click "Create Task" to save
   - The task will appear in the customer's task list

#### Managing Tasks

1. **View Task Details**
   - Click on any task to view detailed information
   - You'll see task details, subtasks, attachments, and comments

2. **Edit Task Information**
   - Click the "Edit" button on the task details page
   - Update any fields as needed
   - Click "Save Changes" to update

3. **Assign Team Members**
   - In the task details page, go to the "Team" tab
   - Click "Add Team Member" to assign employees
   - Click "Remove" next to a team member to unassign them

4. **Update Task Status**
   - Use the status dropdown to change task status
   - Status options: Pending, In Progress, Completed, Cancelled

#### Creating Subtasks

1. **From Task Details Page**
   - Click on a task to view its details
   - Go to the "Subtasks" tab
   - Click "New Subtask" button

2. **Fill in Subtask Details**
   - **Subtask Title**: Enter a clear, descriptive title
   - **Description**: Provide detailed subtask description
   - **Priority**: Choose priority level
   - **Due Date**: Set the target completion date
   - **Assigned To**: Select team members to work on this subtask
   - **Status**: Set initial status

3. **Save the Subtask**
   - Click "Create Subtask" to save
   - The subtask will appear in the task's subtask list

### For Employees

#### Working on Assigned Tasks

1. **View Assigned Tasks**
   - Log in to your employee account
   - Go to the "Tasks" section
   - You'll see all tasks assigned to you

2. **Update Task Status**
   - Click on a task to view details
   - Use the status dropdown to update progress
   - Status options: Pending, In Progress, Completed, Cancelled

3. **Work on Subtasks**
   - Go to the "Subtasks" tab in task details
   - Click on assigned subtasks to work on them
   - Update subtask status as you complete work

4. **Add Comments**
   - Use the comments section to communicate with team members
   - Add updates, questions, or progress notes

5. **Upload Files**
   - Use the file upload feature to attach relevant documents
   - Supported file types: PDF, DOC, DOCX, images, etc.

#### Managing Subtasks

1. **View Subtask Details**
   - Click on any subtask to view detailed information
   - You'll see subtask details, attachments, and comments

2. **Update Subtask Status**
   - Use the status dropdown to change subtask status
   - Status options: Pending, In Progress, Completed, Cancelled

3. **Add Comments**
   - Use the comments section to provide updates
   - Communicate with team members and project managers

4. **Upload Files**
   - Attach relevant files to subtasks
   - Share documents, images, or other resources

### For Customers

#### Viewing Task Progress

1. **Access Task Information**
   - Log in to your customer account
   - Navigate to your customer records
   - Click on tasks to view detailed information

2. **Monitor Task Progress**
   - View overall task progress percentage
   - See individual subtask completion status
   - Track assigned team members

3. **View Task Details**
   - Click on tasks to see detailed information
   - View subtasks and their completion status
   - See comments and file attachments

## 📁 File Management Guide

### Uploading Files

#### For Project Managers and Employees

1. **Navigate to Task or Subtask**
   - Go to the task or subtask details page
   - Scroll to the "Files" section

2. **Click "Upload File"**
   - Click the "Upload File" button
   - Select files from your computer

3. **Supported File Types**
   - Documents: PDF, DOC, DOCX, TXT, RTF
   - Images: JPG, JPEG, PNG, GIF, SVG
   - Spreadsheets: XLS, XLSX, CSV
   - Presentations: PPT, PPTX
   - Archives: ZIP, RAR, 7Z

4. **File Size Limits**
   - Maximum file size: 10MB per file
   - Maximum files per task: 50 files
   - Maximum files per subtask: 25 files

### Downloading Files

1. **View File List**
   - Go to the task or subtask details page
   - Scroll to the "Files" section
   - You'll see a list of uploaded files

2. **Download Files**
   - Click on any file to download it
   - Files will be downloaded to your default download folder

3. **File Information**
   - View file name, size, and upload date
   - See who uploaded the file
   - Check file type and description

### Managing Files

#### For Project Managers

1. **Delete Files**
   - Click the "Delete" button next to any file
   - Confirm deletion in the popup dialog
   - Files are permanently removed

2. **Organize Files**
   - Files are automatically organized by task/subtask
   - Use descriptive file names for easy identification
   - Add comments to files for context

#### For Employees

1. **Upload Work Files**
   - Upload completed work, reports, or documentation
   - Share files with team members and project managers
   - Use comments to explain file contents

2. **Download Reference Files**
   - Download files uploaded by others
   - Access shared resources and documentation
   - Save files locally for offline work

## 📊 Progress Tracking Guide

### Understanding Progress Calculation

#### Customer Progress
- **Formula**: (Completed Tasks / Total Tasks) × 100
- **Real-time Updates**: Progress updates automatically as tasks are completed
- **Visual Indicator**: Progress bar shows completion percentage

#### Task Progress
- **Formula**: (Completed Subtasks / Total Subtasks) × 100
- **Real-time Updates**: Progress updates automatically as subtasks are completed
- **Visual Indicator**: Progress bar shows completion percentage

### Monitoring Progress

#### For Project Managers

1. **Dashboard Overview**
   - View overall progress across all customers
   - See progress by customer, priority, and status
   - Monitor team performance and workload

2. **Customer Progress**
   - Track individual customer progress
   - Identify customers that need attention
   - Monitor deadline compliance

3. **Task Progress**
   - View task completion rates
   - Identify bottlenecks and delays
   - Monitor team productivity

#### For Employees

1. **Personal Dashboard**
   - View your assigned tasks and progress
   - See upcoming deadlines
   - Track your contribution to customer progress

2. **Task Progress**
   - Update task and subtask status
   - Monitor your completion rates
   - Track your workload

#### For Customers

1. **Progress Monitoring**
   - View overall customer progress
   - See individual task completion
   - Track milestone achievements

2. **Status Updates**
   - Receive progress updates
   - Monitor team performance
   - Track delivery timelines

## 🔍 Search and Filtering Guide

### Searching Customers

1. **Basic Search**
   - Use the search bar to find customers by name
   - Search is case-insensitive
   - Results update as you type

2. **Advanced Filtering**
   - Filter by status: All, Active, Planning, On Hold, Completed, Cancelled
   - Filter by priority: All, Low, Normal, High, Urgent
   - Filter by assigned team member
   - Filter by date range

### Searching Tasks

1. **Basic Search**
   - Use the search bar to find tasks by title
   - Search is case-insensitive
   - Results update as you type

2. **Advanced Filtering**
   - Filter by customer
   - Filter by status: All, Pending, In Progress, Completed, Cancelled
   - Filter by priority: All, Low, Normal, High, Urgent
   - Filter by assigned team member
   - Filter by date range

### Searching Subtasks

1. **Basic Search**
   - Use the search bar to find subtasks by title
   - Search is case-insensitive
   - Results update as you type

2. **Advanced Filtering**
   - Filter by parent task
   - Filter by customer
   - Filter by status: All, Pending, In Progress, Completed, Cancelled
   - Filter by priority: All, Low, Normal, High, Urgent
   - Filter by assigned team member

## 🚨 Troubleshooting Guide

### Common Issues

#### Login Problems
1. **Check Credentials**
   - Verify email and password are correct
   - Check for typos in email address
   - Ensure caps lock is not enabled

2. **Account Status**
   - Contact administrator if account is locked
   - Verify account is active and not suspended

#### Access Issues
1. **Permission Errors**
   - Contact your project manager for access
   - Verify your role and permissions
   - Check if you're assigned to the correct customer/task

2. **Missing Data**
   - Refresh the page
   - Check your internet connection
   - Contact support if data is still missing

#### File Upload Issues
1. **File Size**
   - Ensure file is under 10MB limit
   - Compress large files if necessary
   - Split large documents into smaller parts

2. **File Type**
   - Check if file type is supported
   - Convert unsupported formats
   - Use alternative file formats

#### Performance Issues
1. **Slow Loading**
   - Check internet connection
   - Clear browser cache
   - Try refreshing the page

2. **Browser Issues**
   - Update browser to latest version
   - Disable browser extensions
   - Try a different browser

### Getting Help

#### Contact Support
1. **Technical Issues**
   - Contact your IT administrator
   - Report bugs through the feedback system
   - Check the troubleshooting documentation

2. **User Questions**
   - Contact your project manager
   - Check the user guides and documentation
   - Ask team members for help

#### Training Resources
1. **Documentation**
   - Read the user guides
   - Check the FAQ section
   - Review the video tutorials

2. **Training Sessions**
   - Attend user training sessions
   - Participate in team workshops
   - Ask for one-on-one training

---

**📚 These user guides provide comprehensive instructions for using the new Customer → Task → Subtask structure. For additional help, contact your project manager or refer to the technical documentation.**
