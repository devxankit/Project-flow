import React, { useState, useEffect } from 'react';
import CustomerNavbar from '../components/Customer-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  User,
  Building2,
  CheckSquare,
  Image,
  File,
  Archive,
  Video,
  Music,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { customerApi } from '../utils/api';

const CustomerFiles = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Scroll to top when component mounts
  useScrollToTop();

  // Fetch files data
  useEffect(() => {
    const fetchFilesData = async () => {
      try {
        setLoading(true);
        const response = await customerApi.getCustomerFiles();
        if (response.success) {
          setFiles(response.data.files || []);
        }
      } catch (error) {
        console.error('Error fetching files data:', error);
        toast.error('Error', 'Failed to load files data');
      } finally {
        setLoading(false);
      }
    };

    fetchFilesData();
  }, []);

  // Files data is now fetched from API

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-600" />;
      case 'docx': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'png': return <Image className="h-5 w-5 text-green-600" />;
      case 'jpg': return <Image className="h-5 w-5 text-green-600" />;
      case 'jpeg': return <Image className="h-5 w-5 text-green-600" />;
      case 'sql': return <File className="h-5 w-5 text-orange-600" />;
      case 'xlsx': return <File className="h-5 w-5 text-green-600" />;
      case 'zip': return <Archive className="h-5 w-5 text-purple-600" />;
      case 'mp4': return <Video className="h-5 w-5 text-red-600" />;
      case 'mp3': return <Music className="h-5 w-5 text-pink-600" />;
      default: return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'docx': return 'bg-blue-100 text-blue-800';
      case 'png': return 'bg-green-100 text-green-800';
      case 'jpg': return 'bg-green-100 text-green-800';
      case 'jpeg': return 'bg-green-100 text-green-800';
      case 'sql': return 'bg-orange-100 text-orange-800';
      case 'xlsx': return 'bg-green-100 text-green-800';
      case 'zip': return 'bg-purple-100 text-purple-800';
      case 'mp4': return 'bg-red-100 text-red-800';
      case 'mp3': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (size) => {
    return size;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Filter files based on search term and filter
  const filteredFiles = files.filter(file => {
    // Safe string conversion with fallbacks - handle different possible property names
    const fileName = file.name || file.originalName || '';
    const customerName = file.customer || file.customerName || '';
    const taskName = file.task || file.taskTitle || '';
    const subtaskName = file.subtask || file.subtaskTitle || '';
    
    const matchesSearch = fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subtaskName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && (file.type || file.mimetype) === filter;
  });

  const fileTypes = [
    { key: 'all', label: 'All Files', count: files.length },
    { key: 'pdf', label: 'PDF', count: files.filter(f => (f.type || f.mimetype) === 'pdf').length },
    { key: 'png', label: 'Images', count: files.filter(f => ['png', 'jpg', 'jpeg'].includes(f.type || f.mimetype)).length },
    { key: 'docx', label: 'Documents', count: files.filter(f => ['docx', 'xlsx'].includes(f.type || f.mimetype)).length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <CustomerNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Mobile Layout - Creative Tile with Search */}
          <div className="md:hidden mb-6">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Customer Files</h2>
                  <p className="text-sm text-gray-600">Download shared files and documents</p>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter</span>
              </button>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <h3 className="text-sm font-semibold text-gray-900">Customer Files</h3>
                  <p className="text-xs text-gray-600">Download shared files and documents</p>
                </div>
                <div className="text-2xl font-bold text-primary">{files.length}</div>
              </div>
            </div>
          </div>

          {/* Mobile Filter Tabs - Tiles Layout */}
          <div className="md:hidden mb-6">
            <div className="grid grid-cols-2 gap-3">
              {fileTypes.map(({ key, label, count }, index) => (
                <button
                  key={key || `filter-mobile-${index}`}
                  onClick={() => setFilter(key)}
                  className={`p-4 rounded-2xl shadow-sm border transition-all ${
                    filter === key
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 active:scale-95'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Filter Tabs - Website Layout */}
          <div className="hidden md:block mb-8">
            <div className="flex gap-2 flex-wrap">
              {fileTypes.map(({ key, label, count }, index) => (
                <button
                  key={key || `filter-desktop-${index}`}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filter === key
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredFiles.map((file, index) => (
              <div key={file.id || file._id || file.originalName || `file-${index}`} className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-300">
                {/* File Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary/10 transition-colors duration-200">
                      {getFileIcon(file.type || file.mimetype)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                        {file.name || file.originalName || 'Untitled File'}
                      </h3>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size || 0)}</p>
                    </div>
                  </div>
                </div>

                {/* File Type Badge */}
                <div className="mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(file.type || file.mimetype || 'unknown')}`}>
                    {(file.type || file.mimetype || 'unknown').toUpperCase()}
                  </span>
                </div>

                {/* File Meta */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span>{file.uploadedBy || file.uploadedByName || 'Unknown User'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(file.uploadDate || file.uploadedAt || new Date())}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Building2 className="h-3 w-3" />
                    <span>{file.customer || file.customerName || 'Unknown Customer'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <CheckSquare className="h-3 w-3" />
                    <span>{file.task || file.taskTitle || 'Unknown Task'}</span>
                  </div>
                  {file.subtask && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <FileText className="h-3 w-3" />
                      <span>{file.subtask || file.subtaskTitle || 'Unknown Subtask'}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs font-medium">View</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200">
                    <Download className="h-4 w-4" />
                    <span className="text-xs font-medium">Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'No files match your current filter'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Load More Button - Mobile App Style */}
          {filteredFiles.length > 0 && (
            <div className="mt-6 text-center">
              <button className="bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                Load More Files
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerFiles;
