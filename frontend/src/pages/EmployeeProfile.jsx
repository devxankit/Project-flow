import React, { useState } from 'react';
import EmployeeNavbar from '../components/Employee-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { User, Mail, Lock, Camera, Edit3, Save, X, Eye, EyeOff, Building, MapPin, Calendar, Award } from 'lucide-react';

const EmployeeProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Scroll to top when component mounts
  useScrollToTop();
  
  const [profileData, setProfileData] = useState({
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'Frontend Developer',
    department: 'Engineering',
    joinDate: '2024-01-15',
    avatar: 'MJ'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  const handleSaveProfile = () => {
    // Handle profile save logic here
    setIsEditing(false);
    console.log('Profile saved:', profileData);
  };

  const handleChangePassword = () => {
    // Handle password change logic here
    console.log('Password changed');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <EmployeeNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-4xl md:mx-auto md:px-6 lg:px-8">

          <div className="space-y-6">
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
                    <div className="w-16 h-16 md:w-18 md:h-18 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
                      <span className="text-lg md:text-xl font-bold text-primary">
                        {profileData.avatar}
                      </span>
                    </div>
                    {isEditing && (
                      <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors duration-200 shadow-lg">
                        <Camera className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{profileData.name}</h3>
                    <p className="text-xs text-gray-500">{profileData.role}</p>
                    {isEditing && (
                      <button className="text-xs text-primary font-medium hover:text-primary-dark transition-colors duration-200 mt-1">
                        Change Photo
                      </button>
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
                        value={profileData.name}
                        onChange={(e) => handleProfileUpdate('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-medium"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{profileData.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Email Field - Read Only */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">{profileData.email}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed</p>
                  </div>

                  {/* Role Field - Read Only */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{profileData.role}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Role assigned by admin</p>
                  </div>

                  {/* Department Field - Read Only */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{profileData.department}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Department assigned by admin</p>
                  </div>

                  {/* Join Date Field - Read Only */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Join Date</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        Joined {new Date(profileData.joinDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Start date</p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl mx-auto"
                  >
                    <Save className="h-4 w-4" />
                    <span className="text-sm font-medium">Save Changes</span>
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
                     className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl"
                   >
                     <Lock className="h-4 w-4" />
                     <span className="text-sm font-medium">Change Password</span>
                   </button>
                 </div>
               </div>
             </div>

             {/* Account Information Card */}
             <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
               <div className="flex items-center space-x-3 mb-4">
                 <div className="p-2 bg-blue-100 rounded-lg">
                   <User className="h-4 w-4 text-blue-600" />
                 </div>
                 <h2 className="text-lg font-bold text-gray-900">Account Information</h2>
               </div>

               <div className="space-y-3">
                 <div className="flex items-center justify-between py-2 border-b border-gray-100">
                   <span className="text-xs font-medium text-gray-600">Account Type</span>
                   <span className="text-xs font-semibold text-gray-900">Employee</span>
                 </div>
                 <div className="flex items-center justify-between py-2 border-b border-gray-100">
                   <span className="text-xs font-medium text-gray-600">Role</span>
                   <span className="text-xs font-semibold text-gray-900">{profileData.role}</span>
                 </div>
                 <div className="flex items-center justify-between py-2 border-b border-gray-100">
                   <span className="text-xs font-medium text-gray-600">Department</span>
                   <span className="text-xs font-semibold text-gray-900">{profileData.department}</span>
                 </div>
                 <div className="flex items-center justify-between py-2 border-b border-gray-100">
                   <span className="text-xs font-medium text-gray-600">Member Since</span>
                   <span className="text-xs font-semibold text-gray-900">
                     {new Date(profileData.joinDate).toLocaleDateString('en-US', { 
                       year: 'numeric', 
                       month: 'long' 
                     })}
                   </span>
                 </div>
                 <div className="flex items-center justify-between py-2 border-b border-gray-100">
                   <span className="text-xs font-medium text-gray-600">Last Login</span>
                   <span className="text-xs font-semibold text-gray-900">Today, 2:30 PM</span>
                 </div>
                 <div className="flex items-center justify-between py-2">
                   <span className="text-xs font-medium text-gray-600">Status</span>
                   <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                     Active
                   </span>
                 </div>
               </div>
             </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfile;
