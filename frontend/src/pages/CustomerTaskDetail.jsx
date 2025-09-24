import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../components/Customer-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { 
  ArrowLeft,
  Calendar, 
  Clock,
  User,
  CheckSquare,
  AlertCircle,
  Flag,
  FileText,
  MessageSquare,
  Loader2,
  Target,
  Users,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { taskApi, subtaskApi } from '../utils/api';

const CustomerTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Scroll to top when component mounts
  useScrollToTop();

  // Fetch task data
  useEffect(() => {
    if (id) {
      loadTask();
      loadSubtasks();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getTaskById(id);
      if (response.success) {
        setTaskData(response.data);
      } else {
        toast.error('Error', 'Task not found');
        navigate('/customer-dashboard');
      }
    } catch (error) {
      console.error('Error loading task:', error);
      toast.error('Error', 'Failed to load task details');
      navigate('/customer-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadSubtasks = async () => {
    try {
      const response = await subtaskApi.getSubtasksByTask(id);
      if (response.success) {
        setSubtasks(response.data);
      }
    } catch (error) {
      console.error('Error loading subtasks:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const formatPriority = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading task details...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if no data
  if (!taskData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Task not found</h3>
              <p className="text-gray-600 mb-4">The task you're looking for doesn't exist or you don't have access to it.</p>
              <button
                onClick={() => navigate('/customer-dashboard')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <CustomerNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{taskData.title}</h1>
                <p className="text-gray-600 mt-1">Task Details</p>
              </div>
            </div>

            {/* Status and Priority Badges */}
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(taskData.status)}`}>
                {formatStatus(taskData.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(taskData.priority)}`}>
                {formatPriority(taskData.priority)}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Task Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Task Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-900 leading-relaxed">{taskData.description || 'No description provided'}</p>
                  </div>

                  {taskData.dueDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Due: {formatDate(taskData.dueDate)}</span>
                    </div>
                  )}

                  {taskData.estimatedHours && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Estimated: {taskData.estimatedHours} hours</span>
                    </div>
                  )}

                  {taskData.assignedTo && taskData.assignedTo.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned To</h3>
                      <div className="flex flex-wrap gap-2">
                        {taskData.assignedTo.map((user, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{user.fullName || user.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtasks */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Subtasks</h2>
                  <span className="text-sm text-gray-500">{subtasks.length} subtasks</span>
                </div>

                {subtasks.length > 0 ? (
                  <div className="space-y-3">
                    {subtasks.map((subtask) => (
                      <div key={subtask._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckSquare className={`h-4 w-4 ${subtask.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className={`text-sm ${subtask.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {subtask.title}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subtask.status)}`}>
                          {formatStatus(subtask.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No subtasks available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Progress and Stats */}
            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Task Progress</span>
                      <span className="text-gray-900 font-medium">{taskData.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
                        style={{ width: `${taskData.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{subtasks.length}</div>
                      <div className="text-sm text-gray-600">Total Subtasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {subtasks.filter(s => s.status === 'completed').length}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Stats */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm text-gray-900">{formatDate(taskData.createdAt)}</span>
                  </div>
                  
                  {taskData.completedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="text-sm text-gray-900">{formatDate(taskData.completedAt)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sequence</span>
                    <span className="text-sm text-gray-900">{taskData.sequence || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerTaskDetail;