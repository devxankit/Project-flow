import React, { useState, useMemo } from 'react';
import PMNavbar from '../components/PM-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { useToast } from '../contexts/ToastContext';
import { Input } from '../components/magicui/input';
import { Combobox } from '../components/magicui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/magicui/dialog';
import { Button } from '../components/magicui/button';
import { Textarea } from '../components/magicui/textarea';
import { 
  CheckSquare, 
  Clock, 
  User, 
  Calendar, 
  Flag, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Target,
  FileText,
  AlertCircle,
  Building2,
  X
} from 'lucide-react';

const TaskRequests = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestToReject, setRequestToReject] = useState(null);

  // Scroll to top when component mounts
  useScrollToTop();

  // Mock task requests data
  const taskRequests = [
    {
      id: 1,
      title: 'Add user authentication to mobile app',
      description: 'We need to implement secure user authentication for the mobile app to ensure only authorized users can access the system.',
      project: 'Mobile App Development',
      projectId: 2,
      milestone: 'Development Phase',
      milestoneId: 'milestone-2',
      priority: 'High',
      dueDate: '2024-02-20',
      reason: 'feature-request',
      status: 'Pending',
      requestedBy: 'Acme Corporation',
      requestedDate: '2024-01-15',
      customerContact: 'john.smith@acme.com'
    },
    {
      id: 2,
      title: 'Fix responsive design issues on homepage',
      description: 'The homepage is not displaying correctly on mobile devices. Images are overlapping and text is cut off.',
      project: 'Website Redesign',
      projectId: 1,
      milestone: 'Development Phase',
      milestoneId: 'milestone-2',
      priority: 'Urgent',
      dueDate: '2024-02-10',
      reason: 'bug-fix',
      status: 'Pending',
      requestedBy: 'TechCorp Inc',
      requestedDate: '2024-01-14',
      customerContact: 'sarah.johnson@techcorp.com'
    },
    {
      id: 3,
      title: 'Add dark mode toggle',
      description: 'Users have requested a dark mode option for better user experience during night time usage.',
      project: 'Website Redesign',
      projectId: 1,
      milestone: 'Design Phase',
      milestoneId: 'milestone-1',
      priority: 'Medium',
      dueDate: '2024-02-25',
      reason: 'improvement',
      status: 'Approved',
      requestedBy: 'Global Solutions',
      requestedDate: '2024-01-12',
      customerContact: 'mike.davis@global.com'
    },
    {
      id: 4,
      title: 'Implement real-time notifications',
      description: 'We need push notifications to alert users about important updates and changes in the system.',
      project: 'Mobile App Development',
      projectId: 2,
      milestone: 'Development Phase',
      milestoneId: 'milestone-2',
      priority: 'High',
      dueDate: '2024-02-18',
      reason: 'feature-request',
      status: 'Rejected',
      requestedBy: 'Innovation Labs',
      requestedDate: '2024-01-10',
      customerContact: 'lisa.wang@innovation.com',
      rejectionReason: 'Feature is out of scope for current project timeline'
    },
    {
      id: 5,
      title: 'Add multi-language support',
      description: 'Our international users need support for Spanish, French, and German languages.',
      project: 'API Integration',
      projectId: 4,
      milestone: 'Development Phase',
      milestoneId: 'milestone-2',
      priority: 'Medium',
      dueDate: '2024-03-01',
      reason: 'feature-request',
      status: 'Pending',
      requestedBy: 'Digital Dynamics',
      requestedDate: '2024-01-16',
      customerContact: 'alex.rodriguez@digital.com'
    }
  ];

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status', icon: Filter },
    { value: 'Pending', label: 'Pending', icon: Clock },
    { value: 'Approved', label: 'Approved', icon: CheckCircle },
    { value: 'Rejected', label: 'Rejected', icon: XCircle }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities', icon: Flag },
    { value: 'Low', label: 'Low', icon: Flag },
    { value: 'Medium', label: 'Medium', icon: Flag },
    { value: 'High', label: 'High', icon: Flag },
    { value: 'Urgent', label: 'Urgent', icon: AlertCircle }
  ];

  const projectOptions = [
    { value: 'all', label: 'All Projects', icon: Building2 },
    { value: 'Website Redesign', label: 'Website Redesign', icon: Building2 },
    { value: 'Mobile App Development', label: 'Mobile App Development', icon: Building2 },
    { value: 'API Integration', label: 'API Integration', icon: Building2 },
    { value: 'Database Migration', label: 'Database Migration', icon: Building2 }
  ];

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    return taskRequests.filter(request => {
      const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
      const matchesProject = projectFilter === 'all' || request.project === projectFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }, [searchTerm, statusFilter, priorityFilter, projectFilter, taskRequests]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-primary/10 text-primary border-primary/20';
      case 'Approved': return 'bg-primary/10 text-primary border-primary/20';
      case 'Rejected': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-primary/10 text-primary';
      case 'Medium': return 'bg-primary/10 text-primary';
      case 'High': return 'bg-primary/10 text-primary';
      case 'Urgent': return 'bg-primary/10 text-primary';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get reason label
  const getReasonLabel = (reason) => {
    switch (reason) {
      case 'bug-fix': return 'Bug Fix';
      case 'feature-request': return 'Feature Request';
      case 'improvement': return 'Improvement';
      case 'change-request': return 'Change Request';
      case 'additional-work': return 'Additional Work';
      case 'other': return 'Other';
      default: return reason;
    }
  };

  // Handle request approval
  const handleApprove = (requestId) => {
    const request = taskRequests.find(r => r.id === requestId);
    console.log('Approving request:', requestId);
    // In a real app, this would update the request status and create a task
    
    toast.success(
      'Request Approved!',
      `Task request from ${request?.customerName} has been approved and a new task has been created.`
    );
  };

  // Handle request rejection
  const handleReject = (requestId) => {
    const request = taskRequests.find(r => r.id === requestId);
    setRequestToReject(request);
    setShowRejectionDialog(true);
  };

  // Handle rejection confirmation
  const handleRejectConfirm = () => {
    if (rejectionReason.trim()) {
      console.log('Rejecting request:', requestToReject.id, 'Reason:', rejectionReason);
      // In a real app, this would update the request status with rejection reason
      
      toast.success(
        'Request Rejected',
        `Task request from ${requestToReject?.customerName} has been rejected.`
      );
      
      setShowRejectionDialog(false);
      setRejectionReason('');
      setRequestToReject(null);
    } else {
      toast.error(
        'Rejection Reason Required',
        'Please provide a reason for rejecting this request.'
      );
    }
  };

  // Handle rejection dialog close
  const handleRejectCancel = () => {
    setShowRejectionDialog(false);
    setRejectionReason('');
    setRequestToReject(null);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = taskRequests.length;
    const pending = taskRequests.filter(r => r.status === 'Pending').length;
    const approved = taskRequests.filter(r => r.status === 'Approved').length;
    const rejected = taskRequests.filter(r => r.status === 'Rejected').length;
    
    return { total, pending, approved, rejected };
  }, [taskRequests]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Task Requests</h1>
                <p className="text-gray-600 mt-1">Manage and review customer task requests</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-600">Requests</p>
              </div>

              <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-gray-500">Pending</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-600">Awaiting Review</p>
              </div>

              <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-gray-500">Approved</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                <p className="text-xs text-gray-600">Tasks Created</p>
              </div>

              <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <XCircle className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-gray-500">Rejected</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-xs text-gray-600">Not Approved</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="md:w-48">
                <Combobox
                  options={statusOptions.map(option => ({
                    value: option.value,
                    label: option.label,
                    icon: option.icon
                  }))}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Filter by status"
                  className="h-10"
                />
              </div>

              {/* Priority Filter */}
              <div className="md:w-48">
                <Combobox
                  options={priorityOptions.map(option => ({
                    value: option.value,
                    label: option.label,
                    icon: option.icon
                  }))}
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  placeholder="Filter by priority"
                  className="h-10"
                />
              </div>

              {/* Project Filter */}
              <div className="md:w-48">
                <Combobox
                  options={projectOptions.map(option => ({
                    value: option.value,
                    label: option.label,
                    icon: option.icon
                  }))}
                  value={projectFilter}
                  onChange={setProjectFilter}
                  placeholder="Filter by project"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-2xl md:rounded-lg p-8 shadow-sm border border-gray-100 text-center">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Request Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                          {request.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {request.description}
                      </p>

                      {/* Request Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Building2 className="h-4 w-4" />
                          <span>{request.project}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Target className="h-4 w-4" />
                          <span>{request.milestone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{request.requestedBy}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FileText className="h-4 w-4" />
                          <span>{getReasonLabel(request.reason)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Requested: {new Date(request.requestedDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                       {request.rejectionReason && (
                         <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                           <div className="flex items-center space-x-2 text-primary">
                             <AlertCircle className="h-4 w-4" />
                             <span className="text-sm font-medium">Rejection Reason:</span>
                           </div>
                           <p className="text-sm text-primary/80 mt-1">{request.rejectionReason}</p>
                         </div>
                       )}
                    </div>

                     {/* Actions */}
                     {request.status === 'Pending' && (
                       <div className="flex flex-col space-y-2 md:ml-4">
                         <button
                           onClick={() => handleApprove(request.id)}
                           className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                         >
                           <CheckCircle className="h-4 w-4" />
                           <span>Approve</span>
                         </button>
                         <button
                           onClick={() => handleReject(request.id)}
                           className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                         >
                           <XCircle className="h-4 w-4" />
                           <span>Reject</span>
                         </button>
                       </div>
                     )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-primary" />
              <span>Reject Task Request</span>
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this task request from {requestToReject?.requestedBy}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Rejection Reason *
              </label>
              <Textarea
                placeholder="Explain why this task request is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleRejectCancel}
              className="flex-1 h-10 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim()}
              className="flex-1 h-10 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskRequests;
