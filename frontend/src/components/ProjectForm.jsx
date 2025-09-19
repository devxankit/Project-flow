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
import { projectApi, handleApiError } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import PMNavbar from './PM-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';

const ProjectForm = ({ isOpen, onClose, onSubmit }) => {
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Determine if this is edit mode (page) or create mode (dialog)
  const isEditMode = !!id;
  const isDialogMode = !isEditMode;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customer: '',
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

  // Load project data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadProjectData();
    }
  }, [isEditMode, id]);

  // Scroll to top when component mounts (for edit mode)
  useScrollToTop();

  const loadUsersData = async () => {
    setIsLoading(true);
    try {
      const response = await projectApi.getUsersForProject();
      const { customers: customersData, teamMembers: teamData } = response.data;
      
      // Format customers data
      const formattedCustomers = customersData.map(customer => ({
        value: customer._id,
        label: customer.company || customer.fullName,
        subtitle: customer.fullName,
        icon: Building2,
        avatar: customer.avatar
      }));
      
      // Format team members data
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

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      const response = await projectApi.getProjectById(id);
      const project = response.data;
      
      setFormData({
        name: project.name || '',
        description: project.description || '',
        customer: project.customer?._id || '',
        priority: project.priority || 'normal',
        dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
        assignedTeam: project.assignedTeam?.map(member => member._id) || [],
        status: project.status || 'planning',
        tags: project.tags || [],
      });
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Error', 'Failed to load project data');
      navigate('/projects');
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

  const handleAddNewCustomer = (customerName) => {
    // For now, just set the customer name
    // In a real app, this would add the customer to the database
    setFormData(prev => ({ ...prev, customer: customerName }));
  };



  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.customer || (typeof formData.customer === 'string' && !formData.customer.trim())) {
      newErrors.customer = 'Customer is required';
    }

    if (formData.assignedTeam.length === 0) {
      newErrors.assignedTeam = 'At least one team member must be assigned';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is highly recommended';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Prepare project data for API
        const projectData = {
          name: formData.name,
          description: formData.description,
          customer: formData.customer,
          priority: formData.priority,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
          assignedTeam: Array.isArray(formData.assignedTeam) ? formData.assignedTeam : [],
          status: formData.status,
          tags: Array.isArray(formData.tags) ? formData.tags : [],
        };

        // Create or update project via API
        let response;
        if (isEditMode) {
          response = await projectApi.updateProject(id, projectData);
          toast.success('Success', 'Project updated successfully!');
          navigate(`/project/${id}`);
        } else {
          response = await projectApi.createProject(projectData);
          toast.success('Success', 'Project created successfully!');
          await onSubmit(response.data);
          handleClose();
        }
      } catch (error) {
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} project:`, error);
        const errorMessage = handleApiError(error, `Failed to ${isEditMode ? 'update' : 'create'} project`);
        toast.error('Error', errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      customer: '',
      priority: 'normal',
      dueDate: '',
      assignedTeam: [],
      status: 'planning',
      tags: [],
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const renderFormContent = () => (
    <>
      {/* Project Name - Required */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <label className="text-sm font-semibold text-gray-700 flex items-center">
          Project Name <span className="text-red-500 ml-1">*</span>
        </label>
        <Input
          type="text"
          placeholder="Enter project name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`h-12 rounded-xl border-2 transition-all duration-200 ${
            errors.name 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 focus:border-primary focus:ring-primary/20'
          }`}
        />
        {errors.name && (
          <p className="text-red-500 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.name}
          </p>
        )}
      </motion.div>

      {/* Project Description */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <label className="text-sm font-semibold text-gray-700">Project Description</label>
        <Textarea
          placeholder="Describe the project goals, scope, and requirements..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="min-h-[100px] rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
        />
      </motion.div>

      {/* Customer Selection */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <label className="text-sm font-semibold text-gray-700 flex items-center">
          Customer <span className="text-red-500 ml-1">*</span>
        </label>
        <Combobox
          options={customers}
          value={formData.customer}
          onChange={(value) => handleInputChange('customer', value)}
          placeholder="Select a customer"
          className="h-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
        />
        {errors.customer && (
          <p className="text-red-500 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.customer}
          </p>
        )}
      </motion.div>

      {/* Priority and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            Priority <span className="text-red-500 ml-1">*</span>
          </label>
          <Combobox
            options={priorities}
            value={formData.priority}
            onChange={(value) => handleInputChange('priority', value)}
            placeholder="Select priority"
            className="h-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <label className="text-sm font-semibold text-gray-700">Status</label>
          <Combobox
            options={statuses}
            value={formData.status}
            onChange={(value) => handleInputChange('status', value)}
            placeholder="Select status"
            className="h-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
          />
        </motion.div>
      </div>

      {/* Due Date */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-2"
      >
        <label className="text-sm font-semibold text-gray-700">Due Date</label>
        <DatePicker
          value={formData.dueDate}
          onChange={(date) => handleInputChange('dueDate', date)}
          placeholder="Select due date"
          className="h-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
        />
      </motion.div>

      {/* Team Assignment */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-2"
      >
        <label className="text-sm font-semibold text-gray-700 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Assign Team Members
        </label>
        <MultiSelect
          options={teamMembers}
          value={formData.assignedTeam}
          onChange={(value) => handleInputChange('assignedTeam', value)}
          placeholder="Select team members"
          className="min-h-[48px] rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
        />
      </motion.div>

    </>
  );

  // Show loading state for edit mode
  if (isEditMode && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <PMNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading project data...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Page layout for edit mode
  if (isEditMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <PMNavbar />
        
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-4xl md:mx-auto md:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate(`/project/${id}`)}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Project</span>
              </button>
              
              <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Edit Project</h1>
                <p className="text-primary-foreground/80">
                  Update the project details below. Fields marked with * are required.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {renderFormContent()}
                
                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/project/${id}`)}
                    className="flex-1 h-12 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Update Project'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Dialog layout for create mode
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0" onClose={handleClose}>
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold">
              Create New Project
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              Fill in the project details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {renderFormContent()}

          {/* Footer Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
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
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Project'
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
