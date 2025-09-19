const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { deleteProfileImage: deleteProfileImageFromCloudinary, formatProfileImageData } = require('../middlewares/profileUploadMiddleware');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private (All authenticated users)
const getCurrentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Get current profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/profile
// @access  Private (All authenticated users)
const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      location,
      skills,
      company,
      address
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update basic fields
    if (fullName) user.fullName = fullName.trim();
    if (phone) user.phone = phone.trim();
    if (location) user.location = location.trim();
    if (skills) {
      // Handle skills as array
      if (typeof skills === 'string') {
        user.skills = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      } else if (Array.isArray(skills)) {
        user.skills = skills.filter(skill => skill && skill.trim());
      }
    }

    // Update role-specific fields
    if (user.role === 'customer') {
      if (company) user.company = company.trim();
      if (address) user.address = address.trim();
    }

    await user.save();

    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Upload profile image
// @route   POST /api/profile/image
// @access  Private (All authenticated users)
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No profile image file provided'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Delete old profile image if exists
    if (user.profileImage && user.profileImage.cloudinaryId) {
      try {
        await deleteProfileImageFromCloudinary(user.profileImage.cloudinaryId);
      } catch (deleteError) {
        console.error('Error deleting old profile image:', deleteError);
        // Continue with upload even if deletion fails
      }
    }

    // Format and save new profile image data
    const profileImageData = formatProfileImageData(req.file);
    user.profileImage = profileImageData;

    await user.save();

    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;

    res.status(200).json({
      status: 'success',
      message: 'Profile image uploaded successfully',
      data: { 
        user: userResponse,
        imageUrl: profileImageData.url
      }
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Delete profile image
// @route   DELETE /api/profile/image
// @access  Private (All authenticated users)
const deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!user.profileImage || !user.profileImage.cloudinaryId) {
      return res.status(400).json({
        status: 'error',
        message: 'No profile image to delete'
      });
    }

    // Delete image from Cloudinary
    try {
      await deleteProfileImageFromCloudinary(user.profileImage.cloudinaryId);
    } catch (deleteError) {
      console.error('Error deleting profile image from Cloudinary:', deleteError);
      // Continue with database update even if Cloudinary deletion fails
    }

    // Remove profile image data from user
    user.profileImage = {
      url: null,
      cloudinaryId: null,
      uploadedAt: null
    };

    await user.save();

    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;

    res.status(200).json({
      status: 'success',
      message: 'Profile image deleted successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private (All authenticated users)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'All password fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'New password and confirm password do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get user profile by ID (for PM to view other users)
// @route   GET /api/profile/:id
// @access  Private (PM only)
const getUserProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Get user profile by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Update user profile by ID (for PM to update other users)
// @route   PUT /api/profile/:id
// @access  Private (PM only)
const updateUserProfileById = async (req, res) => {
  try {
    const {
      fullName,
      role,
      status,
      department,
      jobTitle,
      workTitle,
      phone,
      location,
      skills,
      company,
      address
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update basic fields
    if (fullName) user.fullName = fullName.trim();
    if (role) user.role = role;
    if (status) user.status = status;
    if (phone) user.phone = phone.trim();
    if (location) user.location = location.trim();
    if (skills) {
      // Handle skills as array
      if (typeof skills === 'string') {
        user.skills = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      } else if (Array.isArray(skills)) {
        user.skills = skills.filter(skill => skill && skill.trim());
      }
    }

    // Update role-specific fields
    if (role === 'employee' || role === 'pm') {
      if (department) user.department = department.trim();
      if (jobTitle) user.jobTitle = jobTitle.trim();
      if (workTitle) user.workTitle = workTitle.trim();
      // Clear customer fields
      user.company = undefined;
      user.address = undefined;
    }

    if (role === 'customer') {
      if (company) user.company = company.trim();
      if (address) user.address = address.trim();
      // Clear employee fields
      user.department = undefined;
      user.jobTitle = undefined;
      user.workTitle = undefined;
    }

    await user.save();

    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;

    res.status(200).json({
      status: 'success',
      message: 'User profile updated successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Update user profile by ID error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

module.exports = {
  getCurrentProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  changePassword,
  getUserProfileById,
  updateUserProfileById
};
