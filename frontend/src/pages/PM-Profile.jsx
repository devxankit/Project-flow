import React, { useState, useEffect } from 'react';
import PMNavbar from '../components/PM-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { User, Mail, Lock, Camera, Edit3, Save, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const PMProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  // Scroll to top when component mounts
  useScrollToTop();
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    avatar: '',
    profileImage: null,
    department: '',
    jobTitle: '',
    workTitle: '',
    phone: '',
    location: '',
    skills: []
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/profile');
        
        if (response.data.status === 'success') {
          const userData = response.data.data.user;
          
          setProfileData({
            fullName: userData.fullName || '',
            email: userData.email || '',
            avatar: userData.avatar || '',
            profileImage: userData.profileImage || null,
            department: userData.department || '',
            jobTitle: userData.jobTitle || '',
            workTitle: userData.workTitle || '',
            phone: userData.phone || '',
            location: userData.location || '',
            skills: userData.skills || []
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updateData = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        location: profileData.location,
        skills: profileData.skills
      };

      const response = await api.put('/profile', updateData);
      if (response.data.status === 'success') {
        toast.success('Success', 'Profile updated successfully');
        setIsEditing(false);
        // Update auth context with new data
        updateUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
        toast.error('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setSaving(true);
      const response = await api.put('/profile/password', passwordData);
      if (response.data.status === 'success') {
        toast.success('Success', 'Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Error', 'Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Error', 'Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profileImage', file);

      // Custom API call for image upload to avoid automatic redirect on 401
      const response = await api.post('/profile/image', formData);

      const responseData = await response.json();
      const apiResponse = {
        data: responseData,
        status: response.status,
        statusText: response.statusText
      };

      if (apiResponse.data.status === 'success') {
        setProfileData(prev => ({
          ...prev,
          profileImage: apiResponse.data.data.user.profileImage
        }));
        updateUser(apiResponse.data.data.user);
        toast.success('Success', 'Profile image uploaded successfully');
      } else {
        toast.error('Error', apiResponse.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image';
      toast.error('Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      setUploading(true);
      const response = await api.delete('/profile/image');
      if (response.data.status === 'success') {
        setProfileData(prev => ({
          ...prev,
          profileImage: null
        }));
        updateUser(response.data.data.user);
        toast.success('Success', 'Profile image deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete image';
      toast.error('Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <PMNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-4xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading profile...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-4xl md:mx-auto md:px-6 lg:px-8">

          <div className="space-y-4">
            {/* Profile Information Card */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isEditing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  {isEditing ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Edit3 className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Left-aligned Profile Layout */}
              <div className="flex flex-col space-y-4">
                {/* Profile Picture Section */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {profileData.profileImage && profileData.profileImage.url ? (
                      <div className="w-16 h-16 md:w-18 md:h-18 rounded-full overflow-hidden">
                        <img 
                          src={profileData.profileImage.url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 md:w-18 md:h-18 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
                        <span className="text-lg md:text-xl font-bold text-primary">
                          {profileData.avatar}
                        </span>
                      </div>
                    )}
                    {isEditing && (
                      <div className="absolute -bottom-1 -right-1 flex space-x-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="profile-image-upload"
                          disabled={uploading}
                        />
                        <label
                          htmlFor="profile-image-upload"
                          className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors duration-200 shadow-lg cursor-pointer"
                        >
                          {uploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Camera className="h-3 w-3" />
                          )}
                        </label>
                        {profileData.profileImage && profileData.profileImage.url && (
                          <button
                            onClick={handleDeleteImage}
                            disabled={uploading}
                            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{profileData.fullName}</h3>
                    <p className="text-xs text-gray-500">Project Manager</p>
                    {isEditing && (
                      <div className="flex space-x-2 mt-1">
                        <label
                          htmlFor="profile-image-upload"
                          className="text-xs text-primary font-medium hover:text-primary-dark transition-colors duration-200 cursor-pointer"
                        >
                          {uploading ? 'Uploading...' : 'Change Photo'}
                        </label>
                        {profileData.profileImage && profileData.profileImage.url && (
                          <button
                            onClick={handleDeleteImage}
                            disabled={uploading}
                            className="text-xs text-red-500 font-medium hover:text-red-600 transition-colors duration-200"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="space-y-3">
                  {/* Name Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => handleProfileUpdate('fullName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-medium"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{profileData.fullName}</span>
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileUpdate('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm"
                        placeholder="Enter your email address"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{profileData.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </span>
                  </button>
                </div>
              )}
            </div>

             {/* Change Password Card */}
             <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
               <div className="flex items-center space-x-3 mb-4">
                 <div className="p-2 bg-primary/10 rounded-lg">
                   <Lock className="h-4 w-4 text-primary" />
                 </div>
                 <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
               </div>

               <div className="space-y-4">
                 {/* Current Password */}
                 <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1">
                     Current Password
                   </label>
                   <div className="relative">
                     <input
                       type={showCurrentPassword ? 'text' : 'password'}
                       value={passwordData.currentPassword}
                       onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                       className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm"
                       placeholder="Enter your current password"
                     />
                     <button
                       type="button"
                       onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                       className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                     >
                       {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </button>
                   </div>
                 </div>

                 {/* New Password */}
                 <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1">
                     New Password
                   </label>
                   <div className="relative">
                     <input
                       type={showNewPassword ? 'text' : 'password'}
                       value={passwordData.newPassword}
                       onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                       className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm"
                       placeholder="Enter your new password"
                     />
                     <button
                       type="button"
                       onClick={() => setShowNewPassword(!showNewPassword)}
                       className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                     >
                       {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </button>
                   </div>
                 </div>

                 {/* Confirm Password */}
                 <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1">
                     Confirm New Password
                   </label>
                   <div className="relative">
                     <input
                       type={showConfirmPassword ? 'text' : 'password'}
                       value={passwordData.confirmPassword}
                       onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                       className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm"
                       placeholder="Confirm your new password"
                     />
                     <button
                       type="button"
                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                       className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                     >
                       {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </button>
                   </div>
                 </div>

                 {/* Change Password Button */}
                 <div className="pt-2">
                   <button
                     onClick={handleChangePassword}
                     disabled={saving}
                     className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {saving ? (
                       <Loader2 className="h-4 w-4 animate-spin" />
                     ) : (
                       <Lock className="h-4 w-4" />
                     )}
                     <span className="text-sm font-medium">
                       {saving ? 'Changing...' : 'Change Password'}
                     </span>
                   </button>
                 </div>
               </div>
             </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default PMProfile;
