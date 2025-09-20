import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeNavbar from '../components/Employee-Navbar';
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
  Send,
  X,
  CheckSquare,
  FolderKanban,
  Users,
  Edit,
  Trash2,
  MoreVertical,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api, { commentApi } from '../utils/api';

const EmployeeMilestoneDetail = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const projectId = searchParams.get('projectId');
  const [milestone, setMilestone] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAttachment, setNewAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingAttachment, setDownloadingAttachment] = useState(null);

  // Scroll to top when component mounts
  useScrollToTop();

  useEffect(() => {
    if (id && projectId) {
      loadMilestone();
      loadTasks();
    } else {
      toast.error('Error', 'Missing milestone or project ID');
      navigate('/employee/projects');
    }
  }, [id, projectId]);

  // Refresh milestone data when user navigates back to this page
  useEffect(() => {
    const handleFocus = () => {
      if (id && projectId) {
        console.log('Page focused, refreshing milestone data...');
        loadMilestone();
        loadTasks();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && id && projectId) {
        console.log('Page became visible, refreshing milestone data...');
        loadMilestone();
        loadTasks();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id, projectId]);

  const loadMilestone = async () => {
    try {
      setIsLoading(true);
      
      if (!id || !projectId) {
        toast.error('Error', 'Missing milestone or project ID');
        navigate('/employee/projects');
        return;
      }

      // Fetch the real milestone from the API
      const response = await api.get(`/employee/milestones/${id}/project/${projectId}`);
      
      if (response.data.success) {
        const milestoneData = response.data.data.milestone;
        setMilestone(milestoneData);
        setProject(response.data.data.project);
        
        // Auto-recalculate progress if it's 0 and there are tasks
        if (milestoneData.progress === 0) {
          console.log('Milestone progress is 0, attempting auto-recalculation...');
          try {
            await api.post(`/employee/milestones/${id}/recalculate-progress`);
            // Reload milestone after recalculation
            const updatedResponse = await api.get(`/employee/milestones/${id}/project/${projectId}`);
            if (updatedResponse.data.success) {
              setMilestone(updatedResponse.data.data.milestone);
            }
          } catch (recalcError) {
            console.log('Auto-recalculation failed, user can manually recalculate:', recalcError);
          }
        }
      } else {
        toast.error('Error', response.data.message || 'Failed to load milestone');
        navigate('/employee/projects');
      }
    } catch (error) {
      console.error('Error loading milestone:', error);
      toast.error('Error', 'Failed to load milestone');
      navigate('/employee/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      if (!id || !projectId) return;
      
      const response = await api.get(`/employee/tasks/milestone/${id}/project/${projectId}`);
      if (response.data.success && response.data.data) {
        setTasks(response.data.data.tasks || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await commentApi.addEmployeeMilestoneComment(id, newComment.trim());
      
      if (response.data.success) {
        toast.success('Success', 'Comment added successfully');
        setNewComment('');
        // Reload milestone to show new comment
        loadMilestone();
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
        const response = await commentApi.deleteEmployeeMilestoneComment(id, commentId);
        
        if (response.data.success) {
          toast.success('Success', 'Comment deleted successfully');
          // Reload milestone to remove deleted comment
          loadMilestone();
        } else {
          toast.error('Error', response.data.message || 'Failed to delete comment');
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast.error('Error', 'Failed to delete comment');
      }
    }
  };

  const handleRecalculateProgress = async () => {
    try {
      const response = await api.post(`/employee/milestones/${id}/recalculate-progress`);
      if (response.data && response.data.success) {
        toast.success('Success', 'Milestone progress recalculated successfully');
        loadMilestone(); // Reload milestone to get updated progress
      } else {
        toast.error('Error', 'Failed to recalculate progress - invalid response');
      }
    } catch (error) {
      console.error('Error recalculating progress:', error);
      const errorMessage = error.message || 'Failed to recalculate progress';
      toast.error('Error', errorMessage);
    }
  };

  const handleRefreshData = async () => {
    try {
      console.log('Manually refreshing milestone data...');
      await loadMilestone();
      await loadTasks();
      toast.success('Success', 'Milestone data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Error', 'Failed to refresh milestone data');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployeeNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading milestone...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployeeNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600">Milestone not found</p>
            <button
              onClick={() => navigate('/employee/projects')}
              className="mt-4 text-primary hover:text-primary-dark"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(`/employee/project-details/${projectId}`)}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </button>
          
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex-shrink-0">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{milestone.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(milestone.status)}`}>
                  {milestone.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Milestone Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Milestone Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-base text-gray-900 mt-1">{milestone.description || 'No description provided'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Due Date</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'No due date set'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Assigned To</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {milestone.assignedTo?.fullName || 'Unassigned'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Project</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {project?.name || 'Unknown Project'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Progress</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefreshData}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={handleRecalculateProgress}
                    className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-1"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Recalculate</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Milestone Progress</span>
                  <span className="font-medium text-gray-900">{milestone.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-300"
                    style={{ width: `${milestone.progress || 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  Based on completed tasks in this milestone
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks ({tasks.length})</h2>
              
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                  <p className="text-gray-600">Tasks for this milestone will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attachments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
              
              {milestone.attachments && milestone.attachments.length > 0 ? (
                <div className="space-y-3">
                  {milestone.attachments.map((attachment, index) => (
                    <div key={attachment.cloudinaryId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIcon(attachment.mimetype)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.originalName}</p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB • 
                            Uploaded {new Date(attachment.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => window.open(attachment.url, '_blank')}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View file"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => window.open(attachment.url, '_blank')}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Paperclip className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No attachments yet</h3>
                  <p className="text-gray-600">Files will appear here when uploaded</p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                  <span className="text-sm text-gray-500">({milestone.comments?.length || 0})</span>
                </div>
              </div>

              {/* Existing Comments */}
              {milestone.comments && milestone.comments.length > 0 && (
                <div className="space-y-4 mb-6">
                  {milestone.comments.map((comment) => (
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
              {(!milestone.comments || milestone.comments.length === 0) && (
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
                    placeholder="Add a comment to this milestone..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  />
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Comment
                    </button>
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

export default EmployeeMilestoneDetail;
