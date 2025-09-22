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
import { Users, UserPlus, Building2, AlertCircle, Star, Clock, CheckCircle, X, ArrowLeft, Loader2 } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customer: '', // This is the customer user (User with role 'customer')
    priority: 'normal',
    dueDate: '',
    assignedTeam: [],
    status: 'planning',
    tags: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    try {
      const response = await customerApi.getUsersForCustomer();
      const { customers: customersData, teamMembers: teamData } = response.data;
      
      // Format customers data (these are User records with role 'customer')
      const formattedCustomers = customersData.map(customer => ({
        value: customer._id,
        label: customer.company || customer.fullName,
        subtitle: customer.fullName,
        icon: Building2,
        avatar: customer.avatar
      }));
      
      // Format team members data (employees and PMs)
      const formattedTeamMembers = teamData.map(member => ({
        value: member._id,
        label: member.fullName,
        subtitle: `${member.jobTitle} - ${member.department}`,
        avatar: member.avatar
      }));
      
      setCustomers(formattedCustomers);
      setTeamMembers(formattedTeamMembers);
    } catch (error) {
      console.error('Error loading users data:', error);
      toast.error('Error', 'Failed to load users data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerData = async () => {
    setIsLoading(true);
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
        tags: customer.tags || [],
      });
    } catch (error) {
      console.error('Error loading customer:', error);
      toast.error('Error', 'Failed to load customer data');
      navigate('/customers');
    } finally {
      setIsLoading(false);
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
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const customerData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      let response;
      if (isEditMode) {
        response = await customerApi.updateCustomer(id, customerData);
        toast.success('Success', 'Customer updated successfully');
      } else {
        response = await customerApi.createCustomer(customerData);
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
    if (isDialogMode) {
      onClose();
    } else {
      navigate('/customers');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Customer Name *
        </label>
        <Input
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter customer name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Description
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter customer description"
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Customer User Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Customer User *
        </label>
        <Combobox
          options={customers}
          value={formData.customer}
          onValueChange={(value) => handleInputChange('customer', value)}
          placeholder="Select customer user"
          className={errors.customer ? 'border-red-500' : ''}
          allowCustomValue={false}
        />
        {errors.customer && (
          <p className="text-sm text-red-600">{errors.customer}</p>
        )}
      </div>

      {/* Priority and Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Priority
          </label>
          <Combobox
            options={priorities.map(p => ({
              value: p.value,
              label: p.label,
              icon: p.icon
            }))}
            value={formData.priority}
            onValueChange={(value) => handleInputChange('priority', value)}
            placeholder="Select priority"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Status
          </label>
          <Combobox
            options={statuses.map(s => ({
              value: s.value,
              label: s.label,
              icon: s.icon
            }))}
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value)}
            placeholder="Select status"
          />
        </div>
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Due Date *
        </label>
        <DatePicker
          value={formData.dueDate}
          onChange={(date) => handleInputChange('dueDate', date)}
          placeholder="Select due date"
          className={errors.dueDate ? 'border-red-500' : ''}
        />
        {errors.dueDate && (
          <p className="text-sm text-red-600">{errors.dueDate}</p>
        )}
      </div>

      {/* Assigned Team */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Assigned Team
        </label>
        <MultiSelect
          options={teamMembers}
          value={formData.assignedTeam}
          onChange={(value) => handleInputChange('assignedTeam', value)}
          placeholder="Select team members"
          maxSelected={10}
        />
        <p className="text-xs text-slate-500">
          Select employees and PMs to work on this customer's tasks
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Tags
        </label>
        <Input
          value={formData.tags.join(', ')}
          onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
          placeholder="Enter tags separated by commas"
        />
        <p className="text-xs text-slate-500">
          Add tags to categorize this customer (e.g., "urgent", "new-client")
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {isEditMode ? 'Update Customer' : 'Create Customer'}
            </>
          )}
        </Button>
      </div>
    </form>
  );

  // If this is a dialog mode, render as dialog
  if (isDialogMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>Create New Customer</span>
            </DialogTitle>
            <DialogDescription>
              Create a new customer record to manage tasks and track progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {formContent}
          </div>
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
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            {formContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
