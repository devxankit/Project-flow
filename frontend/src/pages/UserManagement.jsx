import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import { useToast } from '../contexts/ToastContext';
import { Combobox } from '../components/magicui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/magicui/dialog';
import { Input } from '../components/magicui/input';
import { Button } from '../components/magicui/button';
import useScrollToTop from '../hooks/useScrollToTop';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  Eye,
  EyeOff,
  Copy,
  Download,
  Key,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  FileText
} from 'lucide-react';

const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showCredentials, setShowCredentials] = useState({});

  // Scroll to top when component mounts
  useScrollToTop();

  // Mock data for users with credentials
  const [users, setUsers] = useState([
    {
      id: 1,
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      password: 'TempPass123!',
      role: 'employee',
      status: 'active',
      joinDate: '2024-01-15',
      avatar: 'SJ',
      department: 'Engineering',
      jobTitle: 'Frontend Developer',
      createdBy: 'John Doe',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      fullName: 'Mike Chen',
      email: 'mike.chen@example.com',
      password: 'TempPass456!',
      role: 'customer',
      status: 'active',
      joinDate: '2024-01-20',
      avatar: 'MC',
      company: 'Acme Corporation',
      address: '123 Business St, Suite 100, New York, NY 10001',
      createdBy: 'John Doe',
      createdAt: '2024-01-20T14:15:00Z'
    },
    {
      id: 3,
      fullName: 'Emily Davis',
      email: 'emily.davis@example.com',
      password: 'TempPass789!',
      role: 'pm',
      status: 'active',
      joinDate: '2024-02-01',
      avatar: 'ED',
      department: 'Management',
      jobTitle: 'Senior Project Manager',
      createdBy: 'John Doe',
      createdAt: '2024-02-01T09:45:00Z'
    },
    {
      id: 4,
      fullName: 'Alex Thompson',
      email: 'alex.thompson@company.com',
      password: 'TempPass101!',
      role: 'employee',
      status: 'inactive',
      joinDate: '2024-02-10',
      avatar: 'AT',
      department: 'Design',
      jobTitle: 'UI/UX Designer',
      createdBy: 'John Doe',
      createdAt: '2024-02-10T16:20:00Z'
    },
    {
      id: 5,
      fullName: 'Lisa Wilson',
      email: 'lisa.wilson@business.com',
      password: 'TempPass202!',
      role: 'customer',
      status: 'active',
      joinDate: '2024-02-15',
      avatar: 'LW',
      company: 'Tech Solutions Inc',
      address: '456 Innovation Ave, San Francisco, CA 94105',
      createdBy: 'John Doe',
      createdAt: '2024-02-15T11:30:00Z'
    }
  ]);

  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'employee',
    status: 'active',
    department: '',
    jobTitle: '',
    company: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editUserData, setEditUserData] = useState({
    fullName: '',
    email: '',
    role: 'employee',
    status: 'active',
    department: '',
    jobTitle: '',
    company: '',
    address: ''
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

  const tabs = [
    { id: 'all', label: 'All Users', count: users.length },
    { id: 'employee', label: 'Employees', count: users.filter(u => u.role === 'employee').length },
    { id: 'customer', label: 'Customers', count: users.filter(u => u.role === 'customer').length },
    { id: 'pm', label: 'Project Managers', count: users.filter(u => u.role === 'pm').length }
  ];

  // Filter users based on search, role, and tab
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesTab = activeTab === 'all' || user.role === activeTab;
    return matchesSearch && matchesRole && matchesTab;
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(
      'Copied to Clipboard!',
      'The text has been copied to your clipboard.'
    );
  };

  const exportCredentials = () => {
    const credentials = users.map(user => ({
      'Full Name': user.fullName,
      'Email': user.email,
      'Password': user.password,
      'Role': user.role,
      'Status': user.status,
      'Created Date': new Date(user.createdAt).toLocaleDateString(),
      'Created By': user.createdBy
    }));

    const csvContent = [
      Object.keys(credentials[0]).join(','),
      ...credentials.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-credentials.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(
      'Export Successful!',
      'User credentials have been exported to CSV file.'
    );
  };

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
    const userToDelete = users.find(user => user.id === userId);
    if (window.confirm(`Are you sure you want to delete ${userToDelete?.fullName}?`)) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success(
        'User Deleted Successfully!',
        `${userToDelete?.fullName} has been removed from the system.`
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newUser.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!newUser.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!newUser.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Role-specific validation
    if (newUser.role === 'employee' || newUser.role === 'pm') {
      if (!newUser.department.trim()) {
        newErrors.department = 'Department is required';
      }
      if (!newUser.jobTitle.trim()) {
        newErrors.jobTitle = 'Job title is required';
      }
    }

    if (newUser.role === 'customer') {
      if (!newUser.company.trim()) {
        newErrors.company = 'Company is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const nameParts = newUser.fullName.trim().split(' ');
        const avatar = nameParts.length >= 2 
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : nameParts[0][0].toUpperCase();
        
        const user = {
          ...newUser,
          id: Date.now(),
          joinDate: new Date().toISOString().split('T')[0],
          avatar,
          createdBy: 'John Doe', // Current PM
          createdAt: new Date().toISOString()
        };
        
        setUsers(prev => [...prev, user]);
        
        toast.success(
          'User Created Successfully!',
          `${user.fullName} has been added to the system.`
        );
        
        handleCloseAddUser();
      } catch (error) {
        console.error('Error creating user:', error);
        toast.error(
          'User Creation Failed',
          'There was an error creating the user. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error(
        'Validation Error',
        'Please fix the errors in the form before submitting.'
      );
    }
  };

  const handleCloseAddUser = () => {
    setNewUser({ 
      fullName: '', 
      email: '', 
      password: '',
      role: 'employee', 
      status: 'active',
      department: '',
      jobTitle: '',
      company: '',
      address: ''
    });
    setErrors({});
    setIsSubmitting(false);
    setIsAddUserOpen(false);
  };

  const handleEditUser = (user) => {
    setEditUserData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department || '',
      jobTitle: user.jobTitle || '',
      company: user.company || '',
      address: user.address || ''
    });
    setEditingUser(user);
  };

  const handleSaveUser = () => {
    if (editUserData.fullName && editUserData.email) {
      const nameParts = editUserData.fullName.trim().split(' ');
      const avatar = nameParts.length >= 2 
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : nameParts[0][0].toUpperCase();
      
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { 
              ...user, 
              fullName: editUserData.fullName,
              role: editUserData.role,
              status: editUserData.status,
              avatar,
              department: editUserData.department,
              jobTitle: editUserData.jobTitle,
              company: editUserData.company,
              address: editUserData.address
            }
          : user
      ));
      
      toast.success(
        'User Updated Successfully!',
        `${editUserData.fullName}'s information has been updated.`
      );
      
      setEditingUser(null);
      setEditUserData({ 
        fullName: '', 
        email: '', 
        role: 'employee', 
        status: 'active',
        department: '',
        jobTitle: '',
        company: '',
        address: ''
      });
    } else {
      toast.error(
        'Validation Error',
        'Please fill in all required fields.'
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditUserData({ 
      fullName: '', 
      email: '', 
      role: 'employee', 
      status: 'active',
      department: '',
      jobTitle: '',
      company: '',
      address: ''
    });
  };

  const getRoleInfo = (role) => {
    return roleOptions.find(option => option.value === role) || roleOptions[0];
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const renderRoleSpecificFields = (userData, isEdit = false) => {
    const data = isEdit ? editUserData : newUser;
    const setData = isEdit ? setEditUserData : setNewUser;

    if (data.role === 'employee' || data.role === 'pm') {
      return (
        <>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Department <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g., Engineering, Design, Marketing"
              value={data.department}
              onChange={(e) => setData(prev => ({ ...prev, department: e.target.value }))}
              className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                errors.department 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-primary focus:ring-primary/20'
              }`}
            />
            <AnimatePresence>
              {errors.department && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.department}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Job Title <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g., Frontend Developer, UI Designer"
              value={data.jobTitle}
              onChange={(e) => setData(prev => ({ ...prev, jobTitle: e.target.value }))}
              className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                errors.jobTitle 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-primary focus:ring-primary/20'
              }`}
            />
            <AnimatePresence>
              {errors.jobTitle && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.jobTitle}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </>
      );
    }

    if (data.role === 'customer') {
      return (
        <>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Company <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="text"
              placeholder="Company name"
              value={data.company}
              onChange={(e) => setData(prev => ({ ...prev, company: e.target.value }))}
              className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                errors.company 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-primary focus:ring-primary/20'
              }`}
            />
            <AnimatePresence>
              {errors.company && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.company}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Address</label>
            <Input
              type="text"
              placeholder="Company address (optional)"
              value={data.address}
              onChange={(e) => setData(prev => ({ ...prev, address: e.target.value }))}
              className="h-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
            />
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl md:rounded-lg p-4 md:p-6 border border-teal-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  User Management
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                    Create and manage user accounts with role-based access
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={exportCredentials}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Credentials</span>
                  </Button>
                  <Button
                    onClick={() => setIsAddUserOpen(true)}
                    className="flex items-center space-x-2 bg-primary text-white hover:bg-primary-dark"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add New User</span>
                  </Button>
                </div>
                </div>
              </div>
            </div>

          {/* Filter Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {/* Total Users Card */}
            <button
              onClick={() => setActiveTab('all')}
              className={`p-3 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg border ${
                activeTab === 'all'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">All Users</p>
                  <p className="text-lg font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="h-5 w-5 text-primary" />
              </div>
            </button>

            {/* Role Filter Cards */}
            {roleOptions.map((role) => {
              const count = users.filter(user => user.role === role.value).length;
              const activeCount = users.filter(user => user.role === role.value && user.status === 'active').length;
              return (
                <button
                  key={role.value}
                  onClick={() => setActiveTab(role.value)}
                  className={`${role.bgColor} ${role.borderColor} border rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 ${
                    activeTab === role.value ? 'ring-2 ring-primary ring-opacity-50' : ''
                  }`}
                >
              <div className="flex items-center justify-between">
                <div>
                      <p className={`text-xs font-medium ${role.color}`}>{role.label}</p>
                      <p className="text-lg font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-600">{activeCount} active</p>
                </div>
                    <role.icon className={`h-5 w-5 ${role.color}`} />
                </div>
                </button>
              );
            })}
          </div>


          {/* Search and Filter */}
          <div className="mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                  type="text"
                    placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                />
                </div>
              </div>
              <div className="md:w-48">
                <Combobox
                  options={filterOptions.map(option => ({
                    value: option.value,
                    label: option.label,
                    icon: option.icon
                  }))}
                  value={roleFilter}
                  onChange={setRoleFilter}
                  placeholder="Filter by role"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Users Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const statusInfo = getStatusInfo(user.status);
                return (
                <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                  {/* User Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                               {user.avatar}
                             </span>
                           </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {user.fullName}
                                 </h3>
                        <p className="text-xs text-gray-500">
                          {user.email}
                        </p>
                               </div>
                             </div>
                    <div className="flex items-center space-x-1">
                                 <button
                                   onClick={() => handleEditUser(user)}
                        className="p-1 text-gray-400 hover:text-primary transition-colors"
                                 >
                                   <Edit className="h-4 w-4" />
                                 </button>
                                 <button
                                   onClick={() => handleDeleteUser(user.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                 >
                                   <Trash2 className="h-4 w-4" />
                                 </button>
                         </div>
                       </div>

                  {/* Role & Details */}
                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <roleInfo.icon className={`h-4 w-4 ${roleInfo.color}`} />
                      <span className={`text-sm font-medium ${roleInfo.color}`}>
                        {roleInfo.label}
                               </span>
                             </div>
                    <div className="text-xs text-gray-500">
                      {user.role === 'employee' || user.role === 'pm' ? (
                        <>
                          {user.department && <div>{user.department}</div>}
                          {user.jobTitle && <div>{user.jobTitle}</div>}
                        </>
                      ) : (
                        <>
                          {user.company && <div>{user.company}</div>}
                          {user.address && <div className="truncate">{user.address}</div>}
                        </>
                      )}
                             </div>
                           </div>
                           
                  {/* Credentials */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Password:</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-mono text-gray-900">
                          {showCredentials[user.id] ? user.password : '••••••••••••'}
                        </span>
                               <button
                          onClick={() => setShowCredentials(prev => ({
                            ...prev,
                            [user.id]: !prev[user.id]
                          }))}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showCredentials[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                               </button>
                               <button
                          onClick={() => copyToClipboard(user.password)}
                          className="text-gray-400 hover:text-gray-600"
                               >
                          <Copy className="h-3 w-3" />
                               </button>
                             </div>
                    </div>
                  </div>

                  {/* Status & Created */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        by {user.createdBy}
                           </div>
                         </div>
                       </div>
                    </div>
                  );
                })}
            </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || roleFilter !== 'all' || activeTab !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating a new user.'}
              </p>
           </div>
          )}
         </div>
       </main>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={handleCloseAddUser}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0" onClose={handleCloseAddUser}>
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
                <UserPlus className="h-6 w-6" />
                <span>Create New User</span>
             </DialogTitle>
              <DialogDescription className="text-primary-foreground/80">
                Fill in the user details below. Fields marked with * are required.
              </DialogDescription>
           </DialogHeader>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }} className="p-6 space-y-6">
            {/* Basic Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <span>Basic Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    Full Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter full name"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                    className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                      errors.fullName 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                  <AnimatePresence>
                    {errors.fullName && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-500 flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.fullName}
                      </motion.p>
                    )}
                  </AnimatePresence>
               </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    Email Address <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                      errors.email 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-500 flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
               </div>
             </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    Password <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Generate or enter password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      className={`h-12 rounded-xl border-2 transition-all duration-200 flex-1 ${
                        errors.password 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                      }`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewUser(prev => ({ ...prev, password: generatePassword() }))}
                      className="h-12 px-4 rounded-xl border-2 hover:bg-gray-50"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-500 flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    Role <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Combobox
                    options={roleOptions.map(option => ({
                      value: option.value,
                      label: option.label,
                      icon: option.icon
                    }))}
                    value={newUser.role}
                    onChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                    placeholder="Select Role"
                    className="h-12 rounded-xl border-2"
                  />
                </div>
              </div>
            </motion.div>

            {/* Role-Specific Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span>Role-Specific Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderRoleSpecificFields(newUser, false)}
              </div>
            </motion.div>

            {/* Status */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Account Status</span>
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <Combobox
                  options={statusOptions.map(option => ({
                    value: option.value,
                    label: option.label
                  }))}
                  value={newUser.status}
                  onChange={(value) => setNewUser(prev => ({ ...prev, status: value }))}
                  placeholder="Select Status"
                  className="h-12 rounded-xl border-2"
                />
              </div>
            </motion.div>

            {/* Auto-populated fields info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200"
            >
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Auto-populated Fields
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Created By: Current PM</p>
                <p>• Created On: {new Date().toLocaleDateString()}</p>
                <p>• Avatar: Generated from initials</p>
              </div>
            </motion.div>

            {/* Footer Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 pt-4"
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseAddUser}
                className="w-full sm:w-auto h-12 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-12 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Create User</span>
                  </div>
                )}
              </Button>
            </motion.div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0" onClose={() => setEditingUser(null)}>
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
                <Edit className="h-6 w-6" />
                <span>Edit User</span>
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/80">
                Update user information below. Email cannot be changed.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }} className="p-6 space-y-6">
            {/* Basic Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <span>Basic Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    Full Name <span className="text-red-500 ml-1">*</span>
                 </label>
                 <Input
                    type="text"
                    placeholder="Enter full name"
                     value={editUserData.fullName}
                     onChange={(e) => setEditUserData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                   />
               </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Email Address</label>
                 <Input
                   type="email"
                   value={editUserData.email}
                   disabled
                    className="h-12 rounded-xl border-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                 />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    Role <span className="text-red-500 ml-1">*</span>
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
                    className="h-12 rounded-xl border-2"
                 />
               </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                 <Combobox
                   options={statusOptions.map(option => ({
                     value: option.value,
                     label: option.label
                   }))}
                   value={editUserData.status}
                   onChange={(value) => setEditUserData(prev => ({ ...prev, status: value }))}
                   placeholder="Select Status"
                    className="h-12 rounded-xl border-2"
                 />
               </div>
             </div>
            </motion.div>

            {/* Role-Specific Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span>Role-Specific Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderRoleSpecificFields(editUserData, true)}
              </div>
            </motion.div>

            {/* Footer Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 pt-4"
            >
               <Button
                type="button"
                 variant="outline"
                 onClick={handleCancelEdit}
                className="w-full sm:w-auto h-12 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
               >
                Cancel
               </Button>
               <Button
                type="submit"
                className="w-full sm:w-auto h-12 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
               >
                <div className="flex items-center space-x-2">
                 <Save className="h-4 w-4" />
                 <span>Save Changes</span>
                </div>
               </Button>
            </motion.div>
          </form>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default UserManagement;