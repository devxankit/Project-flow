import React, { useState } from 'react';
import PMNavbar from '../components/PM-Navbar';
import { User, Mail, Lock, Camera, Edit3, Save, X, Eye, EyeOff } from 'lucide-react';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@company.com',
    avatar: 'JD'
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
      <PMNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-4xl md:mx-auto md:px-6 lg:px-8">

          <div className="space-y-6">
            {/* Profile Information Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
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

              {/* Centered Profile Layout */}
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Profile Picture Section */}
                <div className="relative">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
                    <span className="text-2xl md:text-3xl font-bold text-primary">
                      {profileData.avatar}
                    </span>
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors duration-200 shadow-lg">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Profile Details */}
                <div className="space-y-4 w-full max-w-sm">
                  {/* Name Field */}
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleProfileUpdate('name', e.target.value)}
                        className="w-full px-4 py-3 text-center border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg font-medium"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-lg font-medium text-gray-900">{profileData.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileUpdate('email', e.target.value)}
                        className="w-full px-4 py-3 text-center border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        placeholder="Enter your email address"
                      />
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span className="text-lg font-medium text-gray-900">{profileData.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Change Photo Button */}
                {isEditing && (
                  <button className="text-sm text-primary font-medium hover:text-primary-dark transition-colors duration-200">
                    Change Photo
                  </button>
                )}
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl mx-auto"
                  >
                    <Save className="h-4 w-4" />
                    <span className="font-medium">Save Changes</span>
                  </button>
                </div>
              )}
            </div>

             {/* Change Password Card */}
             <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
               <div className="flex items-center space-x-3 mb-6">
                 <div className="p-2 bg-primary/10 rounded-lg">
                   <Lock className="h-5 w-5 text-primary" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
               </div>

               <div className="space-y-6">
                 {/* Current Password */}
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">
                     Current Password
                   </label>
                   <div className="relative">
                     <input
                       type={showCurrentPassword ? 'text' : 'password'}
                       value={passwordData.currentPassword}
                       onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                       className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                       placeholder="Enter your current password"
                     />
                     <button
                       type="button"
                       onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                     >
                       {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                     </button>
                   </div>
                 </div>

                 {/* New Password */}
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">
                     New Password
                   </label>
                   <div className="relative">
                     <input
                       type={showNewPassword ? 'text' : 'password'}
                       value={passwordData.newPassword}
                       onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                       className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                       placeholder="Enter your new password"
                     />
                     <button
                       type="button"
                       onClick={() => setShowNewPassword(!showNewPassword)}
                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                     >
                       {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                     </button>
                   </div>
                 </div>

                 {/* Confirm Password */}
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">
                     Confirm New Password
                   </label>
                   <div className="relative">
                     <input
                       type={showConfirmPassword ? 'text' : 'password'}
                       value={passwordData.confirmPassword}
                       onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                       className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                       placeholder="Confirm your new password"
                     />
                     <button
                       type="button"
                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                     >
                       {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                     </button>
                   </div>
                 </div>

                 {/* Change Password Button */}
                 <div className="pt-4">
                   <button
                     onClick={handleChangePassword}
                     className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl"
                   >
                     <Lock className="h-4 w-4" />
                     <span className="font-medium">Change Password</span>
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

export default ProfilePage;
