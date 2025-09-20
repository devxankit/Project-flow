import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../components/Customer-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
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
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const CustomerMilestoneDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [milestoneData, setMilestoneData] = useState(null);

  // Milestone data is now fetched from API

  // Fetch milestone data
  useEffect(() => {
    const fetchMilestoneData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/customer/milestones/${id}`);
        if (response.data.success) {
          setMilestoneData(response.data.data);
        } else {
          toast.error('Error', 'Milestone not found');
          navigate('/customer-dashboard');
        }
      } catch (error) {
        console.error('Error fetching milestone data:', error);
        toast.error('Error', 'Failed to load milestone data');
        navigate('/customer-dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMilestoneData();
    }
  }, [id, navigate]);

  // Calculate time left until due date - moved before early returns to maintain hook order
  useEffect(() => {
    if (!milestoneData?.milestone?.dueDate) return;
    
    const dueDate = new Date(milestoneData.milestone.dueDate);
    const now = new Date();
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      setTimeLeft(`${diffDays} days left`);
    } else if (diffDays === 0) {
      setTimeLeft('Due today');
    } else {
      setTimeLeft(`${Math.abs(diffDays)} days overdue`);
    }
  }, [milestoneData?.milestone?.dueDate]);

  // Scroll to top when component mounts
  useScrollToTop();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading milestone details...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Return early if no milestone data
  if (!milestoneData) {
    return null;
  }

  // Extract milestone data
  const { milestone, tasks } = milestoneData;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-primary/10 text-primary border-primary/20';
      case 'in-progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'active': return 'In Progress';
      case 'in-progress': return 'In Progress';
      case 'planning': return 'Planning';
      case 'on-hold': return 'On Hold';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return CheckCircle;
      case 'In Progress': return Clock;
      case 'Not Started': return AlertTriangle;
      default: return AlertTriangle;
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

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'png': return '🖼️';
      case 'jpg': return '🖼️';
      case 'jpeg': return '🖼️';
      case 'zip': return '📦';
      default: return '📎';
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post(`/customer/milestones/${id}/files`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.success) {
          toast.success('Success', `${file.name} uploaded successfully`);
          // Refresh milestone data to show new file
          const milestoneResponse = await api.get(`/customer/milestones/${id}`);
          if (milestoneResponse.data.success) {
            setMilestoneData(milestoneResponse.data.data);
          }
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Error', `Failed to upload ${file.name}`);
      }
    }
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeUploadedFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const response = await api.delete(`/customer/milestones/${id}/files/${fileId}`);
        if (response.data.success) {
          toast.success('Success', 'File deleted successfully');
          // Refresh milestone data to remove deleted file
          const milestoneResponse = await api.get(`/customer/milestones/${id}`);
          if (milestoneResponse.data.success) {
            setMilestoneData(milestoneResponse.data.data);
          }
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        toast.error('Error', 'Failed to delete file');
      }
    }
  };

  // Files are now uploaded directly via API, no need for this function

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await api.post(`/customer/milestones/${id}/comments`, {
        comment: newComment.trim()
      });
      
      if (response.data.success) {
        toast.success('Success', 'Comment added successfully');
        setNewComment('');
        // Refresh milestone data to show new comment
        const milestoneResponse = await api.get(`/customer/milestones/${id}`);
        if (milestoneResponse.data.success) {
          setMilestoneData(milestoneResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error', 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const response = await api.delete(`/customer/milestones/${id}/comments/${commentId}`);
        if (response.data.success) {
          toast.success('Success', 'Comment deleted successfully');
          // Refresh milestone data to remove deleted comment
          const milestoneResponse = await api.get(`/customer/milestones/${id}`);
          if (milestoneResponse.data.success) {
            setMilestoneData(milestoneResponse.data.data);
          }
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast.error('Error', 'Failed to delete comment');
      }
    }
  };

  if (!milestone) {
    return null;
  }

  const StatusIcon = getStatusIcon(milestone.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <CustomerNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-4xl md:mx-auto md:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>

          {/* Milestone Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">{milestone.title}</h1>
                </div>
                <p className="text-gray-600 mb-4">{milestone.description}</p>
                
                {/* Status Badge */}
                <div className="flex items-center space-x-2 mb-4">
                  <StatusIcon className="h-4 w-4" />
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(milestone.status)}`}>
                    {milestone.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">{milestone.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${milestone.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestone Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Due Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(milestone.dueDate)}</p>
                  <p className="text-xs text-gray-500">{timeLeft}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Assigned To</p>
                  <p className="text-sm font-medium text-gray-900">{milestone.assignee?.fullName || milestone.assignee?.name || 'Unassigned'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Project</p>
                  <p className="text-sm font-medium text-gray-900">{milestone.project?.name || milestone.project?.title || 'Unknown Project'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(milestone.createdDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Paperclip className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                  <span className="text-sm text-gray-500">({(milestone.attachments?.length || 0) + uploadedFiles.length})</span>
                </div>
              </div>
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="flex items-center space-x-1 px-2 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-xs font-medium"
              >
                <Plus className="h-3 w-3" />
                <span>Add Files</span>
              </button>
            </div>

            {/* Upload Form */}
            {showUploadForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-4">Upload files for reference</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip,.rar"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </label>
                </div>

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Files to upload:</h4>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getFileIcon(file.type)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeUploadedFile(file.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={handleUploadSubmit}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        Upload Files
                      </button>
                      <button
                        onClick={() => {
                          setUploadedFiles([]);
                          setShowUploadForm(false);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Existing Attachments */}
            {((milestone.attachments?.length || 0) > 0 || uploadedFiles.length > 0) && (
              <div className="space-y-3">
                {(milestone.attachments || []).map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <span className="text-lg">{getFileIcon(attachment.type)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{attachment.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-colors" title="Preview">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-colors" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {(milestone.attachments?.length || 0) === 0 && uploadedFiles.length === 0 && !showUploadForm && (
              <div className="text-center py-8">
                <Paperclip className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No attachments yet</p>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Upload files for reference
                </button>
              </div>
            )}
          </div>

          {/* Comments Section */}
          {milestone.comments && milestone.comments.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                  <span className="text-sm text-gray-500">({milestone.comments?.length || 0})</span>
                </div>
              </div>

              <div className="space-y-4">
                {(milestone.comments || []).map((comment) => (
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
            </div>
          )}

          {/* Empty State for Comments */}
          {(!milestone.comments || milestone.comments.length === 0) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                <p className="text-gray-600">Comments from team members will appear here</p>
              </div>
            </div>
          )}

          {/* Add Comment Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Add Comment</h3>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment to this milestone..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
              
              <div className="flex justify-end">
                <button
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerMilestoneDetail;
