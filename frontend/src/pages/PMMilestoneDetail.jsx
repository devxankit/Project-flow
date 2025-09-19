import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { milestoneApi, taskApi, handleApiError } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
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
  const { toast } = useToast();
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

  // Scroll to top when component mounts
  useScrollToTop();

  // Mock milestone data - all milestones for PM to manage (not used anymore)
  // const milestonesData = [
  /*
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
  */

  const loadMilestone = async () => {
    try {
      setIsLoading(true);
      
      if (!id || !projectId) {
        toast.error('Error', 'Missing milestone or project ID');
        navigate('/projects');
        return;
      }

      // Fetch the real milestone from the API
      const response = await milestoneApi.getMilestone(id, projectId);
      
      if (response.success) {
        setMilestone(response.data.milestone);
        setProject(response.data.project);
        // Load tasks for this milestone
        await loadTasks();
      } else {
        toast.error('Error', response.message || 'Failed to load milestone');
        navigate('/projects');
      }
    } catch (error) {
      console.error('Error loading milestone:', error);
      toast.error('Error', 'Failed to load milestone details');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      if (!id || !projectId) return;
      
      const response = await taskApi.getTasksByMilestone(id, projectId);
      if (response.success && response.data) {
        setTasks(response.data.tasks || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Don't show error toast for tasks as it's not critical
    }
  };

  // Use the real milestone data from the API
  const currentMilestone = milestone;

  // Load milestone data on component mount
  useEffect(() => {
    if (id && projectId) {
      loadMilestone();
    }
  }, [id, projectId]);

  // If milestone not found, redirect to projects page
  useEffect(() => {
    if (!currentMilestone && !isLoading) {
      navigate('/projects');
    }
  }, [currentMilestone, isLoading, navigate]);

  // Countdown logic
  useEffect(() => {
    if (!currentMilestone) return;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const dueDate = new Date(currentMilestone.dueDate);
      const difference = dueDate.getTime() - now.getTime();

      if (difference > 0) {
        // Milestone is not overdue - show remaining time
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeLeft(`${days} day${days > 1 ? 's' : ''} remaining`);
        } else if (hours > 0) {
          setTimeLeft(`${hours} hour${hours > 1 ? 's' : ''} remaining`);
        } else {
          setTimeLeft(`${minutes} minute${minutes > 1 ? 's' : ''} remaining`);
        }
      } else {
        // Milestone is overdue
        const overdueDays = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
        setTimeLeft(`Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentMilestone?.dueDate]);
  
  // Return early if loading or milestone not found
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PMNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading milestone details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentMilestone) {
    return null;
  }


  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
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
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
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
    const now = new Date();
    const dueDate = new Date(currentMilestone.dueDate);
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
                  <div className={`p-2 rounded-lg ${getStatusColor(currentMilestone.status)}`}>
                    <Target className="h-5 w-5" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{currentMilestone.title}</h1>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentMilestone.status)}`}>
                    {formatStatus(currentMilestone.status)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(currentMilestone.priority)}`}>
                    {formatPriority(currentMilestone.priority)}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-semibold ${getCountdownColor()}`}>
                  {timeLeft}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Due: {new Date(currentMilestone.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900 font-medium">{currentMilestone.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-300"
                  style={{ width: `${currentMilestone.progress || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Milestone Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{currentMilestone.description}</p>
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
                    <p className="text-base font-medium text-gray-900">
                      {currentMilestone.assignedTo && currentMilestone.assignedTo.length > 0 
                        ? currentMilestone.assignedTo.map(user => user.fullName || user.name).join(', ')
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
                      {new Date(currentMilestone.createdAt).toLocaleDateString()}
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
                      <p className="text-base font-medium text-gray-900">
                        {project?.name || 'Unknown Project'}
                      </p>
                    </div>
                  </div>

                {currentMilestone.completedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Completed</p>
                      <p className="text-base font-medium text-gray-900">
                        {new Date(currentMilestone.completedAt).toLocaleDateString()}
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
                      currentMilestone.status === option.value
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                  <p className="text-sm text-gray-600">Tasks assigned to this milestone</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                  <p className="text-gray-600">Tasks will appear here when they are created for this milestone</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div 
                    key={task._id} 
                    onClick={() => navigate(`/pm-task/${task._id}?projectId=${projectId}`)}
                    className="group bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200 cursor-pointer border border-gray-200 hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status === 'completed' ? 'Completed' :
                             task.status === 'in-progress' ? 'In Progress' :
                             'Pending'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            task.priority === 'low' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.priority === 'urgent' ? 'Urgent' :
                             task.priority === 'high' ? 'High' :
                             task.priority === 'low' ? 'Low' :
                             'Normal'}
                          </span>
                          {task.assignedTo && task.assignedTo.length > 0 && (
                            <span className="text-xs text-gray-500">
                              Assigned to: {task.assignedTo[0].fullName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Paperclip className="h-5 w-5 text-primary" />
                </div>
              <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
              <span className="text-sm text-gray-500">({currentMilestone.attachments?.length || 0})</span>
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
              {currentMilestone.attachments?.map((attachment, index) => (
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

            {(!currentMilestone.attachments || currentMilestone.attachments.length === 0) && !newAttachment && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Paperclip className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attachments yet</h3>
                <p className="text-gray-600">Upload files to share with your team</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default PMMilestoneDetail;
