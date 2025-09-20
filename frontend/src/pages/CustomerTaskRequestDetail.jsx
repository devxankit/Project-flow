import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../components/Customer-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Target,
  Flag,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Building2,
  MessageSquare,
  Loader2,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const CustomerTaskRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [taskRequest, setTaskRequest] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useScrollToTop();

  useEffect(() => {
    const fetchTaskRequest = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/task-requests/customer/${id}`);
        if (response.data.success) {
          setTaskRequest(response.data.data);
        } else {
          toast.error('Error', 'Task request not found');
          navigate('/customer-task-requests');
        }
      } catch (error) {
        console.error('Error fetching task request:', error);
        toast.error('Error', 'Failed to load task request');
        navigate('/customer-task-requests');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTaskRequest();
    }
  }, [id, navigate, toast]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return Clock;
      case 'Approved': return CheckCircle;
      case 'Rejected': return XCircle;
      case 'In Progress': return AlertCircle;
      case 'Completed': return CheckCircle;
      default: return Clock;
    }
  };

  const getReasonLabel = (reason) => {
    switch (reason) {
      case 'bug-fix': return 'Bug Fix Required';
      case 'feature-request': return 'New Feature Request';
      case 'improvement': return 'Improvement Suggestion';
      case 'change-request': return 'Change Request';
      case 'additional-work': return 'Additional Work Required';
      case 'other': return 'Other';
      default: return reason;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    if (taskRequest.status === 'Pending') {
      navigate(`/customer-task-request/${id}/edit`);
    } else {
      toast.error('Cannot Edit', 'Only pending requests can be edited');
    }
  };

  const handleDelete = async () => {
    if (taskRequest.status !== 'Pending') {
      toast.error('Cannot Delete', 'Only pending requests can be deleted');
      return;
    }

    if (window.confirm('Are you sure you want to delete this task request? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        const response = await api.delete(`/task-requests/customer/${id}`);
        if (response.data.success) {
          toast.success('Success', 'Task request deleted successfully');
          navigate('/customer-task-requests');
        } else {
          toast.error('Error', 'Failed to delete task request');
        }
      } catch (error) {
        console.error('Error deleting task request:', error);
        toast.error('Error', 'Failed to delete task request');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading task request...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!taskRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Request Not Found</h2>
                <p className="text-gray-600 mb-4">The task request you're looking for doesn't exist or has been removed.</p>
                <button
                  onClick={() => navigate('/customer-task-requests')}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Back to Requests
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(taskRequest.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <CustomerNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/customer-task-requests')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </button>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{taskRequest.title}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(taskRequest.status)}`}>
                    <StatusIcon className="h-4 w-4 inline mr-1" />
                    {taskRequest.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(taskRequest.priority)}`}>
                    <Flag className="h-4 w-4 inline mr-1" />
                    {taskRequest.priority}
                  </span>
                </div>
              </div>
              
              {taskRequest.status === 'Pending' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleEdit}
                    className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Request
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Project</p>
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {typeof taskRequest.project === 'string' ? taskRequest.project : taskRequest.project?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Milestone</p>
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {typeof taskRequest.milestone === 'string' ? taskRequest.milestone : taskRequest.milestone?.title || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {taskRequest.dueDate ? new Date(taskRequest.dueDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Submitted</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {taskRequest.createdAt ? new Date(taskRequest.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed">{taskRequest.description}</p>
              </div>

              {/* Request Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Request Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Reason</p>
                      <p className="font-semibold text-gray-900">{getReasonLabel(taskRequest.reason)}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Due Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(taskRequest.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Submitted</p>
                      <p className="font-semibold text-gray-900">{formatDate(taskRequest.createdAt)}</p>
                    </div>
                  </div>
                  {taskRequest.reviewedAt && (
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Reviewed</p>
                        <p className="font-semibold text-gray-900">{formatDate(taskRequest.reviewedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Comments */}
              {taskRequest.reviewComments && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    Review Comments
                  </h2>
                  <div className={`p-4 rounded-lg border ${
                    taskRequest.status === 'Rejected' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <p className={`${
                      taskRequest.status === 'Rejected' ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {taskRequest.reviewComments}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Project & Milestone Info */}
            <div className="space-y-6">
              {/* Project Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-primary" />
                  Project Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Project</p>
                    <p className="font-semibold text-gray-900">
                      {typeof taskRequest.project === 'string' ? taskRequest.project : taskRequest.project?.name || 'Unknown Project'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Milestone</p>
                    <p className="font-semibold text-gray-900">
                      {typeof taskRequest.milestone === 'string' ? taskRequest.milestone : taskRequest.milestone?.title || 'Unknown Milestone'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Request Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Request Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Requested By</p>
                    <p className="font-semibold text-gray-900">
                      {typeof taskRequest.requestedBy === 'string' ? taskRequest.requestedBy : taskRequest.requestedBy?.fullName || 'Unknown User'}
                    </p>
                  </div>
                  {taskRequest.reviewedBy && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Reviewed By</p>
                      <p className="font-semibold text-gray-900">
                        {typeof taskRequest.reviewedBy === 'string' ? taskRequest.reviewedBy : taskRequest.reviewedBy?.fullName || 'Unknown User'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Status Timeline
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Request Submitted</p>
                      <p className="text-xs text-gray-500">{formatDate(taskRequest.createdAt)}</p>
                    </div>
                  </div>
                  {taskRequest.reviewedAt && (
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        taskRequest.status === 'Approved' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {taskRequest.status === 'Approved' ? 'Request Approved' : 'Request Rejected'}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(taskRequest.reviewedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerTaskRequestDetail;
