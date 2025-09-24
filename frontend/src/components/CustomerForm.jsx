import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './magicui/dialog';
import { Button } from './magicui/button';
import { Input } from './magicui/input';
import { Textarea } from './magicui/textarea';
import { Combobox } from './magicui/combobox';
import { MultiSelect } from './magicui/multi-select';
import { DatePicker } from './magicui/date-picker';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Building2, AlertCircle, Star, Clock, CheckCircle, X, ArrowLeft, Loader2, FileText, Flag, Calendar, Save } from 'lucide-react';
import { customerApi, handleApiError } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import PMNavbar from './PM-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';

const CustomerForm = ({ isOpen, onClose, onSubmit }) => {
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Determine if this is edit mode (page) or create mode (dialog)
  const isEditMode = !!id;
  const isDialogMode = !isEditMode;
  
  console.log('🔍 CustomerForm mode detection:', {
    id,
    isEditMode,
    isDialogMode,
    isOpen
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customer: '', // This is the customer user (User with role 'customer')
    priority: 'normal',
    dueDate: '',
    assignedTeam: [],
    status: 'planning',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  // Load users data when component mounts
  useEffect(() => {
    if (isOpen || isEditMode) {
      loadUsersData();
    }
  }, [isOpen, isEditMode]);

  // Load customer data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadCustomerData();
    }
  }, [isEditMode, id]);

  // Scroll to top when component mounts (for edit mode)
  useScrollToTop();

  const loadUsersData = async () => {
    setIsLoadingCustomers(true);
    setIsLoadingTeamMembers(true);
    try {
      // Get customer users (users with role 'customer')
      const customerUsersResponse = await customerApi.getUsersForCustomer('customer');
      const customerUsers = customerUsersResponse.data || [];
      
      // Get team members (users with role 'employee' or 'pm')
      const teamMembersResponse = await customerApi.getUsersForCustomer('team');
      const teamMembers = teamMembersResponse.data || [];
      
      // Format customers data (these are User records with role 'customer')
      const formattedCustomers = (Array.isArray(customerUsers) ? customerUsers : []).map(customer => ({
        value: customer._id,
        label: customer.company || customer.fullName,
        subtitle: customer.fullName,
        icon: Building2,
        avatar: customer.avatar
      }));
      
      // Format team members data (employees and PMs)
      const formattedTeamMembers = (Array.isArray(teamMembers) ? teamMembers : []).map(member => ({
        value: member._id,
        label: member.fullName,
        subtitle: `${member.jobTitle || member.workTitle || 'N/A'} - ${member.department || 'N/A'}`,
        avatar: member.avatar
      }));
      
      setCustomers(formattedCustomers);
      setTeamMembers(formattedTeamMembers);
    } catch (error) {
      console.error('Error loading users data:', error);
      toast.error('Error', 'Failed to load users data');
      // Set empty arrays on error to prevent map issues
      setCustomers([]);
      setTeamMembers([]);
    } finally {
      setIsLoadingCustomers(false);
      setIsLoadingTeamMembers(false);
    }
  };

  const loadCustomerData = async () => {
    // For edit mode, we can use a simple loading state since it's a full page
    try {
      const response = await customerApi.getCustomerById(id);
      const customer = response.data;
      
      setFormData({
        name: customer.name || '',
        description: customer.description || '',
        customer: customer.customer?._id || '', // This is the customer user
        priority: customer.priority || 'normal',
        dueDate: customer.dueDate ? new Date(customer.dueDate).toISOString().split('T')[0] : '',
        assignedTeam: customer.assignedTeam?.map(member => member._id) || [],
        status: customer.status || 'planning',
      });
    } catch (error) {
      console.error('Error loading customer:', error);
      toast.error('Error', 'Failed to load customer data');
      navigate('/customers');
    }
  };

  const priorities = [
    { value: 'urgent', label: 'Urgent', icon: AlertCircle },
    { value: 'high', label: 'High', icon: AlertCircle },
    { value: 'normal', label: 'Normal', icon: CheckCircle },
    { value: 'low', label: 'Low', icon: Clock }
  ];

  const statuses = [
    { value: 'planning', label: 'Planning', icon: Star },
    { value: 'active', label: 'Active', icon: CheckCircle },
    { value: 'on-hold', label: 'On Hold', icon: Clock },
    { value: 'completed', label: 'Completed', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', icon: X }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Customer name cannot exceed 200 characters';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    if (!formData.customer) {
      newErrors.customer = 'Customer user is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Form submission debug:', {
      isEditMode,
      id,
      formData,
      isDialogMode
    });
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setIsSubmitting(true);
    try {
      const customerData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      console.log('📤 Sending customer data:', customerData);

      let response;
      if (isEditMode) {
        console.log('🔄 Updating customer with ID:', id);
        response = await customerApi.updateCustomer(id, customerData);
        console.log('✅ Update response:', response);
        toast.success('Success', 'Customer updated successfully');
      } else {
        console.log('➕ Creating new customer');
        response = await customerApi.createCustomer(customerData);
        console.log('✅ Create response:', response);
        toast.success('Success', 'Customer created successfully');
      }

      if (onSubmit) {
        onSubmit(response.data);
      }

      if (isDialogMode) {
        onClose();
      } else {
        navigate('/customers');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      const errorMessage = handleApiError(error);
      toast.error('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form data when closing
    setFormData({
      name: '',
      description: '',
      customer: '',
      priority: 'normal',
      dueDate: '',
      assignedTeam: [],
      status: 'planning',
    });
    setErrors({});
    
    if (isDialogMode) {
      onClose();
    } else {
      navigate('/customers');
    }
  };

  // No loading state needed - data loads quickly and doesn't block the dialog

  const formContent = (
    <>
      {/* Basic Information */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-primary" />
          <span>Basic Information</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Customer Name <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter customer name"
              className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                errors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-primary focus:ring-primary/20'
              }`}
            />
            <AnimatePresence>
              {errors.name && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Customer User */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Customer User <span className="text-red-500 ml-1">*</span>
            </label>
            <Combobox
              options={customers}
              value={formData.customer}
              onChange={(value) => handleInputChange('customer', value)}
              placeholder="Select customer user"
              className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                errors.customer
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-primary focus:ring-primary/20'
              }`}
              allowCustom={false}
            />
            <AnimatePresence>
              {errors.customer && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.customer}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description - Full Width */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter customer description"
            rows={3}
            className={`rounded-xl border-2 transition-all duration-200 ${
              errors.description
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 focus:border-primary focus:ring-primary/20'
            }`}
          />
          <AnimatePresence>
            {errors.description && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500 flex items-center"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Additional Information */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Flag className="h-5 w-5 text-primary" />
          <span>Additional Information</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Priority
            </label>
            <Combobox
              options={priorities.map(p => ({
                value: p.value,
                label: p.label,
                icon: p.icon
              }))}
              value={formData.priority}
              onChange={(value) => handleInputChange('priority', value)}
              placeholder="Select priority"
              className="h-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Status
            </label>
            <Combobox
              options={statuses.map(s => ({
                value: s.value,
                label: s.label,
                icon: s.icon
              }))}
              value={formData.status}
              onChange={(value) => handleInputChange('status', value)}
              placeholder="Select status"
              className="h-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Due Date <span className="text-red-500 ml-1">*</span>
            </label>
            <DatePicker
              value={formData.dueDate}
              onChange={(date) => handleInputChange('dueDate', date)}
              placeholder="Select due date"
              className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                errors.dueDate
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-primary focus:ring-primary/20'
              }`}
            />
            <AnimatePresence>
              {errors.dueDate && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.dueDate}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Team Assignment */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <span>Team Assignment</span>
        </h3>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            Assigned Team
          </label>
          <MultiSelect
            options={teamMembers}
            value={formData.assignedTeam}
            onChange={(value) => handleInputChange('assignedTeam', value)}
            placeholder="Select team members"
            maxSelected={10}
            className="h-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
          />
          <p className="text-xs text-gray-500">
            Select employees and PMs to work on this customer's tasks
          </p>
        </div>
      </motion.div>


      {/* Auto-populated Fields Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
      >
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          Auto-populated Fields
        </h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Created By: Current PM</p>
          <p>• Created On: {new Date().toLocaleDateString()}</p>
          <p>• Customer ID: Auto-generated</p>
        </div>
      </motion.div>

      {/* Footer Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-3 pt-4"
      >
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
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
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>{isEditMode ? 'Update Customer' : 'Create Customer'}</span>
            </div>
          )}
        </Button>
      </motion.div>

    </>
  );

  // If this is a dialog mode, render as dialog
  if (isDialogMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0" onClose={onClose}>
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
                <Building2 className="h-6 w-6" />
                <span>Create New Customer</span>
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/80">
                Fill in the customer details below. Fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {formContent}
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // If this is edit mode, render as full page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PMNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/customers')}
              className="mb-4 p-0 h-auto text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
            
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {isEditMode ? 'Edit Customer' : 'Create New Customer'}
                </h1>
                <p className="text-slate-600 mt-1">
                  {isEditMode ? 'Update customer information and settings' : 'Create a new customer record to manage tasks and track progress'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            {formContent}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
