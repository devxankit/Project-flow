import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Upload, FileText, Calendar, User, CheckSquare, FolderKanban, Flag, AlertCircle, Paperclip, CheckCircle, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './magicui/dialog';
import { Button } from './magicui/button';
import { Input } from './magicui/input';
import { Textarea } from './magicui/textarea';
import { Combobox } from './magicui/combobox';
import { DatePicker } from './magicui/date-picker';

const TaskForm = ({ isOpen, onClose, onSubmit, projectId, milestoneId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: projectId || '',
    milestone: milestoneId || '',
    assignee: '',
    priority: 'Normal',
    dueDate: '',
    status: 'Not Started',
    attachments: [],
    comments: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for dropdowns
  const projects = [
    { value: 'project-1', label: 'Website Redesign' },
    { value: 'project-2', label: 'Mobile App Development' },
    { value: 'project-3', label: 'Database Migration' },
    { value: 'project-4', label: 'API Integration' }
  ];

  const milestones = [
    { value: 'milestone-1', label: 'Design Phase', project: 'project-1' },
    { value: 'milestone-2', label: 'Development Phase', project: 'project-1' },
    { value: 'milestone-3', label: 'Testing Phase', project: 'project-1' },
    { value: 'milestone-4', label: 'Backend Setup', project: 'project-3' },
    { value: 'milestone-5', label: 'Frontend Development', project: 'project-2' },
    { value: 'milestone-6', label: 'API Integration', project: 'project-4' }
  ];

  const teamMembers = [
    { value: 1, label: 'John Doe', subtitle: 'Project Manager', avatar: 'JD' },
    { value: 2, label: 'Jane Smith', subtitle: 'Frontend Developer', avatar: 'JS' },
    { value: 3, label: 'Mike Johnson', subtitle: 'Backend Developer', avatar: 'MJ' },
    { value: 4, label: 'Sarah Wilson', subtitle: 'UI/UX Designer', avatar: 'SW' },
    { value: 5, label: 'Alex Brown', subtitle: 'QA Engineer', avatar: 'AB' },
    { value: 6, label: 'Lisa Wang', subtitle: 'DevOps Engineer', avatar: 'LW' }
  ];

  const priorities = [
    { value: 'Urgent', label: 'Urgent' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Normal', label: 'Normal' }
  ];

  const statuses = [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Blocked', label: 'Blocked' },
    { value: 'Done', label: 'Done' }
  ];

  // Filter milestones based on selected project
  const filteredMilestones = formData.project 
    ? milestones.filter(milestone => milestone.project === formData.project)
    : milestones;

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

    // Reset milestone when project changes
    if (field === 'project') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        milestone: ''
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
      newErrors.title = 'Task title is required';
    }

    if (!formData.project) {
      newErrors.project = 'Project is required';
    }

    if (!formData.milestone) {
      newErrors.milestone = 'Milestone is required';
    }

    if (!formData.assignee) {
      newErrors.assignee = 'Assignee is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      project: projectId || '',
      milestone: milestoneId || '',
      assignee: '',
      priority: 'Normal',
      dueDate: '',
      status: 'Not Started',
      attachments: [],
      comments: ''
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
              Create New Task
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              Fill in the task details below. Fields marked with * are required.
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
              Task Title <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter task title"
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
              placeholder="Describe the task requirements and objectives (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
            />
          </motion.div>

          {/* Project and Milestone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                Project <span className="text-red-500 ml-1">*</span>
              </label>
              <Combobox
                options={projects}
                value={formData.project}
                onChange={(value) => handleInputChange('project', value)}
                placeholder="Select project"
                error={!!errors.project}
              />
              <AnimatePresence>
                {errors.project && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-red-500 flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.project}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Milestone */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                Milestone <span className="text-red-500 ml-1">*</span>
              </label>
              <Combobox
                options={filteredMilestones}
                value={formData.milestone}
                onChange={(value) => handleInputChange('milestone', value)}
                placeholder="Select milestone"
                error={!!errors.milestone}
                disabled={!formData.project}
              />
              <AnimatePresence>
                {errors.milestone && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-red-500 flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.milestone}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Assignee and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assignee */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                Assignee <span className="text-red-500 ml-1">*</span>
              </label>
              <Combobox
                options={teamMembers}
                value={formData.assignee}
                onChange={(value) => handleInputChange('assignee', value)}
                placeholder="Select team member"
                error={!!errors.assignee}
              />
              <AnimatePresence>
                {errors.assignee && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-red-500 flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.assignee}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Due Date */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
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
          </div>

          {/* Priority and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
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

            {/* Status */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
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
          </div>

          {/* Comments */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Initial Comments
            </label>
            <Textarea
              placeholder="Add initial notes or comments for this task (optional)"
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              rows={3}
              className="rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
            />
          </motion.div>

          {/* Attachments */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
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
                accept="image/*,.pdf,.mp4"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Click to upload files</p>
                <p className="text-xs text-gray-500">Images, PDFs, short MP4 videos</p>
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
            transition={{ delay: 1.1 }}
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
                'Create Task'
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
