import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Upload, FileText, Calendar, User, Flag, CheckSquare, AlertCircle, Paperclip, CheckCircle, Loader2, X, Clock, Target, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './magicui/dialog';
import { Button } from './magicui/button';
import { Input } from './magicui/input';
import { Textarea } from './magicui/textarea';
import { Combobox } from './magicui/combobox';
import { MultiSelect } from './magicui/multi-select';
import { DatePicker } from './magicui/date-picker';
import { taskApi, customerApi, handleApiError } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const TaskForm = ({ isOpen, onClose, onSubmit, customerId }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: [],
    status: 'pending',
    priority: 'normal',
    customer: customerId || '',
    sequence: 1,
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Load data when component mounts
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      if (customerId) {
        loadTeamMembers(customerId);
      }
    }
  }, [isOpen, customerId]);

  // Load team members when customer changes
  useEffect(() => {
    if (formData.customer) {
      loadTeamMembers(formData.customer);
    } else {
      setTeamMembers([]);
    }
  }, [formData.customer]);

  const loadCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      const response = await customerApi.getCustomers();
      if (response.success) {
        const formattedCustomers = response.data.map(customer => ({
          value: customer._id,
          label: customer.name,
          subtitle: customer.description || 'No description',
          icon: Target
        }));
        setCustomers(formattedCustomers);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      handleApiError(error, toast);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const loadTeamMembers = async (customerId) => {
    if (!customerId) {
      console.warn('loadTeamMembers called without customerId');
      setTeamMembers([]);
      return;
    }
    
    try {
      setIsLoadingTeamMembers(true);
      const response = await taskApi.getTeamMembersForTask(customerId);
      if (response.success && response.data) {
        const formattedTeamMembers = response.data.map(member => ({
          value: member._id,
          label: member.fullName,
          subtitle: `${member.jobTitle} - ${member.department}`,
          avatar: member.avatar
        }));
        setTeamMembers(formattedTeamMembers);
      } else {
        console.error('Invalid team members response structure:', response);
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      handleApiError(error, toast);
      setTeamMembers([]);
    } finally {
      setIsLoadingTeamMembers(false);
    }
  };

  const priorities = [
    { value: 'urgent', label: 'Urgent', icon: AlertCircle },
    { value: 'high', label: 'High', icon: AlertCircle },
    { value: 'normal', label: 'Normal', icon: CheckCircle },
    { value: 'low', label: 'Low', icon: Clock }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'in-progress', label: 'In Progress', icon: Target },
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

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      id: Date.now() + Math.random()
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const removeAttachment = (attachmentId) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Task title cannot exceed 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (!formData.customer) {
      newErrors.customer = 'Customer is required';
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

    if (!formData.sequence || formData.sequence < 1) {
      newErrors.sequence = 'Sequence must be a positive number';
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
      const taskData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        sequence: parseInt(formData.sequence),
      };

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append('taskData', JSON.stringify(taskData));
      
      // Add file attachments
      formData.attachments.forEach(attachment => {
        if (attachment.file) {
          formDataToSend.append('attachments', attachment.file);
        }
      });

      const response = await taskApi.createTask(formDataToSend);
      
      if (response.success) {
        toast.success('Success', 'Task created successfully');
        if (onSubmit) {
          onSubmit(response.data);
        }
        onClose();
      }
    } catch (error) {
      console.error('Error creating task:', error);
      const errorMessage = handleApiError(error);
      toast.error('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      assignedTo: [],
      status: 'pending',
      priority: 'normal',
      customer: customerId || '',
      sequence: 1,
      attachments: []
    });
    setErrors({});
    onClose();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span>Create New Task</span>
          </DialogTitle>
          <DialogDescription>
            Create a new task for the selected customer to track progress and manage work.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Task Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
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
              placeholder="Enter task description"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Customer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Customer *
            </label>
            <Combobox
              options={customers}
              value={formData.customer}
              onValueChange={(value) => handleInputChange('customer', value)}
              placeholder="Select customer"
              className={errors.customer ? 'border-red-500' : ''}
              allowCustomValue={false}
            />
            {errors.customer && (
              <p className="text-sm text-red-600">{errors.customer}</p>
            )}
          </div>

          {/* Priority, Status, and Sequence Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Sequence */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Sequence *
              </label>
              <Input
                type="number"
                min="1"
                value={formData.sequence}
                onChange={(e) => handleInputChange('sequence', parseInt(e.target.value))}
                placeholder="1"
                className={errors.sequence ? 'border-red-500' : ''}
              />
              {errors.sequence && (
                <p className="text-sm text-red-600">{errors.sequence}</p>
              )}
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

          {/* Assigned To */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Assigned To
            </label>
            <MultiSelect
              options={teamMembers}
              value={formData.assignedTo}
              onChange={(value) => handleInputChange('assignedTo', value)}
              placeholder="Select team members"
              maxSelected={5}
            />
            <p className="text-xs text-slate-500">
              Select team members to work on this task
            </p>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Attachments
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.avi,.mov,.wmv,.zip,.rar,.7z"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Click to upload files or drag and drop
                </span>
                <span className="text-xs text-slate-500">
                  PDF, DOC, XLS, PPT, TXT, Images, Videos, Archives (Max 10MB each)
                </span>
              </label>
            </div>
            
            {/* Display selected files */}
            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Selected Files:</p>
                <div className="space-y-1">
                  {formData.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-700">{attachment.name}</span>
                        <span className="text-xs text-slate-500">
                          ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <DialogFooter className="flex justify-end space-x-3 pt-4">
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;