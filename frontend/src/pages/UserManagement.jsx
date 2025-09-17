import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import { Combobox } from '../components/magicui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/magicui/dialog';
import { Input } from '../components/magicui/input';
import { Button } from '../components/magicui/button';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Shield,
  User,
  Building2,
  CheckCircle,
  AlertCircle,
  Save,
  X
} from 'lucide-react';

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Mock data for users
  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      role: 'employee',
      status: 'active',
      joinDate: '2024-01-15',
      avatar: 'SJ'
    },
    {
      id: 2,
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.chen@example.com',
      role: 'customer',
      status: 'active',
      joinDate: '2024-01-20',
      avatar: 'MC'
    },
    {
      id: 3,
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      role: 'pm',
      status: 'active',
      joinDate: '2024-02-01',
      avatar: 'ED'
    },
    {
      id: 4,
      firstName: 'Alex',
      lastName: 'Thompson',
      email: 'alex.thompson@company.com',
      role: 'employee',
      status: 'inactive',
      joinDate: '2024-02-10',
      avatar: 'AT'
    },
    {
      id: 5,
      firstName: 'Lisa',
      lastName: 'Wilson',
      email: 'lisa.wilson@business.com',
      role: 'customer',
      status: 'active',
      joinDate: '2024-02-15',
      avatar: 'LW'
    }
  ]);

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee',
    status: 'active'
  });

  const [editUserData, setEditUserData] = useState({
    fullName: '',
    email: '',
    role: 'employee',
    status: 'active'
  });

  const roleOptions = [
    { value: 'employee', label: 'Employee', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { value: 'customer', label: 'Customer', icon: Building2, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { value: 'pm', label: 'Project Manager', icon: Shield, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Roles', icon: Users },
    { value: 'employee', label: 'Employees', icon: User },
    { value: 'customer', label: 'Customers', icon: Building2 },
    { value: 'pm', label: 'Project Managers', icon: Shield }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'text-green-600', bgColor: 'bg-green-100' },
    { value: 'inactive', label: 'Inactive', color: 'text-red-600', bgColor: 'bg-red-100' }
  ];

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId, newRole) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const handleAddUser = () => {
    if (newUser.firstName && newUser.lastName && newUser.email) {
      const user = {
        ...newUser,
        id: Date.now(),
        joinDate: new Date().toISOString().split('T')[0],
        avatar: `${newUser.firstName[0]}${newUser.lastName[0]}`
      };
      setUsers(prev => [...prev, user]);
      setNewUser({ firstName: '', lastName: '', email: '', role: 'employee', status: 'active' });
      setIsAddUserOpen(false);
    }
  };

  const handleEditUser = (user) => {
    setEditUserData({
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setEditingUser(user);
  };

  const handleSaveUser = () => {
    if (editUserData.fullName && editUserData.email) {
      const nameParts = editUserData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { 
              ...user, 
              firstName,
              lastName,
              role: editUserData.role,
              status: editUserData.status,
              avatar: `${firstName[0] || ''}${lastName[0] || ''}`
            }
          : user
      ));
      setEditingUser(null);
      setEditUserData({ fullName: '', email: '', role: 'employee', status: 'active' });
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditUserData({ fullName: '', email: '', role: 'employee', status: 'active' });
  };

  const getRoleInfo = (role) => {
    return roleOptions.find(option => option.value === role) || roleOptions[0];
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Header - Enhanced Card Design */}
          <div className="mb-4 md:mb-6">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl md:rounded-lg p-4 md:p-6 border border-teal-100 shadow-sm">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  User Management
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Manage user roles and permissions
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards - Mobile First */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white rounded-xl md:rounded-lg p-3 md:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Total Users</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl md:rounded-lg p-3 md:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Employees</p>
                  <p className="text-lg md:text-2xl font-bold text-blue-600">
                    {users.filter(u => u.role === 'employee').length}
                  </p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl md:rounded-lg p-3 md:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Customers</p>
                  <p className="text-lg md:text-2xl font-bold text-green-600">
                    {users.filter(u => u.role === 'customer').length}
                  </p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl md:rounded-lg p-3 md:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Project Managers</p>
                  <p className="text-lg md:text-2xl font-bold text-purple-600">
                    {users.filter(u => u.role === 'pm').length}
                  </p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter - Mobile First */}
          <div className="bg-white rounded-xl md:rounded-lg p-3 md:p-4 shadow-sm border border-gray-100 mb-4 md:mb-6">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm md:text-base"
                />
              </div>
              <div className="md:w-48">
                <Combobox
                  options={filterOptions}
                  value={roleFilter}
                  onChange={(value) => setRoleFilter(value)}
                  placeholder="All Roles"
                  className="h-10 md:h-12"
                />
              </div>
            </div>
          </div>

          {/* Users List - Mobile First */}
          <div className="bg-white rounded-xl md:rounded-lg shadow-sm border border-gray-100">
            <div className="p-3 md:p-4 border-b border-gray-100">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                Users ({filteredUsers.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const statusInfo = getStatusInfo(user.status);
                const RoleIcon = roleInfo.icon;
                
                return (
                  <div
                    key={user.id}
                    className="p-3 md:p-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                       {/* Mobile Layout - Professional Compact Design */}
                       <div className="md:hidden">
                         <div className="flex items-start space-x-3">
                           {/* Profile Image - Normal Size */}
                           <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                             <span className="text-white font-semibold text-xs">
                               {user.avatar}
                             </span>
                           </div>
                           
                           <div className="flex-1 min-w-0">
                             {/* Top Section: Name and Status */}
                             <div className="flex items-start justify-between mb-2">
                               <div className="flex-1 min-w-0">
                                 <h3 className="text-sm font-semibold text-gray-900 truncate">
                                   {user.firstName} {user.lastName}
                                 </h3>
                                 <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                 <p className="text-xs text-gray-500">Joined: {user.joinDate}</p>
                               </div>
                               {/* Status Tag - Top Right */}
                               <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} ml-2 flex-shrink-0`}>
                                 {statusInfo.label}
                               </div>
                             </div>
                             
                             {/* Bottom Section: Actions Only */}
                             <div className="flex items-center justify-end">
                               {/* Action Buttons - Right Side */}
                               <div className="flex items-center space-x-2">
                                 <button
                                   onClick={() => handleEditUser(user)}
                                   className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                                 >
                                   <Edit className="h-4 w-4" />
                                 </button>
                                 <button
                                   onClick={() => handleDeleteUser(user.id)}
                                   className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                                 >
                                   <Trash2 className="h-4 w-4" />
                                 </button>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Desktop Layout - Professional Compact Design */}
                       <div className="hidden md:block">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-4">
                             {/* Profile Image - Normal Size */}
                             <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                               <span className="text-white font-semibold text-sm">
                                 {user.avatar}
                               </span>
                             </div>
                             
                             {/* User Information */}
                             <div className="flex-1">
                               <div className="flex items-center justify-between">
                                 <div>
                                   <h3 className="text-lg font-semibold text-gray-900">
                                     {user.firstName} {user.lastName}
                                   </h3>
                                   <p className="text-sm text-gray-600">{user.email}</p>
                                   <p className="text-xs text-gray-500">Joined: {user.joinDate}</p>
                                 </div>
                                 {/* Status Tag - Top Right */}
                                 <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} ml-4`}>
                                   {statusInfo.label}
                                 </div>
                               </div>
                             </div>
                           </div>
                           
                           <div className="flex items-center space-x-3">
                             {/* Action Buttons - Compact */}
                             <div className="flex items-center space-x-2">
                               <button
                                 onClick={() => handleEditUser(user)}
                                 className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                               >
                                 <Edit className="h-5 w-5" />
                               </button>
                               <button
                                 onClick={() => handleDeleteUser(user.id)}
                                 className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                               >
                                 <Trash2 className="h-5 w-5" />
                               </button>
                             </div>
                           </div>
                         </div>
                       </div>
                    </div>
                  );
                })}
            </div>
           </div>
         </div>
       </main>

       {/* Edit User Dialog */}
       <Dialog open={!!editingUser} onOpenChange={handleCancelEdit}>
         <DialogContent className="max-w-md mx-auto">
           <DialogHeader>
             <DialogTitle className="text-xl font-bold text-gray-900">
               Edit User
             </DialogTitle>
           </DialogHeader>
           
           <div className="space-y-4">
             {/* User Info */}
             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
               <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                 <span className="text-white font-semibold text-sm">
                   {editUserData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                 </span>
               </div>
               <div>
                 <p className="font-semibold text-gray-900">
                   {editUserData.fullName}
                 </p>
                 <p className="text-sm text-gray-600">{editUserData.email}</p>
               </div>
             </div>

             {/* Form Fields */}
             <div className="space-y-4">
               {/* Full Name */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Full Name
                 </label>
                 <Input
                     value={editUserData.fullName}
                     onChange={(e) => setEditUserData(prev => ({ ...prev, fullName: e.target.value }))}
                     placeholder="Full name"
                     className="h-10"
                   />
               </div>

               {/* Email - Non-editable */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Email
                 </label>
                 <Input
                   type="email"
                   value={editUserData.email}
                   disabled
                   className="h-10 bg-gray-100 text-gray-500 cursor-not-allowed"
                 />
                 <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
               </div>

               {/* Role */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Role
                 </label>
                 <Combobox
                   options={roleOptions.map(option => ({
                     value: option.value,
                     label: option.label,
                     icon: option.icon
                   }))}
                   value={editUserData.role}
                   onChange={(value) => setEditUserData(prev => ({ ...prev, role: value }))}
                   placeholder="Select Role"
                   className="h-10"
                 />
               </div>

               {/* Status */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Status
                 </label>
                 <Combobox
                   options={statusOptions.map(option => ({
                     value: option.value,
                     label: option.label
                   }))}
                   value={editUserData.status}
                   onChange={(value) => setEditUserData(prev => ({ ...prev, status: value }))}
                   placeholder="Select Status"
                   className="h-10"
                 />
               </div>
             </div>

             {/* Action Buttons */}
             <div className="flex items-center justify-between pt-6 border-t border-gray-200">
               <Button
                 variant="outline"
                 onClick={handleCancelEdit}
                 className="flex items-center space-x-2 px-6"
               >
                 <X className="h-4 w-4" />
                 <span>Cancel</span>
               </Button>
               <Button
                 onClick={handleSaveUser}
                 className="flex items-center space-x-2 px-6 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
               >
                 <Save className="h-4 w-4" />
                 <span>Save Changes</span>
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default UserManagement;
