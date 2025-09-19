import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Upload, FileText, Calendar, User, Flag, CheckSquare, AlertCircle, Paperclip, CheckCircle, Loader2, X, Clock, Target, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './magicui/dialog';
import { Button } from './magicui/button';
import { Input } from './magicui/input';
import { Textarea } from './magicui/textarea';
import { Combobox } from './magicui/combobox';
import { DatePicker } from './magicui/date-picker';
import { taskApi, projectApi, milestoneApi, handleApiError } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const TaskForm = ({ isOpen, onClose, onSubmit, milestoneId, projectId }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    status: 'pending',
    priority: 'normal',
    milestone: milestoneId || '',
    project: projectId || '',
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);

  // Load data when component mounts
  useEffect(() => {
    if (isOpen) {
      loadProjects();
      if (projectId) {
        loadTeamMembers(projectId);
        loadMilestones(projectId);
      }
    }
  }, [isOpen, projectId]);

  // Load milestones when project changes
  useEffect(() => {
    if (formData.project) {
      loadMilestones(formData.project);
      // Reset milestone selection when project changes
      setFormData(prev => ({ ...prev, milestone: '', assignedTo: '' }));
    }
  }, [formData.project]);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const response = await projectApi.getAllProjects();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      handleApiError(error, toast);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadMilestones = async (projectId) => {
    if (!projectId) {
      console.warn('loadMilestones called without projectId');
      setMilestones([]);
      return;
    }
    
    try {
      setIsLoadingMilestones(true);
      const response = await milestoneApi.getMilestonesByProject(projectId);
      if (response.success && response.data) {
        setMilestones(response.data.milestones);
      } else {
        console.error('Invalid milestones response structure:', response);
        setMilestones([]);
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
      handleApiError(error, toast);
      setMilestones([]);
    } finally {
      setIsLoadingMilestones(false);
    }
  };

  const loadTeamMembers = async (projectId) => {
    if (!projectId) {
      console.warn('loadTeamMembers called without projectId');
      setTeamMembers([]);
      return;
    }
    
    try {
      setIsLoadingTeamMembers(true);
      const response = await taskApi.getTeamMembersForTask(projectId);
      if (response.success && response.data) {
        setTeamMembers(response.data.teamMembers);
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

    // Handle project change - load milestones and team members
    if (field === 'project' && value) {
      loadMilestones(value);
      loadTeamMembers(value);
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('Error', `File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles.map(file => ({
        file,
        name: file.name,
        size: file.size,
        type: file.type
      }))]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📽️';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '📦';
    return '📎';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!formData.project) {
      newErrors.project = 'Project is required';
    }

    if (!formData.milestone) {
      newErrors.milestone = 'Milestone is required';
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
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: new Date(formData.dueDate).toISOString(),
        assignedTo: formData.assignedTo ? [formData.assignedTo] : [],
        status: formData.status,
        priority: formData.priority,
        milestone: formData.milestone,
        project: formData.project
      };

      const attachments = formData.attachments.map(attachment => attachment.file).filter(Boolean);
      
      const response = await taskApi.createTask(taskData, attachments);
      
      if (response.success) {
        toast.success('Success', 'Task created successfully!');
        onSubmit && onSubmit(response.data.task);
        onClose();
        resetForm();
      } else {
        toast.error('Error', response.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      handleApiError(error, toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      assignedTo: '',
      status: 'pending',
      priority: 'normal',
      milestone: milestoneId || '',
      project: projectId || '',
      attachments: []
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

  const projectOptions = (projects || []).map(project => ({
    value: project._id,
    label: project.name
  }));

  const milestoneOptions = (milestones || []).map(milestone => ({
    value: milestone._id,
    label: milestone.title
  }));

  const teamMemberOptions = (teamMembers || []).map(member => {
    // Create a descriptive label with name and job title
    const jobInfo = member.jobTitle || member.workTitle || member.department;
    const displayLabel = jobInfo ? `${member.fullName} - ${jobInfo}` : member.fullName;
    
    return {
      value: member._id,
      label: displayLabel,
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      department: member.department,
      jobTitle: member.jobTitle,
      workTitle: member.workTitle
    };
  });



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

          {/* Description */}
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
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
            />
          </motion.div>

          {/* Project and Milestone Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                Project <span className="text-red-500 ml-1">*</span>
              </label>
              {isLoadingProjects ? (
                <div className="flex items-center space-x-3 text-gray-500 bg-gray-50 p-4 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading projects...</span>
                </div>
              ) : (
                <>
                  <Combobox
                    options={projectOptions}
                    value={formData.project}
                    onChange={(value) => handleInputChange('project', value)}
                    placeholder="Select project"
                  />
                  {projectOptions.length === 0 && (
                    <p className="text-sm text-gray-500">No projects available</p>
                  )}
                </>
              )}
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

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                Milestone <span className="text-red-500 ml-1">*</span>
              </label>
              {isLoadingMilestones ? (
                <div className="flex items-center space-x-3 text-gray-500 bg-gray-50 p-4 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading milestones...</span>
                </div>
              ) : (
                <>
                  <Combobox
                    options={milestoneOptions}
                    value={formData.milestone}
                    onChange={(value) => handleInputChange('milestone', value)}
                    placeholder="Select milestone"
                    disabled={!formData.project}
                  />
                  {milestoneOptions.length === 0 && formData.project && (
                    <p className="text-sm text-gray-500">No milestones available for this project</p>
                  )}
                </>
              )}
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

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700">
                Status
              </label>
              <Combobox
                options={statusOptions}
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                placeholder="Select status"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-gray-700">
                Priority
              </label>
              <Combobox
                options={priorityOptions}
                value={formData.priority}
                onChange={(value) => handleInputChange('priority', value)}
                placeholder="Select priority"
              />
            </motion.div>
          </div>

          {/* Due Date - Required */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Due Date <span className="text-red-500 ml-1">*</span>
            </label>
            <DatePicker
              value={formData.dueDate}
              onChange={(date) => handleInputChange('dueDate', date)}
              placeholder="Select due date"
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

          {/* Assigned Team Member */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700">
              Assign To
            </label>
            {isLoadingTeamMembers ? (
              <div className="flex items-center space-x-3 text-gray-500 bg-gray-50 p-4 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading team member...</span>
              </div>
            ) : (
              <>
                <Combobox
                  options={teamMemberOptions}
                  value={formData.assignedTo}
                  onChange={(value) => handleInputChange('assignedTo', value)}
                  placeholder="Select team member"
                />
                {teamMemberOptions.length === 0 && formData.project && (
                  <p className="text-sm text-gray-500">No team member available for this project</p>
                )}
              </>
            )}
          </motion.div>

          {/* File Attachments */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-2"
          >
            <label className="text-sm font-semibold text-gray-700">
              Attachments
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-primary/50 transition-colors duration-200">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="task-attachments"
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              />
              <label
                htmlFor="task-attachments"
                className="cursor-pointer flex flex-col items-center space-y-3 text-gray-500 hover:text-primary transition-colors duration-200"
              >
                <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload files or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">Images, videos, documents (max 10MB each)</p>
                </div>
              </label>
            </div>

            {/* File List */}
            {formData.attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Selected Files ({formData.attachments.length})</span>
                </h4>
                <div className="space-y-2">
                  {formData.attachments.map((attachment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIcon(attachment.type)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Form Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex space-x-3 pt-6 border-t border-gray-200"
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Task...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;