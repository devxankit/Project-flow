import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../components/Customer-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { 
  CheckSquare, 
  Calendar, 
  User, 
  Clock,
  FileText,
  MessageSquare,
  Paperclip,
  ArrowLeft,
  Eye,
  Download
} from 'lucide-react';

const CustomerTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');

  // Mock task data - read-only for customers
  const tasksData = [
    {
      id: 1,
      title: 'Create wireframes',
      description: 'Design initial wireframes for all pages including homepage, about, services, and contact pages. Focus on user experience and modern design principles.',
      status: 'Completed',
      priority: 'High',
      assignee: 'John Doe',
      dueDate: '2024-01-10',
      project: 'Website Redesign',
      milestone: 'Design Phase',
      createdDate: '2024-01-05',
      completedDate: '2024-01-10',
      attachments: [
        { id: 1, name: 'wireframes-v1.pdf', size: '2.4 MB', type: 'pdf' },
        { id: 2, name: 'design-feedback.docx', size: '156 KB', type: 'docx' }
      ],
      comments: [
        {
          id: 1,
          user: 'John Doe',
          message: 'Initial wireframes completed. Please review and provide feedback.',
          timestamp: '2024-01-10T14:30:00Z'
        },
        {
          id: 2,
          user: 'Jane Smith',
          message: 'Great work! The layout looks clean and intuitive.',
          timestamp: '2024-01-10T16:45:00Z'
        }
      ]
    },
    {
      id: 2,
      title: 'Design homepage',
      description: 'Create modern homepage design with responsive layout, hero section, feature highlights, and call-to-action buttons.',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Jane Smith',
      dueDate: '2024-02-05',
      project: 'Website Redesign',
      milestone: 'Design Phase',
      createdDate: '2024-01-15',
      completedDate: null,
      attachments: [
        { id: 3, name: 'homepage-mockup.png', size: '1.8 MB', type: 'png' }
      ],
      comments: [
        {
          id: 3,
          user: 'Jane Smith',
          message: 'Working on the hero section design. Will share updates soon.',
          timestamp: '2024-01-20T10:15:00Z'
        }
      ]
    },
    {
      id: 3,
      title: 'Implement responsive design',
      description: 'Ensure all pages work perfectly on mobile devices, tablets, and desktop screens with proper breakpoints.',
      status: 'Pending',
      priority: 'Medium',
      assignee: 'Mike Johnson',
      dueDate: '2024-02-12',
      project: 'Website Redesign',
      milestone: 'Development Phase',
      createdDate: '2024-01-20',
      completedDate: null,
      attachments: [],
      comments: []
    }
  ];

  // Find the task based on the ID parameter
  const task = tasksData.find(t => t.id === parseInt(id));
  
  // If task not found, redirect to customer dashboard
  useEffect(() => {
    if (!task) {
      navigate('/customer-dashboard');
    }
  }, [task, navigate]);

  // Scroll to top when component mounts
  useScrollToTop();
  
  // Return early if task not found
  if (!task) {
    return null;
  }

  // Countdown logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      const difference = dueDate.getTime() - now.getTime();

      if (difference > 0) {
        // Task is not overdue - show remaining time
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
        // Task is overdue - show how many days overdue
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
  }, [task.dueDate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCountdownColor = () => {
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
      case 'docx': return '📝';
      case 'png': return '🖼️';
      case 'jpg': return '🖼️';
      case 'jpeg': return '🖼️';
      default: return '📎';
    }
  };

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
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          {/* Task Header Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(task.status)}`}>
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{task.title}</h1>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
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

            {/* Task Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{task.description}</p>
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
                    <p className="text-base font-medium text-gray-900">{task.assignee}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Created</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(task.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Project</p>
                    <p className="text-base font-medium text-gray-900">{task.project}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Milestone</p>
                    <p className="text-base font-medium text-gray-900">{task.milestone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          {task.attachments.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Paperclip className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                <span className="text-sm text-gray-500">({task.attachments.length})</span>
              </div>

              <div className="space-y-3">
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(attachment.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{attachment.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          {task.comments.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                <span className="text-sm text-gray-500">({task.comments.length})</span>
              </div>

              <div className="space-y-4">
                {task.comments.map((comment) => (
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
            </div>
          )}

          {/* Empty State for Comments */}
          {task.comments.length === 0 && (
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
        </div>
      </main>
    </div>
  );
};

export default CustomerTaskDetail;
