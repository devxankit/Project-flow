const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const User = require('../models/User');
const { formatFileData, deleteFile } = require('../middlewares/uploadMiddleware');
const { validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return null;
};

// Helper function to check if user has permission to access project
const checkProjectPermission = async (projectId, userId, userRole) => {
  const project = await Project.findById(projectId);
  if (!project) {
    return { hasPermission: false, error: 'Project not found' };
  }

  // PM can access all projects
  if (userRole === 'pm') {
    return { hasPermission: true, project };
  }

  // Customer can only access their own projects
  if (userRole === 'customer') {
    if (project.customer.toString() === userId) {
      return { hasPermission: true, project };
    }
    return { hasPermission: false, error: 'Access denied' };
  }

  // Employee can access projects they're assigned to
  if (userRole === 'employee') {
    const isAssigned = project.assignedTeam.some(teamMember => 
      teamMember.toString() === userId
    );
    if (isAssigned) {
      return { hasPermission: true, project };
    }
    return { hasPermission: false, error: 'Access denied' };
  }

  return { hasPermission: false, error: 'Invalid role' };
};

// Helper function to calculate milestone progress based on tasks
const calculateMilestoneProgress = async (milestoneId) => {
  try {
    // Count total and completed tasks for this milestone
    const totalTasks = await Task.countDocuments({ milestone: milestoneId });
    const completedTasks = await Task.countDocuments({ 
      milestone: milestoneId, 
      status: 'completed' 
    });

    // Calculate progress percentage
    let progress = 0;
    if (totalTasks > 0) {
      progress = Math.round((completedTasks / totalTasks) * 100);
    }

    // Update the milestone's progress
    await Milestone.findByIdAndUpdate(milestoneId, { progress }, { new: true });

    return progress;
  } catch (error) {
    console.error('Error calculating milestone progress:', error);
    return 0;
  }
};

