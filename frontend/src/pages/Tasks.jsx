import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import TaskForm from '../components/TaskForm';
import useScrollToTop from '../hooks/useScrollToTop';
import { CheckSquare, Plus, Search, Filter, Calendar, User, Clock, MoreVertical, Loader2, Target } from 'lucide-react';
import { taskApi, handleApiError } from '../utils/api';

import { useToast } from '../contexts/ToastContext';

const Tasks = () => {
  const [filter, setFilter] = useState('all');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Scroll to top when component mounts
  useScrollToTop();

  // Load tasks from API
  useEffect(() => {
    // Add a small delay to ensure modules are loaded
    const timer = setTimeout(() => {
      loadTasks();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      
      // Load all tasks using the updated API
      const response = await taskApi.getAllTasks();
      if (response.success) {
        // Extract tasks from the response data structure
        const tasksData = response.data?.tasks || response.data || [];
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } else {
        toast.error('Error', response.message || 'Failed to load tasks');
        // Set empty array on error to prevent filter issues
        setTasks([]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      handleApiError(error, toast);
      // Set empty array on error to prevent filter issues
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task form submission
  const handleTaskSubmit = (taskData) => {
    // Reload tasks after creating a new one
    loadTasks();
    setIsTaskFormOpen(false);
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = filter === 'all' ? (Array.isArray(tasks) ? tasks : []) : (Array.isArray(tasks) ? tasks : []).filter(task => {
    const taskStatus = task.status?.toLowerCase() || '';
    return taskStatus === filter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Mobile Layout - Creative Tile with Button */}
          <div className="md:hidden mb-6">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Manage your tasks</h2>
                  <p className="text-sm text-gray-600">Add new tasks and track progress</p>
                </div>
                <button 
                  onClick={() => setIsTaskFormOpen(true)}
                  className="ml-4 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Keep original design */}
          <div className="hidden md:flex md:items-center md:justify-between mb-8">
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Search className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Search</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter</span>
              </button>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <h3 className="text-sm font-semibold text-gray-900">Stay productive today</h3>
                  <p className="text-xs text-gray-600">Add new tasks and track progress</p>
                </div>
                <button 
                  onClick={() => setIsTaskFormOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">New Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filter Tabs - Tiles Layout */}
          <div className="md:hidden mb-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'all', label: 'All', count: Array.isArray(tasks) ? tasks.length : 0 },
                { key: 'pending', label: 'Pending', count: Array.isArray(tasks) ? tasks.filter(t => t.status?.toLowerCase() === 'pending').length : 0 },
                { key: 'in progress', label: 'Active', count: Array.isArray(tasks) ? tasks.filter(t => t.status?.toLowerCase() === 'in progress').length : 0 },
                { key: 'completed', label: 'Done', count: Array.isArray(tasks) ? tasks.filter(t => t.status?.toLowerCase() === 'completed').length : 0 }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`p-4 rounded-2xl shadow-sm border transition-all ${
                    filter === key
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 active:scale-95'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Filter Tabs - Website Layout */}
          <div className="hidden md:block mb-8">
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', count: Array.isArray(tasks) ? tasks.length : 0 },
                { key: 'pending', label: 'Pending', count: Array.isArray(tasks) ? tasks.filter(t => t.status?.toLowerCase() === 'pending').length : 0 },
                { key: 'in progress', label: 'Active', count: Array.isArray(tasks) ? tasks.filter(t => t.status?.toLowerCase() === 'in progress').length : 0 },
                { key: 'completed', label: 'Done', count: Array.isArray(tasks) ? tasks.filter(t => t.status?.toLowerCase() === 'completed').length : 0 }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filter === key
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-gray-600">Loading tasks...</span>
              </div>
            </div>
          )}

          {/* Responsive Task Cards - Balanced Magic UI Style */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filteredTasks.map((task) => (
              <div 
                key={task._id} 
                onClick={() => {
                  const customerId = task.customer?._id || task.customer;
                  console.log('Task clicked:', task);
                  console.log('Customer ID:', customerId);
                  
                  if (customerId && customerId !== 'undefined' && customerId !== 'null') {
                    console.log('Navigation URL:', `/pm-task/${task._id}?customerId=${customerId}`);
                    navigate(`/pm-task/${task._id}?customerId=${customerId}`);
                  } else {
                    console.error('Invalid customer ID for task:', task);
                    toast.error('Error', 'Invalid customer ID for this task');
                  }
                }}
                className="group bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
              >
                {/* Header Section */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors duration-300">
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">Seq: {task.sequence || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {task.description || 'No description available'}
                </p>

                {/* Customer */}
                <div className="mb-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <span className="text-primary font-semibold">{task.customer?.name || 'No Customer'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <CheckSquare className="h-3 w-3" />
                      <span>{task.subtasks?.length || 0} subtasks</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{task.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{task.assignedTo?.length || 0} assigned</span>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filter or create a new task</p>
              <button className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full text-sm font-medium">
                Create Task
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Task Form - Only render when open */}
      {isTaskFormOpen && (
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onSubmit={handleTaskSubmit}
        />
      )}
    </div>
  );
};

export default Tasks;
