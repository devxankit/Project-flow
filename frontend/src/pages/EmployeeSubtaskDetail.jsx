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
import { subtaskApi, commentApi, handleApiError, updateSubtaskStatus } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import EmployeeNavbar from '../components/Employee-Navbar';

const EmployeeSubtaskDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const customerId = searchParams.get('customerId');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [subtask, setSubtask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (id && taskId && customerId) {
      loadSubtask();
    } else {
      toast.error('Error', 'Missing subtask, task, or customer ID');
      navigate('/employee-customers');
    }
  }, [id, taskId, customerId]);

  const loadSubtask = async () => {
    try {
      setIsLoading(true);
      console.log('Loading subtask with ID:', id, 'Task ID:', taskId, 'Customer ID:', customerId);
      
      const response = await subtaskApi.getSubtask(id, taskId, customerId);
      console.log('Subtask API response:', response);
      
      if (response.success) {
        setSubtask(response.data.subtask);
      } else {
        console.error('Subtask API error:', response.message);
        toast.error('Error', response.message || 'Failed to load subtask');
        navigate('/employee-customers');
      }
    } catch (error) {
      console.error('Error loading subtask:', error);
      handleApiError(error, toast);
      navigate('/employee-customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubtaskStatusChange = async (newStatus) => {
    if (!id || !customerId) return;
    try {
      const response = await updateSubtaskStatus(id, customerId, newStatus);
      if (response.success) {
        toast.success('Success', 'Subtask status updated successfully');
        // Update the local state immediately for live changes
        setSubtask(prevSubtask => ({
          ...prevSubtask,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : null,
          completedBy: newStatus === 'completed' ? user?._id : null
        }));
        // Also reload to get the latest data from server
        await loadSubtask();
      } else {
        toast.error('Error', response.message || 'Failed to update subtask status');
      }
    } catch (error) {
      console.error('Error updating subtask status:', error);
      toast.error('Error', error.message || 'Failed to update subtask status');
    }
  };

  const handleDeleteSubtask = async () => {
    try {
      setIsDeleting(true);
      const response = await subtaskApi.deleteSubtask(id, taskId, customerId);
      
      if (response.success) {
        toast.success('Success', 'Subtask deleted successfully');
        navigate(`/employee-task/${taskId}?customerId=${customerId}`);
      } else {
        toast.error('Error', response.message || 'Failed to delete subtask');
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
      handleApiError(error, toast);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await commentApi.addSubtaskComment(id, newComment.trim());
      
      if (response.data.success) {
        toast.success('Success', 'Comment added successfully');
        setNewComment('');
        // Reload subtask to show new comment
        loadSubtask();
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
        const response = await commentApi.deleteSubtaskComment(id, commentId);
        
        if (response.data.success) {
          toast.success('Success', 'Comment deleted successfully');
          // Reload subtask to remove deleted comment
          loadSubtask();
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

  const handleDownload = async (attachment) => {
    try {
      // Use the new file ID-based download route
      const downloadUrl = `/api/files/${attachment._id}`;
      
      // Fetch the file with proper headers
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a blob URL and download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = attachment.originalName || attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <EmployeeNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg text-gray-600">Loading subtask details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!subtask) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <EmployeeNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Subtask Not Found</h2>
            <p className="text-gray-600 mb-4">The subtask you're looking for doesn't exist or has been deleted.</p>
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
            onClick={() => navigate(`/employee-task/${taskId}?customerId=${customerId}`)}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Task
          </Button>
          
          {/* Header Section - Responsive Layout */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Subtask Info Section */}
            <div className="flex items-start space-x-4 flex-1">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex-shrink-0">
                <CheckSquare className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{subtask.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(subtask.status)}`}>
                    {formatStatus(subtask.status)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(subtask.priority)}`}>
                    {formatPriority(subtask.priority)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons Section */}
            <div className="flex gap-2 lg:flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => {/* employees probably shouldn't edit; disable or no-op */}}
                className="text-gray-400 cursor-not-allowed"
                disabled
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
                {subtask.description || 'No description provided'}
              </p>
            </div>

          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Subtask Details */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subtask Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Due Date</label>
                  <p className="text-base font-medium text-gray-900 flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(subtask.dueDate).toLocaleDateString()}</span>
                  </p>
                </div>
                
                {/* Status Update Section - Only for assigned employees */}
                {subtask.assignedTo && subtask.assignedTo._id === user?._id && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Update Status</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { 
                          value: 'pending', 
                          label: 'Pending', 
                          icon: '⏳',
                          activeClass: 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100',
                          inactiveClass: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
                        },
                        { 
                          value: 'in-progress', 
                          label: 'In Progress', 
                          icon: '🔄',
                          activeClass: 'bg-primary/10 text-primary border-primary/20 shadow-primary/20',
                          inactiveClass: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-primary/10 hover:text-primary hover:border-primary/20'
                        },
                        { 
                          value: 'completed', 
                          label: 'Completed', 
                          icon: '✅',
                          activeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100',
                          inactiveClass: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                        },
                        { 
                          value: 'cancelled', 
                          label: 'Cancelled', 
                          icon: '❌',
                          activeClass: 'bg-red-50 text-red-700 border-red-200 shadow-red-100',
                          inactiveClass: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                        }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSubtaskStatusChange(option.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border-2 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 ${
                            subtask.status === option.value
                              ? option.activeClass
                              : option.inactiveClass
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-base">{option.icon}</span>
                            <span>{option.label}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-base font-medium text-gray-900 flex items-center space-x-2 mt-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{new Date(subtask.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>

                {subtask.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Completed</label>
                    <p className="text-base font-medium text-gray-900 flex items-center space-x-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{new Date(subtask.completedAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Paperclip className="h-5 w-5 text-primary" />
                <span>Attachments</span>
                {subtask.attachments && subtask.attachments.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">({subtask.attachments.length})</span>
                )}
              </h3>
              {subtask.attachments && subtask.attachments.length > 0 ? (
                <div className="space-y-2">
                  {subtask.attachments.map((attachment, index) => (
                    <div key={attachment.cloudinaryId || index} className="group">
                      {/* File Info */}
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-xl flex-shrink-0 mt-0.5">{getFileIcon(attachment.mimetype)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate" title={attachment.originalName}>
                            {attachment.originalName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(attachment.size)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(attachment.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDownload(attachment)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Download file"
                        >
                          <Download className="h-3 w-3 inline mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Paperclip className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No attachments</p>
                </div>
              )}
            </div>

            {/* Task & Customer Info */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task & Customer Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Task</label>
                  <p className="text-base font-medium text-gray-900">{subtask.task?.title || 'Unknown Task'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="text-base font-medium text-gray-900">{subtask.customer?.name || 'Unknown Customer'}</p>
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
              <span className="text-sm text-gray-500">({subtask.comments?.length || 0})</span>
            </div>
          </div>

          {/* Existing Comments */}
          {subtask.comments && subtask.comments.length > 0 && (
            <div className="space-y-4 mb-6">
              {subtask.comments.map((comment) => (
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
          {(!subtask.comments || subtask.comments.length === 0) && (
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
                placeholder="Add a comment to this subtask..."
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
              <span>Delete Subtask</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subtask? This action cannot be undone.
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
              onClick={handleDeleteSubtask}
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
                  Delete Subtask
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

export default EmployeeSubtaskDetail;