// @desc    Create a new milestone
// @route   POST /api/milestones
// @access  Private (PM only)
const createMilestone = async (req, res) => {
  try {
    // Handle both JSON and FormData requests
    let milestoneData;
    if (req.body.milestoneData) {
      // FormData request with milestoneData as JSON string
      milestoneData = JSON.parse(req.body.milestoneData);
    } else {
      // Regular JSON request
      milestoneData = req.body;
    }

    // Basic validation
    if (!milestoneData.title || !milestoneData.title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Milestone title is required'
      });
    }

    if (!milestoneData.dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Due date is required'
      });
    }

    if (!milestoneData.sequence || milestoneData.sequence < 1) {
      return res.status(400).json({
        success: false,
        message: 'Sequence must be a positive integer'
      });
    }

    if (!milestoneData.projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const {
      title,
      description,
      dueDate,
      assignedTo,
      status,
      priority,
      sequence,
      projectId
    } = milestoneData;

    // Verify project exists and user has permission
    const permissionCheck = await checkProjectPermission(projectId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    const project = permissionCheck.project;

    // Verify assigned users exist and are team members
    if (assignedTo && assignedTo.length > 0) {
      const assignedUsers = await User.find({ 
        _id: { $in: assignedTo },
        status: 'active'
      });
      
      if (assignedUsers.length !== assignedTo.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more assigned users not found or inactive'
        });
      }

      // Check if assigned users are part of the project team
      const teamMemberIds = project.assignedTeam.map(member => member.toString());
      const invalidAssignments = assignedTo.filter(userId => 
        !teamMemberIds.includes(userId.toString())
      );

      if (invalidAssignments.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned users must be part of the project team'
        });
      }
    }

    // Process file attachments if any
    let attachments = [];
    
    if (req.files && req.files.length > 0) {
      attachments = req.files
        .filter(file => file && file.originalname && file.mimetype) // Only process valid files
        .map(file => {
          // Extract public_id from path if not directly available
          let cloudinaryId = file.public_id || file.cloudinaryId;
          if (!cloudinaryId && file.path) {
            // Extract public_id from Cloudinary URL
            // URL format: https://res.cloudinary.com/cloud_name/resource_type/upload/v1234567890/folder/filename
            const pathParts = file.path.split('/');
            if (pathParts.length >= 2) {
              // Get the last part before the file extension
              const lastPart = pathParts[pathParts.length - 1];
              cloudinaryId = lastPart.split('.')[0]; // Remove file extension
            }
          }
          
          // Ensure we have the required fields for the attachment schema
          return {
            filename: file.filename || file.originalname,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            cloudinaryId: cloudinaryId,
            url: file.path || file.url,
            uploadedAt: new Date()
          };
        })
        .filter(attachment => attachment.url); // Only include valid attachments
    }

    // Create milestone using the Milestone model
    const milestone = new Milestone({
      title,
      description: description || '',
      project: projectId,
      sequence: parseInt(sequence),
      dueDate: new Date(dueDate),
      status: status || 'pending',
      priority: priority || 'normal',
      assignedTo: assignedTo || [],
      attachments,
      createdBy: req.user.id
    });

    await milestone.save();

    // Calculate initial progress (will be 0 since no tasks exist yet)
    await calculateMilestoneProgress(milestone._id);

    // Populate the created milestone with user data
    await milestone.populate([
      { path: 'assignedTo', select: 'fullName email avatar' },
      { path: 'createdBy', select: 'fullName email avatar' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: {
        milestone,
        project: {
          _id: project._id,
          name: project.name,
          progress: project.progress
        }
      }
    });

  } catch (error) {
    console.error('Error creating milestone:', error);
    
    // Handle validation errors from the model
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get milestones for a project
// @route   GET /api/milestones/project/:projectId
// @access  Private
const getMilestonesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists and user has permission
    const permissionCheck = await checkProjectPermission(projectId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    const project = permissionCheck.project;

    // Get milestones using the static method
    const milestones = await Milestone.getByProject(projectId);

    res.status(200).json({
      success: true,
      data: {
        milestones,
        project: {
          _id: project._id,
          name: project.name,
          progress: project.progress
        }
      }
    });

  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single milestone
// @route   GET /api/milestones/:milestoneId/project/:projectId
// @access  Private
const getMilestone = async (req, res) => {
  try {
    const { milestoneId, projectId } = req.params;

    // Verify project exists and user has permission
    const permissionCheck = await checkProjectPermission(projectId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    const project = permissionCheck.project;

    // Find the milestone
    const milestone = await Milestone.findById(milestoneId)
      .populate('assignedTo', 'fullName email avatar')
      .populate('createdBy', 'fullName email avatar')
      .populate('completedBy', 'fullName email avatar')
      .populate('comments.user', 'fullName email');

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Verify milestone belongs to the project
    if (milestone.project.toString() !== projectId) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found in this project'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        milestone,
        project: {
          _id: project._id,
          name: project.name,
          progress: project.progress
        }
      }
    });

  } catch (error) {
    console.error('Error fetching milestone:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:milestoneId/project/:projectId
// @access  Private (PM only)
const updateMilestone = async (req, res) => {
  try {
    const { milestoneId, projectId } = req.params;

    // Handle both JSON and FormData requests
    let milestoneData;
    if (req.body.milestoneData) {
      milestoneData = JSON.parse(req.body.milestoneData);
    } else {
      milestoneData = req.body;
    }

    const {
      title,
      description,
      dueDate,
      assignedTo,
      status,
      priority,
      sequence
    } = milestoneData;

    // Verify project exists and user has permission
    const permissionCheck = await checkProjectPermission(projectId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    const project = permissionCheck.project;

    // Find the milestone
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Verify milestone belongs to the project
    if (milestone.project.toString() !== projectId) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found in this project'
      });
    }

    // Verify assigned users if provided
    if (assignedTo && assignedTo.length > 0) {
      const assignedUsers = await User.find({ 
        _id: { $in: assignedTo },
        status: 'active'
      });
      
      if (assignedUsers.length !== assignedTo.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more assigned users not found or inactive'
        });
      }

      // Check if assigned users are part of the project team
      const teamMemberIds = project.assignedTeam.map(member => member.toString());
      const invalidAssignments = assignedTo.filter(userId => 
        !teamMemberIds.includes(userId.toString())
      );

      if (invalidAssignments.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned users must be part of the project team'
        });
      }
    }

    // Process new file attachments if any
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => formatFileData(file));
      milestone.attachments.push(...newAttachments);
    }

    // Update milestone data
    if (title !== undefined) milestone.title = title;
    if (description !== undefined) milestone.description = description;
    if (dueDate !== undefined) milestone.dueDate = new Date(dueDate);
    if (assignedTo !== undefined) milestone.assignedTo = assignedTo;
    if (status !== undefined) milestone.status = status;
    if (priority !== undefined) milestone.priority = priority;
    if (sequence !== undefined) milestone.sequence = parseInt(sequence);

    // Update completion data if status changed to completed
    if (status === 'completed' && milestone.status !== 'completed') {
      milestone.completedAt = new Date();
      milestone.completedBy = req.user.id;
    } else if (status !== 'completed' && milestone.status === 'completed') {
      milestone.completedAt = null;
      milestone.completedBy = null;
    }

    // Save the milestone
    await milestone.save();

    // Recalculate progress based on tasks
    await calculateMilestoneProgress(milestone._id);

    // Populate the updated milestone
    await milestone.populate([
      { path: 'assignedTo', select: 'fullName email avatar' },
      { path: 'createdBy', select: 'fullName email avatar' },
      { path: 'completedBy', select: 'fullName email avatar' }
    ]);

    // Get updated project progress
    const updatedProject = await Project.findById(projectId);

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully',
      data: {
        milestone,
        project: {
          _id: updatedProject._id,
          name: updatedProject.name,
          progress: updatedProject.progress
        }
      }
    });

  } catch (error) {
    console.error('Error updating milestone:', error);
    
    // Handle validation errors from the model
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete milestone
// @route   DELETE /api/milestones/:milestoneId/project/:projectId
// @access  Private (PM only)
const deleteMilestone = async (req, res) => {
  try {
    const { milestoneId, projectId } = req.params;

    // Verify project exists and user has permission
    const permissionCheck = await checkProjectPermission(projectId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    const project = permissionCheck.project;

    // Find the milestone
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Verify milestone belongs to the project
    if (milestone.project.toString() !== projectId) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found in this project'
      });
    }

    // Delete attachments from Cloudinary if any
    if (milestone.attachments && milestone.attachments.length > 0) {
      for (const attachment of milestone.attachments) {
        try {
          await deleteFile(attachment.cloudinaryId);
        } catch (error) {
          console.error('Error deleting attachment:', error);
          // Continue with milestone deletion even if attachment deletion fails
        }
      }
    }

    // Remove the milestone (this will trigger progress recalculation)
    await milestone.remove();

    // Get updated project progress
    const updatedProject = await Project.findById(projectId);

    res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully',
      data: {
        project: {
          _id: updatedProject._id,
          name: updatedProject.name,
          progress: updatedProject.progress
        }
      }
    });

  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get team members for milestone assignment
