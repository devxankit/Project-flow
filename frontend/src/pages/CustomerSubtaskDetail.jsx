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
  BarChart3,
  Paperclip
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { subtaskApi } from '../utils/api';

const CustomerSubtaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subtaskData, setSubtaskData] = useState(null);

  // Scroll to top when component mounts
  useScrollToTop();

  // Fetch subtask data
  useEffect(() => {
    if (id) {
      loadSubtask();
    }
  }, [id]);

  const loadSubtask = async () => {
    try {
      setLoading(true);
      const response = await subtaskApi.getSubtaskById(id);
      if (response.success) {
        setSubtaskData(response.data);
      } else {
        toast.error('Error', 'Subtask not found');
        navigate('/customer-dashboard');
      }
    } catch (error) {
      console.error('Error loading subtask:', error);
      toast.error('Error', 'Failed to load subtask details');
      navigate('/customer-dashboard');
    } finally {
      setLoading(false);
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
              <span className="ml-2 text-gray-600">Loading subtask details...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if no data
  if (!subtaskData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Subtask not found</h3>
              <p className="text-gray-600 mb-4">The subtask you're looking for doesn't exist or you don't have access to it.</p>
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{subtaskData.title}</h1>
                <p className="text-gray-600 mt-1">Subtask Details</p>
              </div>
            </div>

            {/* Status and Priority Badges */}
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(subtaskData.status)}`}>
                {formatStatus(subtaskData.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(subtaskData.priority)}`}>
                {formatPriority(subtaskData.priority)}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Subtask Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subtask Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Subtask Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-900 leading-relaxed">{subtaskData.description || 'No description provided'}</p>
                  </div>

                  {subtaskData.dueDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Due: {formatDate(subtaskData.dueDate)}</span>
                    </div>
                  )}

                  {subtaskData.assignedTo && subtaskData.assignedTo.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned To</h3>
                      <div className="flex flex-wrap gap-2">
                        {subtaskData.assignedTo.map((user, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{user.fullName || user.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {subtaskData.task && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Parent Task</h3>
                      <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <Target className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{subtaskData.task.title || 'Unknown Task'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments */}
              {subtaskData.attachments && subtaskData.attachments.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
                  
                  <div className="space-y-3">
                    {subtaskData.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{attachment.filename || 'Unknown File'}</span>
                        </div>
                        <span className="text-xs text-gray-500">{attachment.size || 'Unknown Size'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {subtaskData.comments && subtaskData.comments.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
                  
                  <div className="space-y-4">
                    {subtaskData.comments.map((comment, index) => (
                      <div key={index} className="border-l-4 border-gray-200 pl-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{comment.user?.fullName || 'Unknown User'}</span>
                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Progress and Stats */}
            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Subtask Progress</span>
                      <span className="text-gray-900 font-medium">{subtaskData.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
                        style={{ width: `${subtaskData.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {subtaskData.status === 'completed' ? '100%' : '0%'}
                      </div>
                      <div className="text-sm text-gray-600">Completion</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtask Stats */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Subtask Details</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm text-gray-900">{formatDate(subtaskData.createdAt)}</span>
                  </div>
                  
                  {subtaskData.completedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="text-sm text-gray-900">{formatDate(subtaskData.completedAt)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sequence</span>
                    <span className="text-sm text-gray-900">{subtaskData.sequence || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Priority</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(subtaskData.priority)}`}>
                      {formatPriority(subtaskData.priority)}
                    </span>
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

export default CustomerSubtaskDetail;