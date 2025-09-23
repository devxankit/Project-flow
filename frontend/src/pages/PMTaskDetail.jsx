import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckSquare, 
  Calendar, 
  User, 
  Flag, 
  Target, 
  Clock, 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  Paperclip,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquare,
  X
} from 'lucide-react';
import { Button } from '../components/magicui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/magicui/dialog';
import { taskApi, subtaskApi, commentApi, handleApiError } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import PMNavbar from '../components/PM-Navbar';
import AttachmentDisplay from '../components/AttachmentDisplay';
import SubtaskForm from '../components/SubtaskForm';

const PMTaskDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('customerId');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubtaskFormOpen, setIsSubtaskFormOpen] = useState(false);

  useEffect(() => {
    console.log('PMTaskDetail - Parameters:', { id, customerId, customerIdType: typeof customerId });
    
    if (id && customerId && customerId !== 'undefined' && customerId !== 'null') {
      loadTask();
      loadSubtasks();
    } else {
      console.error('Missing or invalid required parameters:', { id, customerId, customerIdType: typeof customerId });
      toast.error('Error', 'Missing or invalid task or customer ID');
      navigate('/tasks');
    }
  }, [id, customerId]);

  const loadTask = async () => {
    try {
      setIsLoading(true);
      console.log('Loading task with ID:', id, 'Customer ID:', customerId, 'Type:', typeof customerId);
      
      // Ensure customerId is a string
      const customerIdString = String(customerId);
      console.log('Customer ID as string:', customerIdString);
      
      const response = await taskApi.getTask(id, customerIdString);
      console.log('Task API response:', response);
      
      if (response.success) {
        setTask(response.data.task);
      } else {
        console.error('Task API error:', response.message);
        toast.error('Error', response.message || 'Failed to load task');
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Error loading task:', error);
      handleApiError(error, toast);
      navigate('/tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubtasks = async () => {
    try {
      const response = await subtaskApi.getSubtasksByTask(id, customerId);
      if (response.success) {
        setSubtasks(response.data.subtasks || []);
      }
    } catch (error) {
      console.error('Error loading subtasks:', error);
      // Don't show error toast for subtasks as it's not critical
    }
  };

  const handleSubtaskSubmit = (subtaskData) => {
    // Refresh task data and subtasks after creating a new subtask
    loadTask();
    loadSubtasks();
    setIsSubtaskFormOpen(false);
  };

  const handleDeleteTask = async () => {
    try {
      setIsDeleting(true);
      const response = await taskApi.deleteTask(id, customerId);
      
      if (response.success) {
        toast.success('Success', 'Task deleted successfully');
        navigate(`/customer-details/${customerId}`);
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

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await commentApi.addTaskComment(id, newComment.trim());
      
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
        const response = await commentApi.deleteTaskComment(id, commentId);
        
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <PMNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg text-gray-600">Loading task details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <PMNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h2>
            <p className="text-gray-600 mb-4">The task you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/customers')} className="bg-primary hover:bg-primary-dark">
              Back to Customers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/customer-details/${customerId}`)}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customer
          </Button>
          
          {/* Header Section - Responsive Layout */}
          <div className="space-y-4">
            {/* Task Info Section */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex-shrink-0">
                <CheckSquare className="h-8 w-8 text-primary" />
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
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/edit-task/${id}?customerId=${customerId}`)}
                  className="text-gray-600 hover:text-gray-900 flex-1 sm:flex-none"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Description</span>
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {task.description || 'No description provided'}
              </p>
            </div>

            {/* Subtasks Section */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Subtasks</h3>
                    <p className="text-sm text-gray-600">Subtasks assigned to this task</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-500">
                    {subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}
                  </div>
                  <Button
                    onClick={() => setIsSubtaskFormOpen(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>Add Subtask</span>
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
                      onClick={() => {
                        console.log('Navigating to subtask with params:', { subtaskId: subtask._id, taskId: id, customerId });
                        if (customerId && customerId !== 'undefined' && customerId !== 'null') {
                          navigate(`/pm-subtask/${subtask._id}?taskId=${id}&customerId=${customerId}`);
                        } else {
                          toast.error('Error', 'Invalid customer ID');
                        }
                      }}
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

            {/* Attachments */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <AttachmentDisplay 
                attachments={task.attachments || []} 
                canDelete={false}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Task Details */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h3>
              
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
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Due Date</label>
                  <p className="text-base font-medium text-gray-900 flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-base font-medium text-gray-900 flex items-center space-x-2 mt-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>

                {task.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Completed</label>
                    <p className="text-base font-medium text-gray-900 flex items-center space-x-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{new Date(task.completedAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Team */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Assigned Team</span>
              </h3>
              {task.assignedTo && task.assignedTo.length > 0 ? (
                <div className="space-y-3">
                  {task.assignedTo.map((member) => (
                    <div key={member._id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No team members assigned</p>
              )}
            </div>

            {/* Customer & Task Info */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="text-base font-medium text-gray-900">{task.customer?.name || 'Unknown Customer'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Task</label>
                  <p className="text-base font-medium text-gray-900">{task.title || 'Unknown Task'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
              <span className="text-sm text-gray-500">({task.comments?.length || 0})</span>
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
                        {formatDate(comment.timestamp)}
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
                  onClick={handleCommentSubmit}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
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
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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

      {/* Subtask Form - Only render when dialog is open */}
      {isSubtaskFormOpen && (
        <SubtaskForm
          isOpen={isSubtaskFormOpen}
          onClose={() => setIsSubtaskFormOpen(false)}
          onSubmit={handleSubtaskSubmit}
          taskId={id}
          customerId={customerId}
        />
      )}
    </div>
  );
};

export default PMTaskDetail;