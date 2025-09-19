import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Upload, FileText, Calendar, User, Flag, FolderKanban, AlertCircle, Paperclip, CheckCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './magicui/dialog';
import { Button } from './magicui/button';
import { Input } from './magicui/input';
import { Textarea } from './magicui/textarea';
import { Combobox } from './magicui/combobox';
import { MultiSelect } from './magicui/multi-select';
import { DatePicker } from './magicui/date-picker';
import { milestoneApi, handleApiError } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const MilestoneForm = ({ isOpen, onClose, onSubmit, projectId }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignees: [],
    status: 'pending',
    project: projectId || '',
    priority: 'normal',
    sequence: 1,
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  // Load team members when component mounts
  useEffect(() => {
    if (isOpen && projectId) {
      loadTeamMembers();
    }
  }, [isOpen, projectId]);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    try {
      const response = await milestoneApi.getTeamMembersForMilestone(projectId);
      if (response.success) {
        setTeamMembers(response.data.teamMembers);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      handleApiError(error, toast);
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
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

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Milestone title is required';
    }

    if (!formData.sequence || formData.sequence < 1) {
      newErrors.sequence = 'Sequence number must be at least 1';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.assignees.length === 0) {
      newErrors.assignees = 'At least one team member must be assigned';
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
      // Prepare milestone data
      const milestoneData = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        assignedTo: Array.isArray(formData.assignees) ? formData.assignees : [],
        status: formData.status,
        priority: formData.priority,
        sequence: parseInt(formData.sequence),
        projectId: projectId
      };


      // Get attachment files
      const attachments = formData.attachments.map(attachment => attachment.file).filter(Boolean);
      console.log('Sending milestone data:', milestoneData);
      console.log('Sending attachments:', attachments);
      console.log('Attachments count:', attachments.length);

      // Create milestone via API
      const response = await milestoneApi.createMilestone(milestoneData, attachments);
      
      if (response.success) {
        toast.success('Success', 'Milestone created successfully');
        onSubmit(response.data);
        handleClose();
      } else {
        toast.error('Error', response.message || 'Failed to create milestone');
      }
    } catch (error) {
      console.error('Error creating milestone:', error);
      handleApiError(error, toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      assignees: [],
      status: 'pending',
      project: projectId || '',
      priority: 'normal',
      sequence: 1,
      attachments: []
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0" onClose={handleClose}>
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold">
              Create New Milestone
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              Fill in the milestone details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Milestone Title - Required */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Milestone Title <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter milestone title"
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

          {/* Sequence Number */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Sequence Number <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="number"
              placeholder="Enter sequence number (1, 2, 3...)"
              value={formData.sequence}
              onChange={(e) => handleInputChange('sequence', parseInt(e.target.value) || 1)}
              min="1"
              className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                errors.sequence 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-primary focus:ring-primary/20'
              }`}
            />
            <AnimatePresence>
              {errors.sequence && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.sequence}
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
              placeholder="Describe the milestone objectives and requirements (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
            />
          </motion.div>

          {/* Due Date and Assignee Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                Due Date <span className="text-red-500 ml-1">*</span>
              </label>
              <DatePicker
                value={formData.dueDate}
                onChange={(date) => handleInputChange('dueDate', date)}
                placeholder="Select due date"
                error={!!errors.dueDate}
                minDate={new Date()}
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

            {/* Assignees */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                Assigned Team <span className="text-red-500 ml-1">*</span>
              </label>
              <MultiSelect
                options={teamMembers}
                value={formData.assignees}
                onChange={(value) => handleInputChange('assignees', value)}
                placeholder="Select team members"
                error={!!errors.assignees}
                maxDisplay={2}
              />
              <AnimatePresence>
                {errors.assignees && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-red-500 flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.assignees}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <Combobox
                options={statusOptions}
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                placeholder="Select status"
              />
            </motion.div>

            {/* Priority */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700">Priority</label>
              <Combobox
                options={priorityOptions}
                value={formData.priority}
                onChange={(value) => handleInputChange('priority', value)}
                placeholder="Select priority"
              />
            </motion.div>
          </div>


          {/* Attachments */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700">
              Attachments
            </label>
            
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary/50 transition-colors duration-200">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Click to upload files</p>
                <p className="text-xs text-gray-500">Images, videos, PDFs, documents</p>
              </label>
            </div>

            {/* Attached Files List */}
            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-1 bg-primary/10 rounded">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <span className="text-sm font-bold">×</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Milestone'
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneForm;
