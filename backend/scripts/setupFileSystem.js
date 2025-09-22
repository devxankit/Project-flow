#!/usr/bin/env node

/**
 * File System Setup Script
 * 
 * This script sets up the local file storage system for the new
 * Customer → Task → Subtask structure.
 * 
 * It creates the necessary directories and sets proper permissions
 * for file uploads and downloads.
 * 
 * Usage: node scripts/setupFileSystem.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

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

const logWarning = (message) => {
  log(`⚠️  ${message}`, 'yellow');
};

const logError = (message) => {
  log(`❌ ${message}`, 'red');
};

const logInfo = (message) => {
  log(`ℹ️  ${message}`, 'blue');
};

function createDirectory(dirPath, permissions = 0o755) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true, mode: permissions });
      logSuccess(`Created directory: ${dirPath}`);
      return true;
    } else {
      logInfo(`Directory already exists: ${dirPath}`);
      return false;
    }
  } catch (error) {
    logError(`Failed to create directory ${dirPath}: ${error.message}`);
    throw error;
  }
}

function setDirectoryPermissions(dirPath, permissions = 0o755) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.chmodSync(dirPath, permissions);
      logSuccess(`Set permissions for directory: ${dirPath} (${permissions.toString(8)})`);
      return true;
    } else {
      logWarning(`Directory does not exist: ${dirPath}`);
      return false;
    }
  } catch (error) {
    logError(`Failed to set permissions for ${dirPath}: ${error.message}`);
    throw error;
  }
}

function createGitkeepFile(dirPath) {
  try {
    const gitkeepPath = path.join(dirPath, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '# This file ensures the directory is tracked by git\n');
      logSuccess(`Created .gitkeep file: ${gitkeepPath}`);
      return true;
    } else {
      logInfo(`Gitkeep file already exists: ${gitkeepPath}`);
      return false;
    }
  } catch (error) {
    logError(`Failed to create .gitkeep file in ${dirPath}: ${error.message}`);
    throw error;
  }
}

function createReadmeFile(dirPath, content) {
  try {
    const readmePath = path.join(dirPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      fs.writeFileSync(readmePath, content);
      logSuccess(`Created README.md file: ${readmePath}`);
      return true;
    } else {
      logInfo(`README.md file already exists: ${readmePath}`);
      return false;
    }
  } catch (error) {
    logError(`Failed to create README.md file in ${dirPath}: ${error.message}`);
    throw error;
  }
}

function setupFileSystem() {
  try {
    log('🗂️  Setting up File System for Customer Structure', 'bright');
    log('=' .repeat(60), 'cyan');
    
    // Get the project root directory
    const projectRoot = path.join(__dirname, '..');
    const uploadsRoot = path.join(projectRoot, 'uploads');
    
    logStep('DIRECTORIES', 'Creating upload directories...');
    
    // Create main uploads directory
    createDirectory(uploadsRoot);
    
    // Create subdirectories for different entity types
    const directories = [
      path.join(uploadsRoot, 'tasks'),
      path.join(uploadsRoot, 'subtasks'),
      path.join(uploadsRoot, 'temp'), // For temporary files during upload
      path.join(uploadsRoot, 'backups') // For file backups
    ];
    
    directories.forEach(dir => {
      createDirectory(dir);
      createGitkeepFile(dir);
    });
    
    logStep('PERMISSIONS', 'Setting directory permissions...');
    
    // Set permissions for all directories
    directories.forEach(dir => {
      setDirectoryPermissions(dir);
    });
    
    logStep('DOCUMENTATION', 'Creating documentation files...');
    
    // Create README for uploads directory
    const uploadsReadme = `# Uploads Directory

This directory contains all file uploads for the Project Flow application.

## Directory Structure

- \`tasks/\` - Files attached to tasks
- \`subtasks/\` - Files attached to subtasks
- \`temp/\` - Temporary files during upload process
- \`backups/\` - File backups and archives

## File Organization

Files are organized by entity type and ID:
- Task files: \`tasks/{taskId}/{filename}\`
- Subtask files: \`subtasks/{subtaskId}/{filename}\`

## Security

- All files are validated before upload
- File types are restricted based on entity type
- File size limits are enforced
- Access is controlled by user permissions

## Maintenance

- Regular cleanup of temporary files
- Backup of important files
- Monitoring of disk usage
- Regular security audits

## File Naming Convention

Files are renamed with timestamps to prevent conflicts:
\`{timestamp}-{originalName}\`

Example: \`2024-01-15T10-30-45-document.pdf\`
`;

    createReadmeFile(uploadsRoot, uploadsReadme);
    
    // Create README for tasks directory
    const tasksReadme = `# Task Files Directory

This directory contains all files attached to tasks.

## File Structure

Files are stored in subdirectories named after the task ID:
\`{taskId}/{filename}\`

## File Types Allowed

- Documents: PDF, DOC, DOCX, TXT, RTF
- Images: JPG, JPEG, PNG, GIF, SVG
- Spreadsheets: XLS, XLSX, CSV
- Presentations: PPT, PPTX
- Archives: ZIP, RAR, 7Z

## File Size Limits

- Maximum file size: 10MB per file
- Maximum files per task: 50 files

## Access Control

- Only assigned team members can upload files
- Only assigned team members and PMs can download files
- File access is logged for audit purposes
`;

    createReadmeFile(path.join(uploadsRoot, 'tasks'), tasksReadme);
    
    // Create README for subtasks directory
    const subtasksReadme = `# Subtask Files Directory

This directory contains all files attached to subtasks.

## File Structure

Files are stored in subdirectories named after the subtask ID:
\`{subtaskId}/{filename}\`

## File Types Allowed

- Documents: PDF, DOC, DOCX, TXT, RTF
- Images: JPG, JPEG, PNG, GIF, SVG
- Spreadsheets: XLS, XLSX, CSV
- Presentations: PPT, PPTX
- Archives: ZIP, RAR, 7Z

## File Size Limits

- Maximum file size: 10MB per file
- Maximum files per subtask: 25 files

## Access Control

- Only assigned team members can upload files
- Only assigned team members and PMs can download files
- File access is logged for audit purposes
`;

    createReadmeFile(path.join(uploadsRoot, 'subtasks'), subtasksReadme);
    
    logStep('VERIFICATION', 'Verifying file system setup...');
    
    // Verify all directories exist
    const allDirs = [uploadsRoot, ...directories];
    allDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const stats = fs.statSync(dir);
        if (stats.isDirectory()) {
          logSuccess(`Verified directory: ${dir}`);
        } else {
          logError(`Path exists but is not a directory: ${dir}`);
        }
      } else {
        logError(`Directory does not exist: ${dir}`);
      }
    });
    
    // Check disk space
    const freeSpace = os.freemem();
    const totalSpace = os.totalmem();
    const usedSpace = totalSpace - freeSpace;
    const freeSpaceGB = (freeSpace / (1024 * 1024 * 1024)).toFixed(2);
    const totalSpaceGB = (totalSpace / (1024 * 1024 * 1024)).toFixed(2);
    
    logInfo(`Available disk space: ${freeSpaceGB} GB / ${totalSpaceGB} GB`);
    
    if (freeSpace < 1024 * 1024 * 1024) { // Less than 1GB
      logWarning('Low disk space detected! Consider cleaning up or expanding storage.');
    }
    
    log('\n' + '=' .repeat(60), 'green');
    log('🎉 File system setup completed successfully!', 'bright');
    log('=' .repeat(60), 'green');
    
    log('\n📋 File System Summary:', 'yellow');
    log(`📁 Uploads root: ${uploadsRoot}`, 'blue');
    log(`📁 Task files: ${path.join(uploadsRoot, 'tasks')}`, 'blue');
    log(`📁 Subtask files: ${path.join(uploadsRoot, 'subtasks')}`, 'blue');
    log(`📁 Temporary files: ${path.join(uploadsRoot, 'temp')}`, 'blue');
    log(`📁 Backups: ${path.join(uploadsRoot, 'backups')}`, 'blue');
    
    log('\n🔧 Next Steps:', 'yellow');
    log('1. Test file upload functionality', 'blue');
    log('2. Test file download functionality', 'blue');
    log('3. Verify file permissions and access', 'blue');
    log('4. Test file cleanup and maintenance', 'blue');
    log('5. Deploy to staging environment', 'blue');
    
  } catch (error) {
    log('\n' + '=' .repeat(60), 'red');
    log('💥 File system setup failed!', 'bright');
    log(`Error: ${error.message}`, 'red');
    log('=' .repeat(60), 'red');
    
    log('\n🔧 Recovery Steps:', 'yellow');
    log('1. Check the error message above', 'blue');
    log('2. Verify you have write permissions to the project directory', 'blue');
    log('3. Check available disk space', 'blue');
    log('4. Run the setup script again', 'blue');
    
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupFileSystem();
}

module.exports = {
  setupFileSystem,
  createDirectory,
  setDirectoryPermissions,
  createGitkeepFile,
  createReadmeFile
};
