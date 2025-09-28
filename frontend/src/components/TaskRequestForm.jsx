import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, FileText, Calendar, User, CheckSquare, FolderKanban, Flag, AlertCircle, Target, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './magicui/dialog';
import { Button } from './magicui/button';
import { Input } from './magicui/input';
import { Textarea } from './magicui/textarea';
import { Combobox } from './magicui/combobox';
import { DatePicker } from './magicui/date-picker';
import { useToast } from '../contexts/ToastContext';
import { customerApi } from '../utils/api';

const TaskRequestForm = ({ isOpen, onClose, onSubmit, customerId, customerName, tasks, initialData, isEdit = false, isSubmitting: externalSubmitting = false }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    customer: initialData?.customer || customerId || '',
    task: initialData?.task || '',
    priority: initialData?.priority || 'Medium',
    dueDate: initialData?.dueDate || '',
    reason: initialData?.reason || '',
    attachments: initialData?.attachments || []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use external submitting state if provided (for edit mode)
  const submitting = externalSubmitting || isSubmitting;

  // Transform tasks data to match Combobox expected format
  let taskOptions = [];
  try {
    console.log('TaskRequestForm - tasks prop:', tasks);
    if (tasks && Array.isArray(tasks)) {
      taskOptions = tasks.map(task => ({
        value: task._id,
        label: task.title || 'Untitled Task'
      }));
      console.log('TaskRequestForm - taskOptions:', taskOptions);
    }
  } catch (error) {
    console.error('Error processing tasks:', error);
    taskOptions = [];
  }

  // Priority options
  const priorities = [
    { value: 'Low', label: 'Low', icon: Flag, color: 'text-green-600' },
    { value: 'Medium', label: 'Medium', icon: Flag, color: 'text-yellow-600' },
    { value: 'High', label: 'High', icon: Flag, color: 'text-orange-600' },
    { value: 'Urgent', label: 'Urgent', icon: AlertCircle, color: 'text-red-600' }
  ];

  // Reason options for task request
  const reasons = [
    { value: 'bug-fix', label: 'Bug Fix Required' },
    { value: 'feature-request', label: 'New Feature Request' },
    { value: 'improvement', label: 'Improvement Suggestion' },
    { value: 'change-request', label: 'Change Request' },
    { value: 'additional-work', label: 'Additional Work Required' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Task title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.task) {
      newErrors.task = 'Please select a task';
    }

    if (!formData.reason) {
      newErrors.reason = 'Please specify the reason for this request';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
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

    if (!isEdit) {
      setIsSubmitting(true);
    }

    try {
      const requestData = {
        title: formData.title,
        description: formData.description,
        customer: formData.customer,
        task: formData.task,
        priority: formData.priority,
        dueDate: formData.dueDate,
        reason: formData.reason
      };

      let response;
      if (isEdit) {
        // For edit mode, call the onSubmit callback with the data
        await onSubmit(requestData);
        return;
      } else {
        // For create mode, make API call directly
        response = await customerApi.createTaskRequest(requestData);
      }
      
      if (response && response.success) {
        toast.success(
          'Task Request Submitted!',
          'Your task request has been submitted successfully. The project manager will review it soon.'
        );
        
        // Call the onSubmit callback if provided
        if (onSubmit) {
          onSubmit(response.data);
        }
        
        handleClose();
      } else if (response && !response.success) {
        toast.error('Error', response.message || 'Failed to submit task request');
      }
    } catch (error) {
      console.error('Error submitting task request:', error);
      toast.error('Error', 'Failed to submit task request. Please try again.');
    } finally {
      if (!isEdit) {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      customer: customerId || '',
      task: '',
      priority: 'Medium',
      dueDate: '',
      reason: '',
      attachments: []
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
            <DialogTitle className="text-2xl font-bold flex items-center">
              <CheckSquare className="h-6 w-6 mr-2" />
              {isEdit ? 'Edit Task Request' : 'Request New Subtask'}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              {isEdit 
                ? `Update your task request for ${customerName}. Changes will be reviewed by the project manager.`
                : `Submit a subtask request for ${customerName}. The project manager will review and approve your request.`
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Title - Required */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Subtask Title *
            </label>
            <Input
              type="text"
              placeholder="Enter a clear, descriptive title for the subtask"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                errors.title 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-primary focus:ring-primary/20'
              }`}
            />
            <AnimatePresence>
              {errors.title && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.title}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Description - Required */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700">
              Description *
            </label>
            <Textarea
              placeholder="Provide detailed description of what needs to be done, including any specific requirements or constraints..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
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
          </motion.div>

          {/* Task Selection - Required */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Task *
            </label>
            <Combobox
              options={taskOptions}
              value={formData.task}
              onChange={(value) => handleInputChange('task', value)}
              placeholder={taskOptions.length === 0 ? "No tasks available for this customer" : "Select the task this subtask belongs to"}
              className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                errors.task 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-primary focus:ring-primary/20'
              }`}
            />
            <AnimatePresence>
              {errors.task && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.task}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Priority and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority Selection */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Flag className="h-4 w-4 mr-1" />
                Priority
              </label>
              <Combobox
                options={priorities}
                value={formData.priority}
                onChange={(value) => handleInputChange('priority', value)}
                placeholder="Select priority level"
                className="h-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
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
                <Calendar className="h-4 w-4 mr-1" />
                Due Date *
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
            </motion.div>
          </div>

          {/* Reason for Request - Required */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Reason for Request *
            </label>
            <Combobox
              options={reasons}
              value={formData.reason}
              onChange={(value) => handleInputChange('reason', value)}
              placeholder="Why do you need this subtask?"
              className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                errors.reason 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-primary focus:ring-primary/20'
              }`}
            />
            <AnimatePresence>
              {errors.reason && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.reason}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Form Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEdit ? 'Updating...' : 'Submitting...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Update Request' : 'Submit Request'}
                </div>
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskRequestForm;