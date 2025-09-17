import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './magicui/dialog';
import { Button } from './magicui/button';
import { Input } from './magicui/input';
import { Textarea } from './magicui/textarea';
import { Combobox } from './magicui/combobox';
import { MultiSelect } from './magicui/multi-select';
import { DatePicker } from './magicui/date-picker';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Building2, AlertCircle, Star, Clock, CheckCircle, X } from 'lucide-react';

const ProjectForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customer: '',
    priority: 'Normal',
    dueDate: '',
    assignedTeam: [],
    status: 'Open'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample data - in real app, this would come from API
  const customers = [
    { value: 'acme', label: 'Acme Corporation', icon: Building2 },
    { value: 'techstart', label: 'TechStart Inc', icon: Building2 },
    { value: 'global', label: 'Global Solutions', icon: Building2 },
    { value: 'innovation', label: 'Innovation Labs', icon: Building2 },
    { value: 'digital', label: 'Digital Dynamics', icon: Building2 }
  ];

  const teamMembers = [
    { value: 1, label: 'John Smith', subtitle: 'Project Manager', avatar: 'JS' },
    { value: 2, label: 'Sarah Johnson', subtitle: 'Frontend Developer', avatar: 'SJ' },
    { value: 3, label: 'Mike Chen', subtitle: 'Backend Developer', avatar: 'MC' },
    { value: 4, label: 'Emily Davis', subtitle: 'UI/UX Designer', avatar: 'ED' },
    { value: 5, label: 'Alex Rodriguez', subtitle: 'QA Engineer', avatar: 'AR' },
    { value: 6, label: 'Lisa Wang', subtitle: 'DevOps Engineer', avatar: 'LW' }
  ];

  const priorities = [
    { value: 'Urgent', label: 'Urgent', icon: AlertCircle },
    { value: 'Medium', label: 'Medium', icon: Clock },
    { value: 'Normal', label: 'Normal', icon: CheckCircle }
  ];

  const statuses = [
    { value: 'Open', label: 'Open', icon: Star },
    { value: 'On Hold', label: 'On Hold', icon: Clock },
    { value: 'Completed', label: 'Completed', icon: CheckCircle }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddNewCustomer = (customerName) => {
    // In a real app, this would add the customer to the database
    console.log('Adding new customer:', customerName);
    setFormData(prev => ({ ...prev, customer: customerName }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.customer.trim()) {
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
        const projectData = {
          ...formData,
          createdBy: 'Current User', // In real app, get from auth context
          createdOn: new Date().toISOString(),
          assignedTeamNames: teamMembers
            .filter(member => formData.assignedTeam.includes(member.value))
            .map(member => member.label)
        };
        
        await onSubmit(projectData);
        handleClose();
      } catch (error) {
        console.error('Error creating project:', error);
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
      priority: 'Normal',
      dueDate: '',
      assignedTeam: [],
      status: 'Open'
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

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
          </motion.div>

          {/* Description - Optional */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <Textarea
              placeholder="Provide more context about the project (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
            />
          </motion.div>

          {/* Customer Selection - Required */}
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
              placeholder="Select or add a customer"
              searchable={true}
              allowCustom={true}
              onAddCustom={handleAddNewCustomer}
              error={!!errors.customer}
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
          </motion.div>

          {/* Priority and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700">Priority</label>
              <Combobox
                options={priorities}
                value={formData.priority}
                onChange={(value) => handleInputChange('priority', value)}
                placeholder="Select priority"
              />
            </motion.div>

            {/* Due Date */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                Project Due Date
                <span className="text-yellow-500 ml-1">*</span>
              </label>
              <DatePicker
                value={formData.dueDate}
                onChange={(value) => handleInputChange('dueDate', value)}
                placeholder="Select due date"
                error={!!errors.dueDate}
                minDate={new Date()} // Restrict to today and future dates only
              />
              <AnimatePresence>
                {errors.dueDate && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-yellow-600 flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.dueDate}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Team Assignment - Required */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Assigned Team <span className="text-red-500 ml-1">*</span>
            </label>
            <MultiSelect
              options={teamMembers}
              value={formData.assignedTeam}
              onChange={(value) => handleInputChange('assignedTeam', value)}
              placeholder="Select team members"
              error={!!errors.assignedTeam}
              maxDisplay={2}
            />
            <AnimatePresence>
              {errors.assignedTeam && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.assignedTeam}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <Combobox
              options={statuses}
              value={formData.status}
              onChange={(value) => handleInputChange('status', value)}
              placeholder="Select status"
            />
          </motion.div>

          {/* Auto-populated fields info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200"
          >
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Auto-populated Fields
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Created By: Current User</p>
              <p>• Created On: {new Date().toLocaleDateString()}</p>
            </div>
          </motion.div>

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
