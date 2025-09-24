import React, { useState, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { taskRequestApi } from '../utils/api';

const TaskRequestForm = ({ isOpen, onClose, customerId, customerName }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    dueDate: '',
    estimatedHours: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'normal',
        dueDate: '',
        estimatedHours: ''
      });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Error', 'Task title is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Error', 'Task description is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const requestData = {
        ...formData,
        customer: customerId,
        customerName: customerName,
        status: 'pending',
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined
      };

      const response = await taskRequestApi.createTaskRequest(requestData);
      
      if (response.success) {
        toast.success('Success', 'Task request submitted successfully! The PM will review it soon.');
        onClose();
      } else {
        toast.error('Error', response.message || 'Failed to submit task request');
      }
    } catch (error) {
      console.error('Error submitting task request:', error);
      toast.error('Error', 'Failed to submit task request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Request New Task</h2>
            <p className="text-sm text-gray-600 mt-1">Submit a task request for {customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what needs to be done"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Hours
            </label>
            <input
              type="number"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleInputChange}
              placeholder="e.g., 8"
              min="1"
              max="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskRequestForm;