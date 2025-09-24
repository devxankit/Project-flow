import React, { useState, useEffect, useMemo } from 'react';
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
  X,
  Loader2
} from 'lucide-react';
import api from '../utils/api';

const TaskRequests = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [taskRequests, setTaskRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestToReject, setRequestToReject] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Scroll to top when component mounts
  useScrollToTop();

  // Fetch task requests from API
  useEffect(() => {
    const fetchTaskRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/task-requests');
        if (response.data.success) {
          setTaskRequests(response.data.data);
        } else {
          toast.error('Error', 'Failed to load task requests');
        }
      } catch (error) {
        console.error('Error fetching task requests:', error);
        toast.error('Error', 'Failed to load task requests');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskRequests();
  }, [toast]);

  // Get unique customers for filter
  const customers = useMemo(() => {
    const uniqueCustomers = [...new Set(taskRequests.map(req => {
      return typeof req.customer === 'string' ? req.customer : req.customer?.name;
    }).filter(Boolean))];
    return uniqueCustomers.map(customer => ({
      value: customer,
      label: customer,
      icon: Building2
    }));
  }, [taskRequests]);

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

  const customerOptions = [
    { value: 'all', label: 'All Customers', icon: Building2 },
    ...customers
  ];

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    return taskRequests.filter(request => {
      const customerName = typeof request.customer === 'string' ? request.customer : request.customer?.name || '';
      const requestedByName = typeof request.requestedBy === 'string' ? request.requestedBy : request.requestedBy?.fullName || '';
      
      const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           requestedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
      const matchesCustomer = customerFilter === 'all' || customerName === customerFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCustomer;
    });
  }, [searchTerm, statusFilter, priorityFilter, customerFilter, taskRequests]);

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
  const handleApprove = async (requestId) => {
    try {
      setIsProcessing(true);
      const response = await api.put(`/task-requests/${requestId}/status`, {
        status: 'approved',
        response: 'Task request approved and task created successfully.'
      });
      
      if (response.data.success) {
        toast.success(
          'Request Approved!',
          `Task request has been approved and a new task has been created.`
        );
        
        // Update the local state
        setTaskRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: 'Approved', reviewedBy: response.data.data.reviewedBy, reviewedAt: response.data.data.reviewedAt }
              : req
          )
        );
      } else {
        toast.error('Error', response.data.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Error', 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle request rejection
  const handleReject = (requestId) => {
    const request = taskRequests.find(r => r._id === requestId);
    setRequestToReject(request);
    setShowRejectionDialog(true);
  };

  // Handle rejection confirmation
  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      toast.error(
        'Rejection Reason Required',
        'Please provide a reason for rejecting this request.'
      );
      return;
    }

    try {
      setIsProcessing(true);
      const response = await api.put(`/task-requests/${requestToReject._id}/status`, {
        status: 'rejected',
        response: rejectionReason
      });
      
      if (response.data.success) {
        toast.success(
          'Request Rejected',
          `Task request has been rejected.`
        );
        
        // Update the local state
        setTaskRequests(prev => 
          prev.map(req => 
            req._id === requestToReject._id 
              ? { ...req, status: 'Rejected', reviewedBy: response.data.data.reviewedBy, reviewedAt: response.data.data.reviewedAt, reviewComments: rejectionReason }
              : req
          )
        );
        
        setShowRejectionDialog(false);
        setRejectionReason('');
        setRequestToReject(null);
      } else {
        toast.error('Error', response.data.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Error', 'Failed to reject request');
    } finally {
      setIsProcessing(false);
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <PMNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading task requests...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

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

              {/* Customer Filter */}
              <div className="md:w-48">
                <Combobox
                  options={customerOptions.map(option => ({
                    value: option.value,
                    label: option.label,
                    icon: option.icon
                  }))}
                  value={customerFilter}
                  onChange={setCustomerFilter}
                  placeholder="Filter by customer"
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
                <div key={request._id} className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
                          <span>{typeof request.customer === 'string' ? request.customer : request.customer?.name || 'Unknown Customer'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Target className="h-4 w-4" />
                          <span>{typeof request.task === 'string' ? request.task : request.task?.title || 'Unknown Task'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{typeof request.requestedBy === 'string' ? request.requestedBy : request.requestedBy?.fullName || 'Unknown User'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {request.dueDate ? new Date(request.dueDate).toLocaleDateString() : 'No due date'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FileText className="h-4 w-4" />
                          <span>{getReasonLabel(request.reason)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Requested: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                        </div>
                      </div>

                      {request.reviewComments && request.status === 'Rejected' && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Rejection Reason:</span>
                          </div>
                          <p className="text-sm text-red-700 mt-1">{request.reviewComments}</p>
                        </div>
                      )}

                      {request.reviewedBy && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Reviewed by: {typeof request.reviewedBy === 'string' ? request.reviewedBy : request.reviewedBy?.fullName || 'Unknown User'}</span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      )}
                    </div>

                     {/* Actions */}
                     {request.status === 'Pending' && (
                       <div className="flex flex-col space-y-2 md:ml-4">
                         <button
                           onClick={() => handleApprove(request._id)}
                           disabled={isProcessing}
                           className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           {isProcessing ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                             <CheckCircle className="h-4 w-4" />
                           )}
                           <span>Approve</span>
                         </button>
                         <button
                           onClick={() => handleReject(request._id)}
                           disabled={isProcessing}
                           className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
              Please provide a reason for rejecting this task request from {requestToReject?.requestedBy?.fullName}.
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
              disabled={!rejectionReason.trim() || isProcessing}
              className="flex-1 h-10 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Rejecting...
                </div>
              ) : (
                'Reject Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskRequests;
