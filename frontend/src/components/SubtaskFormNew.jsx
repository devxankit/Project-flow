import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './magicui/dialog';
import { Button } from './magicui/button';
import { Input } from './magicui/input';
import { Textarea } from './magicui/textarea';
import { Combobox } from './magicui/combobox';
import { MultiSelect } from './magicui/multi-select';
import { DatePicker } from './magicui/date-picker';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, CheckSquare, AlertCircle, Clock, CheckCircle, X, ArrowLeft, Loader2, FileText, Flag, Calendar, Save, Tag, List } from 'lucide-react';
import { subtaskApi, taskApi, customerApi, handleApiError } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import PMNavbar from './PM-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';

const SubtaskForm = ({ isOpen, onClose, onSubmit, taskId }) => {
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  useScrollToTop();

  const isEditMode = Boolean(id);
  const isDialogMode = Boolean(isOpen);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task: taskId || '',
    priority: 'normal',
    dueDate: '',
    assignedTo: [],
    status: 'planning',
    sequence: 1,
    tags: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);

  const priorities = [
    { value: 'low', label: 'Low', icon: Clock },
    { value: 'normal', label: 'Normal', icon: CheckCircle },
    { value: 'high', label: 'High', icon: AlertCircle },
    { value: 'urgent', label: 'Urgent', icon: AlertCircle },
  ];

  const statuses = [
    { value: 'planning', label: 'Planning', icon: Clock },
    { value: 'in-progress', label: 'In Progress', icon: CheckSquare },
    { value: 'completed', label: 'Completed', icon: CheckCircle },
    { value: 'on-hold', label: 'On Hold', icon: AlertCircle },
  ];

  useEffect(() => {
    if (isDialogMode || isEditMode) {
      loadTasks();
      loadTeamMembers();
    }
  }, [isDialogMode, isEditMode]);

  useEffect(() => {
    if (isEditMode && id) {
      loadSubtaskData();
    }
  }, [isEditMode, id]);

  const loadTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const response = await taskApi.getTasks();
      if (response.success && response.data) {
        const tasksData = response.data || [];
        const formattedTasks = (Array.isArray(tasksData) ? tasksData : []).map(task => ({
          value: task._id,
          label: task.title,
          subtitle: task.customer?.name || 'No Customer',
          icon: CheckSquare,
          avatar: task.avatar
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Error', 'Failed to load tasks');
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const loadTeamMembers = async () => {
    setIsLoadingTeamMembers(true);
    try {
      const response = await customerApi.getUsersForCustomer('team');
      if (response.success && response.data) {
        const teamData = response.data.teamMembers || [];
        const formattedTeamMembers = (Array.isArray(teamData) ? teamData : []).map(member => ({
          value: member._id,
          label: member.fullName,
          subtitle: `${member.jobTitle || member.workTitle || 'N/A'} - ${member.department || 'N/A'}`,
          avatar: member.avatar
        }));
        setTeamMembers(formattedTeamMembers);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Error', 'Failed to load team members');
      setTeamMembers([]);
    } finally {
      setIsLoadingTeamMembers(false);
    }
  };

  const loadSubtaskData = async () => {
    try {
      const response = await subtaskApi.getSubtask(id);
      if (response.success && response.data) {
        const subtask = response.data;
        setFormData({
          title: subtask.title || '',
          description: subtask.description || '',
          task: subtask.task?._id || '',
          priority: subtask.priority || 'normal',
          dueDate: subtask.dueDate || '',
          assignedTo: subtask.assignedTo?.map(user => user._id) || [],
          status: subtask.status || 'planning',
          sequence: subtask.sequence || 1,
          tags: subtask.tags || [],
        });
      }
    } catch (error) {
      console.error('Error loading subtask:', error);
      toast.error('Error', 'Failed to load subtask data');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Subtask title is required';
    }

    if (!formData.task) {
      newErrors.task = 'Task selection is required';
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
      toast.error('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const subtaskData = {
        ...formData,
        assignedTo: formData.assignedTo,
        tags: formData.tags,
      };

      let response;
      if (isEditMode) {
        response = await subtaskApi.updateSubtask(id, subtaskData);
      } else {
        response = await subtaskApi.createSubtask(subtaskData);
      }

      if (response.success) {
        toast.success(
          isEditMode ? 'Subtask Updated!' : 'Subtask Created!',
          isEditMode ? 'Subtask has been updated successfully.' : 'Subtask has been created successfully.'
        );
        
        if (onSubmit) {
          onSubmit(response.data);
        }
        
        handleClose();
      } else {
        toast.error('Error', response.message || 'Failed to save subtask');
      }
    } catch (error) {
      console.error('Error saving subtask:', error);
      handleApiError(error, toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      task: taskId || '',
      priority: 'normal',
      dueDate: '',
      assignedTo: [],
      status: 'planning',
      sequence: 1,
      tags: [],
    });
    setErrors({});
    
    if (isDialogMode) {
      onClose();
    } else {
      navigate('/subtasks');
    }
  };

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
          <List className="h-5 w-5 text-primary" />
          <span>Basic Information</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subtask Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Subtask Title <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter subtask title"
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
          </div>

          {/* Task */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Task <span className="text-red-500 ml-1">*</span>
            </label>
            <Combobox
              options={tasks}
              value={formData.task}
              onChange={(value) => handleInputChange('task', value)}
              placeholder="Select task"
              className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                errors.task
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-primary focus:ring-primary/20'
              }`}
              allowCustom={false}
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
            placeholder="Enter subtask description"
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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          {/* Sequence */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Sequence
            </label>
            <Input
              type="number"
              value={formData.sequence}
              onChange={(e) => handleInputChange('sequence', parseInt(e.target.value) || 1)}
              placeholder="1"
              min="1"
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
            Assigned To
          </label>
          <MultiSelect
            options={teamMembers}
            value={formData.assignedTo}
            onChange={(value) => handleInputChange('assignedTo', value)}
            placeholder="Select team members"
            maxSelected={3}
            className="h-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
          />
          <p className="text-xs text-gray-500">
            Select team members to work on this subtask
          </p>
        </div>
      </motion.div>

      {/* Tags */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Tag className="h-5 w-5 text-primary" />
          <span>Organization</span>
        </h3>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            Tags
          </label>
          <Input
            value={formData.tags.join(', ')}
            onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
            placeholder="Enter tags separated by commas"
            className="h-12 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
          />
          <p className="text-xs text-gray-500">
            Add tags to categorize and organize this subtask
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
          <p>• Subtask ID: Auto-generated</p>
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
              <span>Creating...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Create Subtask</span>
            </div>
          )}
        </Button>
      </motion.div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0" onClose={onClose}>
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
              <List className="h-6 w-6" />
              <span>Create New Subtask</span>
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              Fill in the subtask details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formContent}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubtaskForm;
