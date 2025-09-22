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
import { Users, UserPlus, AlertCircle, Star, Clock, CheckCircle, X, ArrowLeft, Loader2, FileText, Upload } from 'lucide-react';
import { subtaskApi, handleApiError } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import PMNavbar from './PM-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';

const SubtaskForm = ({ isOpen, onClose, onSubmit, taskId, customerId }) => {
  const { toast } = useToast();
  const { subtaskId } = useParams();
  const navigate = useNavigate();
  
  // Determine if this is edit mode (page) or create mode (dialog)
  const isEditMode = !!subtaskId;
  const isDialogMode = !isEditMode;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task: taskId || '',
    customer: customerId || '',
    status: 'pending',
    priority: 'normal',
    assignedTo: [],
    dueDate: '',
    sequence: 1,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // Load team members data when component mounts
  useEffect(() => {
    if (isOpen || isEditMode) {
      loadTeamMembers();
    }
  }, [isOpen, isEditMode, customerId]);

  // Load subtask data when in edit mode
  useEffect(() => {
    if (isEditMode && subtaskId) {
      loadSubtaskData();
    }
  }, [isEditMode, subtaskId]);

  // Scroll to top when component mounts (for edit mode)
  useScrollToTop();

  const loadTeamMembers = async () => {
    if (!customerId) return;
    
    setIsLoading(true);
    try {
      // Get team members from the customer's assigned team
      const response = await subtaskApi.getTeamMembersForSubtask(customerId);
      const teamData = response.data;
      
      // Format team members data
      const formattedTeamMembers = teamData.map(member => ({
        value: member._id,
        label: member.fullName,
        subtitle: `${member.jobTitle} - ${member.department}`,
        avatar: member.avatar
      }));
      
      setTeamMembers(formattedTeamMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Error', 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubtaskData = async () => {
    setIsLoading(true);
    try {
      const response = await subtaskApi.getSubtask(subtaskId, taskId, customerId);
      const subtask = response.data.subtask;
      
      setFormData({
        title: subtask.title || '',
        description: subtask.description || '',
        task: subtask.task?._id || taskId || '',
        customer: subtask.customer?._id || customerId || '',
        status: subtask.status || 'pending',
        priority: subtask.priority || 'normal',
        assignedTo: subtask.assignedTo?.map(member => member._id) || [],
        dueDate: subtask.dueDate ? new Date(subtask.dueDate).toISOString().split('T')[0] : '',
        sequence: subtask.sequence || 1,
      });
      
      setAttachments(subtask.attachments || []);
    } catch (error) {
      console.error('Error loading subtask:', error);
      toast.error('Error', 'Failed to load subtask data');
      navigate(`/customers/${customerId}/tasks/${taskId}`);
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
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'in-progress', label: 'In Progress', icon: Star },
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
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Subtask title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Subtask title cannot exceed 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (!formData.task) {
      newErrors.task = 'Task is required';
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
      const subtaskData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        sequence: parseInt(formData.sequence),
      };

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append('subtaskData', JSON.stringify(subtaskData));
      
      // Add file attachments
      attachments.forEach(attachment => {
        if (attachment.file) {
          formDataToSend.append('attachments', attachment.file);
        }
      });

      let response;
      if (isEditMode) {
        response = await subtaskApi.updateSubtask(subtaskId, taskId, customerId, formDataToSend);
        toast.success('Success', 'Subtask updated successfully');
      } else {
        response = await subtaskApi.createSubtask(formDataToSend);
        toast.success('Success', 'Subtask created successfully');
      }

      if (onSubmit) {
        onSubmit(response.data);
      }

      if (isDialogMode) {
        onClose();
      } else {
        navigate(`/customers/${customerId}/tasks/${taskId}`);
      }
    } catch (error) {
      console.error('Error saving subtask:', error);
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
      navigate(`/customers/${customerId}/tasks/${taskId}`);
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
      {/* Subtask Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Subtask Title *
        </label>
        <Input
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter subtask title"
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
          placeholder="Enter subtask description"
          rows={3}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
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
          Select team members to work on this subtask
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
        {attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Selected Files:</p>
            <div className="space-y-1">
              {attachments.map(attachment => (
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
              {isEditMode ? 'Update Subtask' : 'Create Subtask'}
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
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Create New Subtask</span>
            </DialogTitle>
            <DialogDescription>
              Create a new subtask to break down the task into smaller, manageable pieces.
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
              onClick={() => navigate(`/customers/${customerId}/tasks/${taskId}`)}
              className="mb-4 p-0 h-auto text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Task
            </Button>
            
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {isEditMode ? 'Edit Subtask' : 'Create New Subtask'}
                </h1>
                <p className="text-slate-600 mt-1">
                  {isEditMode ? 'Update subtask information and settings' : 'Create a new subtask to break down the task into smaller pieces'}
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

export default SubtaskForm;
