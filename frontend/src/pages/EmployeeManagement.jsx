import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import { Combobox } from '../components/magicui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/magicui/dialog';
import { Input } from '../components/magicui/input';
import { Button } from '../components/magicui/button';
import useScrollToTop from '../hooks/useScrollToTop';
import { 
  Users, 
  Search, 
  Code, 
  Palette, 
  Database, 
  Smartphone, 
  Shield, 
  BarChart3,
  Mail,
  Phone,
  Calendar,
  User,
  Building2,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [workTitleFilter, setWorkTitleFilter] = useState('all');
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Scroll to top when component mounts
  useScrollToTop();

  // Mock data for employees
  const [employees] = useState([
    {
      id: 1,
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      workTitle: 'web-developer',
      department: 'Engineering',
      location: 'New York, NY',
      joinDate: '2024-01-15',
      avatar: 'SJ',
      status: 'active',
      skills: ['React', 'Node.js', 'TypeScript'],
      projects: 5
    },
    {
      id: 2,
      fullName: 'Mike Chen',
      email: 'mike.chen@company.com',
      phone: '+1 (555) 234-5678',
      workTitle: 'ui-designer',
      department: 'Design',
      location: 'San Francisco, CA',
      joinDate: '2024-01-20',
      avatar: 'MC',
      status: 'active',
      skills: ['Figma', 'Adobe XD', 'Sketch'],
      projects: 3
    },
    {
      id: 3,
      fullName: 'Emily Davis',
      email: 'emily.davis@company.com',
      phone: '+1 (555) 345-6789',
      workTitle: 'backend-developer',
      department: 'Engineering',
      location: 'Austin, TX',
      joinDate: '2024-02-01',
      avatar: 'ED',
      status: 'active',
      skills: ['Python', 'Django', 'PostgreSQL'],
      projects: 7
    },
    {
      id: 4,
      fullName: 'Alex Thompson',
      email: 'alex.thompson@company.com',
      phone: '+1 (555) 456-7890',
      workTitle: 'mobile-developer',
      department: 'Engineering',
      location: 'Seattle, WA',
      joinDate: '2024-02-10',
      avatar: 'AT',
      status: 'active',
      skills: ['React Native', 'Flutter', 'Swift'],
      projects: 4
    },
    {
      id: 5,
      fullName: 'Lisa Wilson',
      email: 'lisa.wilson@company.com',
      phone: '+1 (555) 567-8901',
      workTitle: 'ux-designer',
      department: 'Design',
      location: 'Chicago, IL',
      joinDate: '2024-02-15',
      avatar: 'LW',
      status: 'active',
      skills: ['User Research', 'Prototyping', 'Figma'],
      projects: 6
    },
    {
      id: 6,
      fullName: 'David Rodriguez',
      email: 'david.rodriguez@company.com',
      phone: '+1 (555) 678-9012',
      workTitle: 'devops-engineer',
      department: 'Engineering',
      location: 'Denver, CO',
      joinDate: '2024-03-01',
      avatar: 'DR',
      status: 'active',
      skills: ['AWS', 'Docker', 'Kubernetes'],
      projects: 8
    }
  ]);

  const workTitleOptions = [
    { value: 'all', label: 'All Roles', icon: Users },
    { value: 'web-developer', label: 'Web Developer', icon: Code },
    { value: 'ui-designer', label: 'UI Designer', icon: Palette },
    { value: 'backend-developer', label: 'Backend Developer', icon: Database },
    { value: 'mobile-developer', label: 'Mobile Developer', icon: Smartphone },
    { value: 'ux-designer', label: 'UX Designer', icon: Palette },
    { value: 'devops-engineer', label: 'DevOps Engineer', icon: Shield }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const departmentOptions = [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'HR', label: 'Human Resources' }
  ];

  const [editEmployeeData, setEditEmployeeData] = useState({
    fullName: '',
    email: '',
    workTitle: 'web-developer',
    department: '',
    status: 'active'
  });

  const getWorkTitleInfo = (workTitle) => {
    return workTitleOptions.find(option => option.value === workTitle) || workTitleOptions[0];
  };

  const handleEditEmployee = (employee) => {
    setEditEmployeeData({
      fullName: employee.fullName,
      email: employee.email,
      workTitle: employee.workTitle,
      department: employee.department,
      status: employee.status
    });
    setEditingEmployee(employee);
  };

  const handleSaveEmployee = () => {
    if (editEmployeeData.fullName && editEmployeeData.email) {
      const nameParts = editEmployeeData.fullName.trim().split(' ');
      const avatar = nameParts.length >= 2 
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : nameParts[0][0].toUpperCase();
      
      // In a real app, this would update the employee data via API
      console.log('Employee updated:', {
        ...editingEmployee,
        fullName: editEmployeeData.fullName,
        email: editEmployeeData.email,
        workTitle: editEmployeeData.workTitle,
        department: editEmployeeData.department,
        status: editEmployeeData.status,
        avatar
      });
      
      setEditingEmployee(null);
      setEditEmployeeData({ fullName: '', email: '', workTitle: 'web-developer', department: '', status: 'active' });
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setEditEmployeeData({ fullName: '', email: '', workTitle: 'web-developer', department: '', status: 'active' });
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      // In a real app, this would delete the employee via API
      console.log('Employee deleted:', employeeId);
    }
  };

  // Filter employees based on search and work title
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.workTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWorkTitle = workTitleFilter === 'all' || employee.workTitle === workTitleFilter;
    return matchesSearch && matchesWorkTitle;
  });

  // Get statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const webDevelopers = employees.filter(e => e.workTitle === 'web-developer').length;
  const designers = employees.filter(e => e.workTitle.includes('designer')).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Header - Enhanced Card Design */}
          <div className="mb-4 md:mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl md:rounded-lg p-4 md:p-6 border border-blue-100 shadow-sm">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Employee Management
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Manage your team members and their roles
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards - Mobile First */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white rounded-xl md:rounded-lg p-3 md:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Total Employees</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{totalEmployees}</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl md:rounded-lg p-3 md:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Active</p>
                  <p className="text-lg md:text-2xl font-bold text-green-600">{activeEmployees}</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl md:rounded-lg p-3 md:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Developers</p>
                  <p className="text-lg md:text-2xl font-bold text-blue-600">{webDevelopers}</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl md:rounded-lg p-3 md:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Designers</p>
                  <p className="text-lg md:text-2xl font-bold text-purple-600">{designers}</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Palette className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
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
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm md:text-base"
                />
              </div>
              <div className="md:w-48">
                <Combobox
                  options={workTitleOptions}
                  value={workTitleFilter}
                  onChange={(value) => setWorkTitleFilter(value)}
                  placeholder="All Roles"
                  className="h-10 md:h-12"
                />
              </div>
            </div>
          </div>

          {/* Employees List - Mobile First */}
          <div className="bg-white rounded-xl md:rounded-lg shadow-sm border border-gray-100">
            <div className="p-3 md:p-4 border-b border-gray-100">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                Employees ({filteredEmployees.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredEmployees.map((employee) => {
                const workTitleInfo = getWorkTitleInfo(employee.workTitle);
                const WorkTitleIcon = workTitleInfo.icon;
                
                return (
                  <div
                    key={employee.id}
                    className="p-3 md:p-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="flex items-start space-x-3">
                        {/* Profile Image */}
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {employee.avatar}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Employee Info */}
                          <div className="mb-2">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {employee.fullName}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">{employee.email}</p>
                          </div>
                          
                          {/* Work Title */}
                          <div className="flex items-center space-x-2 mb-2">
                            <WorkTitleIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {workTitleInfo.label}
                            </span>
                          </div>
                          
                          {/* Department and Actions */}
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              {employee.department}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditEmployee(employee)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(employee.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:block">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Profile Image */}
                          <div className="w-14 h-14 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-base">
                              {employee.avatar}
                            </span>
                          </div>
                          
                          {/* Employee Information */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {employee.fullName}
                                </h3>
                                <p className="text-sm text-gray-600">{employee.email}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <WorkTitleIcon className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {workTitleInfo.label}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">{employee.projects} projects</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Department and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {employee.department}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
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

      {/* Edit Employee Dialog */}
      <Dialog open={!!editingEmployee} onOpenChange={handleCancelEdit}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Edit Employee
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Employee Info */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {editEmployeeData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {editEmployeeData.fullName}
                </p>
                <p className="text-sm text-gray-600">{editEmployeeData.email}</p>
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
                  value={editEmployeeData.fullName}
                  onChange={(e) => setEditEmployeeData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Full name"
                  className="h-10"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={editEmployeeData.email}
                  disabled
                  className="h-10 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Work Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Title
                </label>
                <Combobox
                  options={workTitleOptions.filter(option => option.value !== 'all')}
                  value={editEmployeeData.workTitle}
                  onChange={(value) => setEditEmployeeData(prev => ({ ...prev, workTitle: value }))}
                  placeholder="Select Work Title"
                  className="h-10"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <Combobox
                  options={departmentOptions}
                  value={editEmployeeData.department}
                  onChange={(value) => setEditEmployeeData(prev => ({ ...prev, department: value }))}
                  placeholder="Select Department"
                  className="h-10"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Combobox
                  options={statusOptions}
                  value={editEmployeeData.status}
                  onChange={(value) => setEditEmployeeData(prev => ({ ...prev, status: value }))}
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
                onClick={handleSaveEmployee}
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

export default EmployeeManagement;
