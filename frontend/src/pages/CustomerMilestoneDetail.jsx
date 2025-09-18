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
  AlertTriangle
} from 'lucide-react';

const CustomerMilestoneDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Mock milestone data
  const milestonesData = [
    {
      id: 1,
      title: 'Design Phase',
      description: 'Complete all design work including wireframes, mockups, and user interface designs for the website redesign project.',
      status: 'Completed',
      progress: 100,
      assignee: 'Sarah Johnson',
      dueDate: '2024-01-15',
      project: 'Website Redesign',
      createdDate: '2024-01-01',
      completedDate: '2024-01-15',
      attachments: [
        { id: 1, name: 'design-guidelines.pdf', size: '1.2 MB', type: 'pdf' },
        { id: 2, name: 'wireframes-collection.zip', size: '3.4 MB', type: 'zip' }
      ],
      comments: [
        {
          id: 1,
          user: 'Sarah Johnson',
          message: 'Design phase completed successfully. All wireframes and mockups are ready for development.',
          timestamp: '2024-01-15T16:30:00Z'
        },
        {
          id: 2,
          user: 'John Doe',
          message: 'Great work on the designs! The team is ready to start development.',
          timestamp: '2024-01-15T17:00:00Z'
        }
      ]
    },
    {
      id: 2,
      title: 'Development Phase',
      description: 'Implement all frontend and backend functionality based on the approved designs.',
      status: 'In Progress',
      progress: 65,
      assignee: 'Mike Johnson',
      dueDate: '2024-02-15',
      project: 'Website Redesign',
      createdDate: '2024-01-16',
      completedDate: null,
      attachments: [
        { id: 3, name: 'development-requirements.docx', size: '856 KB', type: 'docx' }
      ],
      comments: [
        {
          id: 3,
          user: 'Mike Johnson',
          message: 'Development is progressing well. Frontend components are 70% complete.',
          timestamp: '2024-01-25T14:20:00Z'
        }
      ]
    },
    {
      id: 3,
      title: 'Testing Phase',
      description: 'Comprehensive testing of all features and functionality before launch.',
      status: 'Not Started',
      progress: 0,
      assignee: 'Emily Davis',
      dueDate: '2024-03-01',
      project: 'Website Redesign',
      createdDate: '2024-01-20',
      completedDate: null,
      attachments: [],
      comments: []
    }
  ];

  // Find the milestone based on the ID parameter
  const milestone = milestonesData.find(m => m.id === parseInt(id));
  
  // If milestone not found, redirect to customer dashboard
  useEffect(() => {
    if (!milestone) {
      navigate('/customer-dashboard');
    }
  }, [milestone, navigate]);

  // Scroll to top when component mounts
  useScrollToTop();

  // Calculate time left until due date
  useEffect(() => {
    if (milestone && milestone.dueDate) {
      const dueDate = new Date(milestone.dueDate);
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
    }
  }, [milestone]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'Not Started': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: formatFileSize(file.size),
      type: file.name.split('.').pop().toLowerCase(),
      file: file,
      uploadedBy: 'Customer',
      uploadedDate: new Date().toISOString()
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
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

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleUploadSubmit = () => {
    // Add uploaded files to milestone attachments
    const newAttachments = uploadedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: file.uploadedBy,
      uploadedDate: file.uploadedDate
    }));
    
    // Update milestone with new attachments
    setMilestone(prevMilestone => ({
      ...prevMilestone,
      attachments: [...prevMilestone.attachments, ...newAttachments]
    }));
    
    // Clear uploaded files and close form
    setUploadedFiles([]);
    setShowUploadForm(false);
    
    // Show success message (in a real app, this would be a toast notification)
    alert('Files uploaded successfully!');
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
                  <p className="text-sm font-medium text-gray-900">{milestone.assignee}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Project</p>
                  <p className="text-sm font-medium text-gray-900">{milestone.project}</p>
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
                  <span className="text-sm text-gray-500">({milestone.attachments.length + uploadedFiles.length})</span>
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
            {(milestone.attachments.length > 0 || uploadedFiles.length > 0) && (
              <div className="space-y-3">
                {milestone.attachments.map((attachment) => (
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
            {milestone.attachments.length === 0 && uploadedFiles.length === 0 && !showUploadForm && (
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
          {milestone.comments.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                  <span className="text-sm text-gray-500">({milestone.comments.length})</span>
                </div>
              </div>

              <div className="space-y-4">
                {milestone.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {comment.user.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.user}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerMilestoneDetail;
