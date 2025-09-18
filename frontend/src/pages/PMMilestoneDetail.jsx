import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
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

const PMMilestoneDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAttachment, setNewAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mock milestone data - all milestones for PM to manage
  const milestonesData = [
    {
      id: 1,
      title: 'Design Phase',
      description: 'Complete the design phase including wireframes, mockups, and user interface design. This phase focuses on creating a solid foundation for the development work.',
      status: 'Completed',
      progress: 100,
      dueDate: '2024-01-15',
      project: 'Website Redesign',
      createdDate: '2024-01-01',
      completedDate: '2024-01-15',
      assignee: 'Jane Smith',
      attachments: [
        { id: 1, name: 'wireframes-v1.fig', size: '3.2 MB', type: 'fig', uploadedBy: 'Jane Smith', uploadDate: '2024-01-10' },
        { id: 2, name: 'design-system.pdf', size: '1.5 MB', type: 'pdf', uploadedBy: 'Jane Smith', uploadDate: '2024-01-12' }
      ],
      comments: [
        {
          id: 1,
          user: 'Jane Smith',
          message: 'Design phase is complete! All wireframes and mockups are ready for development.',
          timestamp: '2024-01-15T17:00:00Z'
        },
        {
          id: 2,
          user: 'John Doe',
          message: 'Great work Jane! The designs look fantastic. Ready to move to development phase.',
          timestamp: '2024-01-15T17:30:00Z'
        }
      ],
      tasks: [
        { id: 1, title: 'Create wireframes', status: 'Completed', assignee: 'Jane Smith' },
        { id: 2, title: 'Design homepage', status: 'Completed', assignee: 'Jane Smith' },
        { id: 3, title: 'Create design system', status: 'Completed', assignee: 'Jane Smith' }
      ]
    },
    {
      id: 2,
      title: 'Development Phase',
      description: 'Implement the designs into functional code. This includes frontend development, backend integration, and responsive design implementation.',
      status: 'In Progress',
      progress: 65,
      dueDate: '2024-02-15',
      project: 'Website Redesign',
      createdDate: '2024-01-16',
      completedDate: null,
      assignee: 'Mike Johnson',
      attachments: [
        { id: 3, name: 'development-guidelines.md', size: '45 KB', type: 'md', uploadedBy: 'Mike Johnson', uploadDate: '2024-01-20' }
      ],
      comments: [
        {
          id: 3,
          user: 'Mike Johnson',
          message: 'Started implementing the homepage. Making good progress on the responsive layout.',
          timestamp: '2024-01-20T14:30:00Z'
        },
        {
          id: 4,
          user: 'Jane Smith',
          message: 'Let me know if you need any clarification on the designs!',
          timestamp: '2024-01-20T16:45:00Z'
        }
      ],
      tasks: [
        { id: 4, title: 'Update homepage design', status: 'In Progress', assignee: 'Mike Johnson' },
        { id: 5, title: 'Implement responsive design', status: 'Not Started', assignee: 'Mike Johnson' },
        { id: 6, title: 'Backend integration', status: 'Not Started', assignee: 'Sarah Wilson' }
      ]
    },
    {
      id: 3,
      title: 'Testing Phase',
      description: 'Comprehensive testing of all features including unit tests, integration tests, and user acceptance testing.',
      status: 'Pending',
      progress: 0,
      dueDate: '2024-02-20',
      project: 'Website Redesign',
      createdDate: '2024-01-25',
      completedDate: null,
      assignee: 'Sarah Wilson',
      attachments: [],
      comments: [],
      tasks: [
        { id: 7, title: 'Unit testing', status: 'Not Started', assignee: 'Sarah Wilson' },
        { id: 8, title: 'Integration testing', status: 'Not Started', assignee: 'Sarah Wilson' },
        { id: 9, title: 'User acceptance testing', status: 'Not Started', assignee: 'John Doe' }
      ]
    },
    {
      id: 4,
      title: 'Launch Phase',
      description: 'Final deployment, monitoring setup, and go-live activities. This includes production deployment and post-launch monitoring.',
      status: 'Pending',
      progress: 0,
      dueDate: '2024-02-25',
      project: 'Website Redesign',
      createdDate: '2024-01-30',
      completedDate: null,
      assignee: 'John Doe',
      attachments: [],
      comments: [],
      tasks: [
        { id: 10, title: 'Production deployment', status: 'Not Started', assignee: 'John Doe' },
        { id: 11, title: 'Monitoring setup', status: 'Not Started', assignee: 'John Doe' },
        { id: 12, title: 'Go-live activities', status: 'Not Started', assignee: 'John Doe' }
      ]
    }
  ];

  // Find the milestone based on the ID parameter
  const milestone = milestonesData.find(m => m.id === parseInt(id));
  
  // If milestone not found, redirect to projects page
  useEffect(() => {
    if (!milestone) {
      navigate('/projects');
    }
  }, [milestone, navigate]);

  // Scroll to top when component mounts
  useScrollToTop();
  
  // Return early if milestone not found
  if (!milestone) {
    return null;
  }

  // Countdown logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const dueDate = new Date(milestone.dueDate);
      const difference = dueDate.getTime() - now.getTime();

      if (difference > 0) {
        // Milestone is not overdue - show remaining time
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`);
        } else if (hours > 0) {
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${minutes}m left`);
        }
      } else {
        // Milestone is overdue - show how many days overdue
        const overdueDays = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
        const overdueHours = Math.floor((Math.abs(difference) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (overdueDays > 0) {
          setTimeLeft(`${overdueDays}d overdue`);
        } else {
          setTimeLeft(`${overdueHours}h overdue`);
        }
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [milestone.dueDate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'Pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCountdownColor = () => {
    const now = new Date();
    const dueDate = new Date(milestone.dueDate);
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

  const handleStatusChange = (newStatus) => {
    // In a real app, this would update the milestone status via API
    console.log('Status changed to:', newStatus);
    // For demo purposes, we'll just show an alert
    alert(`Milestone status updated to: ${newStatus}`);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In a real app, this would add the comment via API
      console.log('New comment:', newComment);
      setNewComment('');
      alert('Comment added successfully!');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, this would upload the file via API
      console.log('File to upload:', file);
      setNewAttachment(file);
      setIsUploading(true);
      
      // Simulate upload
      setTimeout(() => {
        setIsUploading(false);
        setNewAttachment(null);
        alert('File uploaded successfully!');
      }, 2000);
    }
  };

  const statusOptions = [
    { value: 'Pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-primary/10 text-primary' },
    { value: 'Completed', label: 'Completed', color: 'bg-green-100 text-green-800' }
  ];

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-primary/10 text-primary';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-4xl md:mx-auto md:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          {/* Milestone Header Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(milestone.status)}`}>
                    <Target className="h-5 w-5" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{milestone.title}</h1>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                    {milestone.status}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {milestone.progress}% Complete
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-semibold ${getCountdownColor()}`}>
                  {timeLeft}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Due: {new Date(milestone.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900 font-medium">{milestone.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-300"
                  style={{ width: `${milestone.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Milestone Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
            </div>

            {/* Milestone Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Assigned to</p>
                    <p className="text-base font-medium text-gray-900">{milestone.assignee}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Created</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(milestone.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FolderKanban className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Project</p>
                    <p className="text-base font-medium text-gray-900">{milestone.project}</p>
                  </div>
                </div>

                {milestone.completedDate && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Completed</p>
                      <p className="text-base font-medium text-gray-900">
                        {new Date(milestone.completedDate).toLocaleDateString()}
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
                      milestone.status === option.value
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

          {/* Tasks Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
              <span className="text-sm text-gray-500">({milestone.tasks.length})</span>
            </div>

            <div className="space-y-3">
              {milestone.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      task.status === 'Completed' 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300'
                    }`}>
                      {task.status === 'Completed' && (
                        <CheckSquare className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.assignee}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>

            {milestone.tasks.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-600">Add tasks to this milestone to track progress</p>
              </div>
            )}
          </div>

          {/* Attachments Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Paperclip className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                <span className="text-sm text-gray-500">({milestone.attachments.length})</span>
              </div>
              
              {/* File Upload Button */}
              <label className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">Upload</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.docx,.mp4,.fig"
                />
              </label>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-blue-600">Uploading file...</span>
                </div>
              </div>
            )}

            {/* New Attachment Preview */}
            {newAttachment && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(newAttachment.type || 'file')}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{newAttachment.name}</p>
                      <p className="text-xs text-gray-500">{(newAttachment.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNewAttachment(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {milestone.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(attachment.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-xs text-gray-500">{attachment.size} • {attachment.uploadedBy} • {formatTimestamp(attachment.uploadDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {milestone.attachments.length === 0 && !newAttachment && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Paperclip className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attachments yet</h3>
                <p className="text-gray-600">Upload files to share with your team</p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
              <span className="text-sm text-gray-500">({milestone.comments.length})</span>
            </div>

            {/* Add Comment Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  <span className="text-sm font-medium">Add Comment</span>
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {milestone.comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-primary/20 pl-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{comment.user}</span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(comment.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{comment.message}</p>
                </div>
              ))}
            </div>

            {/* Empty State for Comments */}
            {milestone.comments.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                <p className="text-gray-600">Start the conversation by adding a comment</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PMMilestoneDetail;
