import React, { useState } from 'react';
import EmployeeNavbar from '../components/Employee-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { Combobox } from '../components/magicui/combobox';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  FolderKanban,
  Search,
  Filter,
  File,
  Image,
  FileSpreadsheet,
  FileVideo,
  Archive,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const EmployeeFiles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Scroll to top when component mounts
  useScrollToTop();

  // Mock user data
  const currentUser = {
    fullName: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'Frontend Developer'
  };

  // Mock files data - files related to employee's tasks and milestones
  const files = [
    {
      id: 1,
      name: 'homepage-design-mockup.fig',
      type: 'design',
      size: '2.4 MB',
      uploadedBy: 'Sarah Johnson',
      uploadedDate: '2024-02-05T10:30:00Z',
      task: 'Update homepage design',
      project: 'Website Redesign',
      milestone: 'Design Phase',
      status: 'active',
      description: 'Latest design mockups for homepage redesign',
      downloadCount: 12,
      lastAccessed: '2024-02-08T14:20:00Z'
    },
    {
      id: 2,
      name: 'responsive-guidelines.pdf',
      type: 'document',
      size: '1.8 MB',
      uploadedBy: 'John Doe',
      uploadedDate: '2024-02-03T09:15:00Z',
      task: 'Implement responsive design',
      project: 'Website Redesign',
      milestone: 'Development Phase',
      status: 'active',
      description: 'Responsive design guidelines and best practices',
      downloadCount: 8,
      lastAccessed: '2024-02-07T16:45:00Z'
    },
    {
      id: 3,
      name: 'navigation-bug-report.docx',
      type: 'document',
      size: '456 KB',
      uploadedBy: 'Mike Johnson',
      uploadedDate: '2024-02-06T11:20:00Z',
      task: 'Fix navigation bugs',
      project: 'Website Redesign',
      milestone: 'Development Phase',
      status: 'active',
      description: 'Detailed bug report for navigation issues',
      downloadCount: 3,
      lastAccessed: '2024-02-08T09:30:00Z'
    },
    {
      id: 4,
      name: 'mobile-screenshots.zip',
      type: 'archive',
      size: '5.2 MB',
      uploadedBy: 'Emily Davis',
      uploadedDate: '2024-02-04T15:45:00Z',
      task: 'Update homepage design',
      project: 'Website Redesign',
      milestone: 'Design Phase',
      status: 'active',
      description: 'Screenshots of mobile navigation issues',
      downloadCount: 5,
      lastAccessed: '2024-02-07T13:15:00Z'
    },
    {
      id: 5,
      name: 'api-documentation.pdf',
      type: 'document',
      size: '3.1 MB',
      uploadedBy: 'Alex Rodriguez',
      uploadedDate: '2024-02-02T14:30:00Z',
      task: 'API integration setup',
      project: 'Mobile App Development',
      milestone: 'Backend Setup',
      status: 'active',
      description: 'Complete API documentation for mobile app',
      downloadCount: 15,
      lastAccessed: '2024-02-08T10:15:00Z'
    },
    {
      id: 6,
      name: 'database-schema.sql',
      type: 'code',
      size: '892 KB',
      uploadedBy: 'Lisa Wang',
      uploadedDate: '2024-02-01T16:20:00Z',
      task: 'Database optimization',
      project: 'Database Migration',
      milestone: 'Migration Phase',
      status: 'archived',
      description: 'Updated database schema for migration',
      downloadCount: 7,
      lastAccessed: '2024-02-05T11:40:00Z'
    }
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case 'design': return FileText;
      case 'document': return FileText;
      case 'image': return Image;
      case 'spreadsheet': return FileSpreadsheet;
      case 'video': return FileVideo;
      case 'archive': return Archive;
      case 'code': return File;
      default: return File;
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'design': return 'text-purple-600 bg-purple-100';
      case 'document': return 'text-blue-600 bg-blue-100';
      case 'image': return 'text-green-600 bg-green-100';
      case 'spreadsheet': return 'text-emerald-600 bg-emerald-100';
      case 'video': return 'text-red-600 bg-red-100';
      case 'archive': return 'text-orange-600 bg-orange-100';
      case 'code': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'archived': return Archive;
      case 'pending': return Clock;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.task.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDownload = (file) => {
    // In a real app, this would trigger a download
    console.log('Downloading file:', file.name);
  };

  const handlePreview = (file) => {
    // In a real app, this would open a preview modal
    console.log('Previewing file:', file.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <EmployeeNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Shared Files</h1>
            <p className="text-gray-600">Files shared with your tasks and milestones</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files by name, description, or task..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-48">
                  <Combobox
                    options={[
                      { value: 'all', label: 'All Types', icon: FileText },
                      { value: 'document', label: 'Documents', icon: FileText },
                      { value: 'design', label: 'Design Files', icon: FileText },
                      { value: 'image', label: 'Images', icon: Image },
                      { value: 'code', label: 'Code Files', icon: File },
                      { value: 'archive', label: 'Archives', icon: Archive }
                    ]}
                    value={filterType}
                    onChange={setFilterType}
                    placeholder="Filter by type"
                    className="h-10"
                  />
                </div>
                <div className="w-48">
                  <Combobox
                    options={[
                      { value: 'all', label: 'All Status', icon: CheckCircle },
                      { value: 'active', label: 'Active', icon: CheckCircle },
                      { value: 'archived', label: 'Archived', icon: Archive },
                      { value: 'pending', label: 'Pending', icon: Clock }
                    ]}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    placeholder="Filter by status"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              const StatusIcon = getStatusIcon(file.status);
              
              return (
                <div key={file.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                  {/* File Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getFileTypeColor(file.type)}`}>
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {file.name}
                        </h3>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePreview(file)}
                        className="p-1 text-gray-400 hover:text-primary transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-1 text-gray-400 hover:text-primary transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* File Description */}
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {file.description}
                  </p>

                  {/* Task & Project Info */}
                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <FolderKanban className="h-3 w-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700">{file.project}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{file.task}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{file.milestone}</span>
                    </div>
                  </div>

                  {/* File Status & Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`h-3 w-3 ${getStatusColor(file.status).split(' ')[0]}`} />
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(file.status)}`}>
                        {file.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {file.downloadCount} downloads
                    </div>
                  </div>

                  {/* Upload Info */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>by {file.uploadedBy}</span>
                      </div>
                      <span>{new Date(file.uploadedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No files have been shared with your tasks yet.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeFiles;