// @route   GET /api/milestones/team/:projectId
// @access  Private
const getTeamMembersForMilestone = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists and user has permission
    const permissionCheck = await checkProjectPermission(projectId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    const project = permissionCheck.project;

    // Get team members
    const teamMembers = await User.find({
      _id: { $in: project.assignedTeam },
      status: 'active'
    }).select('fullName email avatar department jobTitle');

    res.status(200).json({
      success: true,
      data: {
        teamMembers: teamMembers.map(member => ({
          value: member._id,
          label: member.fullName,
          subtitle: member.jobTitle || member.department,
          avatar: member.avatar || member.fullName.charAt(0)
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Download milestone attachment
// @route   GET /api/milestones/:milestoneId/project/:projectId/attachment/:attachmentId/download
// @access  Private
const downloadAttachment = async (req, res) => {
  try {
    const { milestoneId, projectId, attachmentId } = req.params;

    // Verify project exists and user has permission
    const permissionCheck = await checkProjectPermission(projectId, req.user.id, req.user.role);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error
      });
    }

    // Find the milestone
    const milestone = await Milestone.findOne({
      _id: milestoneId,
      project: projectId
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Find the attachment
    const attachment = milestone.attachments.find(att => att._id.toString() === attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Standard Cloudinary download approach
    const cloudinary = require('cloudinary').v2;
    
    // Configure Cloudinary if not already configured
    if (!cloudinary.config().cloud_name) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
    }
    
    console.log('Downloading file using standard Cloudinary approach...');
    console.log('Attachment details:', {
      cloudinaryId: attachment.cloudinaryId,
      filename: attachment.filename,
      originalName: attachment.originalName,
      url: attachment.url,
      mimetype: attachment.mimetype
    });
    
    try {
      // Extract the public ID from the original URL
      let publicId;
      if (attachment.url) {
        // Extract public ID from URL like: https://res.cloudinary.com/dj6z5fgff/image/upload/v1758274475/projectflow/documents/68cc868331c2bb14117c081f/recipet_1758274471231.pdf
        const urlParts = attachment.url.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && urlParts[uploadIndex + 2]) {
          // Get everything after the version number
          publicId = urlParts.slice(uploadIndex + 2).join('/');
          // Remove file extension for public ID
          publicId = publicId.replace(/\.[^/.]+$/, "");
        }
      }
      
      if (!publicId && attachment.filename) {
        // Fallback: use filename without extension
        publicId = attachment.filename.replace(/\.[^/.]+$/, "");
      }
      
      if (!publicId) {
        throw new Error('Could not determine public ID for file');
      }
      
      console.log('Using public ID:', publicId);
      
      // Determine resource type from original URL
      let resourceType = 'image'; // Default
      if (attachment.url) {
        if (attachment.url.includes('/video/upload/')) {
          resourceType = 'video';
        } else if (attachment.url.includes('/raw/upload/')) {
          resourceType = 'raw';
        } else if (attachment.url.includes('/image/upload/')) {
          resourceType = 'image';
        }
      }
      
      console.log('Resource type:', resourceType);
      
      // Generate a signed URL for secure download
      let downloadUrl;
      
      if (resourceType === 'raw') {
        // For raw files (PDFs, documents), use private_download_url
        downloadUrl = cloudinary.utils.private_download_url(publicId, attachment.originalName?.split('.').pop() || 'pdf', {
          resource_type: 'raw',
          expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
        });
        console.log('Generated private download URL for raw file:', downloadUrl);
      } else {
        // For images and videos, use regular signed URL
        downloadUrl = cloudinary.url(publicId, {
          sign_url: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
          resource_type: resourceType,
          secure: true
        });
        console.log('Generated signed URL:', downloadUrl);
      }
      
      // Fetch the file using the generated URL
      const fileResponse = await fetch(downloadUrl);
      
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file from Cloudinary: ${fileResponse.status} ${fileResponse.statusText}`);
      }
      
      // Get the file content
      const fileBuffer = await fileResponse.buffer();
      
      // Set appropriate headers for download
      res.setHeader('Content-Type', attachment.mimetype || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      
      // Send the file
      res.send(fileBuffer);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({
        success: false,
        message: 'Error downloading file',
        error: error.message
      });
    }

  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading attachment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createMilestone,
  getMilestonesByProject,
  getMilestone,
  updateMilestone,
  deleteMilestone,
  getTeamMembersForMilestone,
  downloadAttachment
};