import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import EmployeeNavbar from '../components/Employee-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { taskApi, subtaskApi, commentApi, handleApiError } from '../utils/api';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Target, 
  Calendar, 
  User, 
  Clock,
  FileText,
  MessageSquare,
  Paperclip,
  ArrowLeft,
  Eye,
  Download,
  Upload,
  Send,
  X,
  CheckSquare,
  Building2,
  Users,
  Edit,
  Trash2,
  MoreVertical,
  TrendingUp,
  BarChart3,
  Plus
} from 'lucide-react';
import { Button } from '../components/magicui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/magicui/dialog';
import SubtaskForm from '../components/SubtaskForm';

const EmployeeTaskDetail = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('customerId');
  const [task, setTask] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAttachment, setNewAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingAttachment, setDownloadingAttachment] = useState(null);
  const [isSubtaskFormOpen, setIsSubtaskFormOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Scroll to top when component mounts
  useScrollToTop();

  useEffect(() => {
    if (id && customerId) {
      loadTask();
    } else {
      toast.error('Error', 'Missing task or customer ID');
      navigate('/employee-customers');
    }
  }, [id, customerId]);

  const loadTask = async () => {
    try {
      setIsLoading(true);
      
      if (!id || !customerId) {
        toast.error('Error', 'Missing task or customer ID');
        navigate('/employee-customers');
        return;
      }

      // Fetch the task from the API
      const response = await taskApi.getTask(id, customerId);
      
      if (response.success) {
        setTask(response.data.task);
        setCustomer(response.data.customer);
        // Load subtasks for this task
        await loadSubtasks();
        // Calculate time left
        calculateTimeLeft(response.data.task.dueDate);
      } else {
        toast.error('Error', response.message || 'Failed to load task');
        navigate('/employee-customers');
      }
    } catch (error) {
      console.error('Error loading task:', error);
      toast.error('Error', 'Failed to load task details');
      navigate('/employee-customers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubtasks = async () => {
    try {
      if (!id || !customerId) return;
      
      const response = await subtaskApi.getSubtasksByTask(id, customerId);
      if (response.success && response.data) {
        setSubtasks(response.data.subtasks || []);
      }
    } catch (error) {
      console.error('Error loading subtasks:', error);
      // Don't show error toast for subtasks as it's not critical
    }
  };

  const calculateTimeLeft = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const difference = due.getTime() - now.getTime();
    const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (difference < 0) {
      setTimeLeft('Overdue');
    } else if (daysLeft > 0) {
      setTimeLeft(`${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`);
    } else if (hoursLeft > 0) {
      setTimeLeft(`${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} left`);
    } else {
      setTimeLeft('Due today');
    }
  };

  const handleDeleteTask = async () => {
    try {
      setIsDeleting(true);
      const response = await taskApi.deleteTask(id, customerId);
      
      if (response.success) {
        toast.success('Success', 'Task deleted successfully');
        navigate(`/employee-customer/${customerId}`);
      } else {
        toast.error('Error', response.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      handleApiError(error, toast);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSubtaskSubmit = () => {
    // Refresh subtasks after creating a new one
    loadSubtasks();
    setIsSubtaskFormOpen(false);
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
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatPriority = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'High';
      case 'normal': return 'Normal';
      case 'low': return 'Low';
      default: return priority;
    }
  };

  const getCountdownColor = () => {
    if (!task) return 'text-blue-600';
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const difference = dueDate.getTime() - now.getTime();
    const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (difference < 0) {
      return 'text-red-600'; // Overdue
    } else if (daysLeft <= 1) {
      return 'text-orange-600'; // Critical
    } else if (daysLeft <= 3) {
      return 'text-yellow-600'; // Warning
    } else {
      return 'text-blue-600'; // Normal
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'png': return '🖼️';
      case 'jpg': return '🖼️';
      case 'jpeg': return '🖼️';
      case 'md': return '📝';
      case 'docx': return '📝';
      case 'fig': return '🎨';
      default: return '📎';
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!id) return;
    try {
      const response = await api.employee.updateTaskStatus(id, newStatus);
      if (response.data && response.data.success) {
        toast.success('Success', 'Task status updated');
        await loadTask();
      } else {
        toast.error('Error', response.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error', 'Failed to update status');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await commentApi.addEmployeeTaskComment(id, newComment.trim());
      
        if (response.data.success) {
        toast.success('Success', 'Comment added successfully');
        setNewComment('');
        // Reload task to show new comment
        loadTask();
      } else {
        toast.error('Error', response.data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error', 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const response = await commentApi.deleteEmployeeTaskComment(id, commentId);
        
        if (response.data.success) {
          toast.success('Success', 'Comment deleted successfully');
          // Reload task to remove deleted comment
          loadTask();
        } else {
          toast.error('Error', response.data.message || 'Failed to delete comment');
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast.error('Error', 'Failed to delete comment');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <EmployeeNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-lg text-gray-600">Loading task details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <EmployeeNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h2>
            <p className="text-gray-600 mb-4">The task you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/employee-customers')} className="bg-primary hover:bg-primary-dark">
              Back to Customers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <EmployeeNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/employee-customer/${customerId}`)}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customer
          </Button>
          
          {/* Header Section - Responsive Layout */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Task Info Section */}
            <div className="flex items-start space-x-4 flex-1">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex-shrink-0">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{task.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                    {formatStatus(task.status)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                    {formatPriority(task.priority)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons Section */}
            <div className="flex gap-2 lg:flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => navigate(`/edit-task/${id}?customerId=${customerId}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Edit className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Task Overview Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {formatStatus(task.status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                  {formatPriority(task.priority)}
                </span>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-semibold ${getCountdownColor()}`}>
                  {timeLeft}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900 font-medium">{task.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Task Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{task.description || 'No description provided'}</p>
            </div>

            {/* Task Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Assigned to</p>
                    <p className="text-base font-medium text-gray-900">
                      {task.assignedTo && task.assignedTo.length > 0 
                        ? task.assignedTo.map(user => user.fullName || user.name).join(', ')
                        : 'No one assigned'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Created</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Customer</p>
                    <p className="text-base font-medium text-gray-900">
                      {customer?.name || 'Unknown Customer'}
                    </p>
                  </div>
                </div>

                {task.completedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Completed</p>
                      <p className="text-base font-medium text-gray-900">
                        {new Date(task.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Update Section */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      task.status === option.value
                        ? `${option.color} border-2 border-current`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Subtasks</h3>
                  <p className="text-sm text-gray-600">Subtasks assigned to this task</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-sm text-gray-500">
                  {subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}
                </div>
                <Button
                  onClick={() => setIsSubtaskFormOpen(true)}
                  className="bg-primary hover:bg-primary-dark text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Subtask
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {subtasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No subtasks yet</h3>
                  <p className="text-gray-600">Subtasks will appear here when they are created for this task</p>
                </div>
              ) : (
                subtasks.map((subtask) => (
                  <div 
                    key={subtask._id} 
                    onClick={() => navigate(`/employee-subtask/${subtask._id}?taskId=${id}&customerId=${customerId}`)}
                    className="group bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200 cursor-pointer border border-gray-200 hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                          {subtask.title}
                        </h4>
                        {subtask.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {subtask.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subtask.status === 'completed' ? 'bg-green-100 text-green-800' :
                            subtask.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {subtask.status === 'completed' ? 'Completed' :
                             subtask.status === 'in-progress' ? 'In Progress' :
                             'Pending'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subtask.priority === 'high' ? 'bg-red-100 text-red-800' :
                            subtask.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            subtask.priority === 'low' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {subtask.priority === 'urgent' ? 'Urgent' :
                             subtask.priority === 'high' ? 'High' :
                             subtask.priority === 'low' ? 'Low' :
                             'Normal'}
                          </span>
                          {subtask.assignedTo && subtask.assignedTo.length > 0 && (
                            <span className="text-xs text-gray-500">
                              Assigned to: {subtask.assignedTo[0].fullName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Due: {new Date(subtask.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Attachments Section */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Paperclip className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                  <p className="text-sm text-gray-600">{task.attachments.length} file{task.attachments.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {task.attachments.map((attachment, index) => (
                  <div key={attachment.cloudinaryId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(attachment.mimetype)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {attachment.size} bytes • 
                          Uploaded {new Date(attachment.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <a 
                        href={attachment.url} 
                        download={attachment.originalName}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                <p className="text-sm text-gray-600">{task.comments?.length || 0} comment{(task.comments?.length || 0) !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Existing Comments */}
            {task.comments && task.comments.length > 0 && (
              <div className="space-y-4 mb-6">
                {task.comments.map((comment) => (
                  <div key={comment._id || comment.id} className="border-l-4 border-primary/20 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {comment.user?.fullName || comment.user || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      {/* Show delete button only for current user's comments */}
                      {(comment.user?._id || comment.user?.id || comment.user) === user?.id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id || comment.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete comment"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{comment.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State for Comments */}
            {(!task.comments || task.comments.length === 0) && (
              <div className="text-center py-8 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                <p className="text-gray-600">Comments from team members will appear here</p>
              </div>
            )}

            {/* Add Comment Form */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment to this task..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                />
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtask Form Dialog */}
      {isSubtaskFormOpen && (
        <SubtaskForm
          isOpen={isSubtaskFormOpen}
          onClose={() => setIsSubtaskFormOpen(false)}
          onSubmit={handleSubtaskSubmit}
          taskId={id}
          customerId={customerId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-500" />
              <span>Delete Task</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
};

export default EmployeeTaskDetail;