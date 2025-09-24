import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNavbar from '../components/Customer-Navbar';
import TaskRequestForm from '../components/TaskRequestForm';
import useScrollToTop from '../hooks/useScrollToTop';
import { 
  CheckSquare, 
  Calendar, 
  Clock,
  AlertCircle,
  FileText,
  Eye,
  Edit,
  X,
  Filter,
  Search,
  Plus,
  Loader2,
  Target,
  Flag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { taskRequestApi, customerApi } from '../utils/api';

const CustomerTaskRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [taskRequests, setTaskRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isTaskRequestFormOpen, setIsTaskRequestFormOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Fetch task requests
  useEffect(() => {
    const fetchTaskRequests = async () => {
      try {
        setLoading(true);
        const response = await taskRequestApi.getCustomerTaskRequests();
        if (response.success) {
          setTaskRequests(response.data);
          setFilteredRequests(response.data);
        }
      } catch (error) {
        console.error('Error fetching task requests:', error);
        toast.error('Error', 'Failed to load task requests');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskRequests();
  }, []);

  // Fetch customers data for the task request form
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await customerApi.getCustomers();
        if (response.success) {
          setCustomers(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        // Don't show error toast as this is not critical for the main functionality
      }
    };

    fetchCustomers();
  }, []);

  // Filter and search
  useEffect(() => {
    let filtered = taskRequests;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request => {
        const customerName = typeof request.customer === 'string' ? request.customer : request.customer?.name || '';
        return request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               customerName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredRequests(filtered);
  }, [taskRequests, statusFilter, searchTerm]);

  // Scroll to top when component mounts
  useScrollToTop();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return Clock;
      case 'Approved': return CheckSquare;
      case 'Rejected': return X;
      case 'In Progress': return AlertCircle;
      case 'Completed': return CheckSquare;
      default: return Clock;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleViewRequest = (requestId) => {
    navigate(`/customer-task-request/${requestId}`);
  };

  const handleEditRequest = (requestId) => {
    // Only allow editing if status is Pending
    const request = taskRequests.find(r => r._id === requestId);
    if (request && request.status === 'Pending') {
      navigate(`/customer-task-request/${requestId}/edit`);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to cancel this task request?')) {
      try {
        const response = await taskRequestApi.deleteTaskRequest(requestId);
        if (response.success) {
          toast.success('Success', 'Task request cancelled successfully');
          // Refresh the list
          const updatedRequests = taskRequests.filter(r => r._id !== requestId);
          setTaskRequests(updatedRequests);
          setFilteredRequests(updatedRequests);
        }
      } catch (error) {
        console.error('Error cancelling task request:', error);
        toast.error('Error', 'Failed to cancel task request');
      }
    }
  };

  // Handle opening the task request form
  const handleNewRequest = () => {
    setIsTaskRequestFormOpen(true);
  };

  // Handle closing the task request form
  const handleCloseForm = () => {
    setIsTaskRequestFormOpen(false);
    setSelectedCustomer(null);
    setTasks([]);
  };

  // Handle task request form submission
  const handleTaskRequestSubmit = async (requestData) => {
    try {
      // Refresh the task requests list
      const response = await taskRequestApi.getCustomerTaskRequests();
      if (response.success) {
        setTaskRequests(response.data);
        setFilteredRequests(response.data);
      }
      
      // Close the form
      handleCloseForm();
      
      toast.success('Success', 'Task request submitted successfully!');
    } catch (error) {
      console.error('Error refreshing task requests:', error);
      // Still close the form even if refresh fails
      handleCloseForm();
    }
  };

  // Fetch tasks for a specific customer
  const fetchTasksForCustomer = async (customerId) => {
    try {
      const response = await customerApi.getCustomerTasks(customerId);
      if (response.success) {
        setTasks(response.data || []);
        // Close the customer selection dialog and open the task request form
        setIsTaskRequestFormOpen(false);
      } else {
        toast.error('Error', 'Failed to load tasks for this customer');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Error', 'Failed to load tasks for this customer');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'in progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
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
      <CustomerNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Requests</h1>
                <p className="text-gray-600 mt-1">Manage your submitted task requests</p>
              </div>
              <button
                onClick={handleNewRequest}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>New Request</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{taskRequests.length}</div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-yellow-600">
                  {taskRequests.filter(r => r.status === 'Pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-green-600">
                  {taskRequests.filter(r => r.status === 'Approved').length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-red-600">
                  {taskRequests.filter(r => r.status === 'Rejected').length}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Task Requests List */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Task Requests Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No requests match your current filters.' 
                    : 'You haven\'t submitted any task requests yet.'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <button
                    onClick={() => navigate('/customer-dashboard')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Submit Your First Request
                  </button>
                )}
              </div>
            ) : (
              filteredRequests.map((request) => {
                const StatusIcon = getStatusIcon(request.status);
                return (
                  <div key={request._id} className="task-request-card bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      {/* Title and Status Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{request.title}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                              {request.priority}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewRequest(request._id)}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {request.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleEditRequest(request._id)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit Request"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCancelRequest(request._id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Cancel Request"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Target className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{typeof request.customer === 'string' ? request.customer : request.customer?.name || 'Unknown Customer'}</span>
                      </div>
                      <div className="flex items-center space-x-2 min-w-0">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">Due: {formatDate(request.dueDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2 min-w-0 sm:col-span-2 lg:col-span-1">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">Submitted: {formatDate(request.createdAt)}</span>
                      </div>
                    </div>

                    {/* Review Comments */}
                    {request.reviewComments && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <StatusIcon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Review Comments</span>
                        </div>
                        <p className="text-sm text-gray-600">{request.reviewComments}</p>
                        {request.reviewedBy && (
                          <p className="text-xs text-gray-500 mt-1">
                            By {typeof request.reviewedBy === 'string' ? request.reviewedBy : request.reviewedBy.fullName || 'Unknown User'} on {formatDate(request.reviewedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Task Request Form */}
      {isTaskRequestFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Select Customer</h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {!customers || !Array.isArray(customers) || customers.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No customers available for task requests.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customers.map((customer) => (
                    <button
                      key={customer._id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        // Fetch tasks for the selected customer
                        fetchTasksForCustomer(customer._id);
                      }}
                      className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{customer.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Request Form Dialog */}
      {selectedCustomer && (
        <TaskRequestForm
          isOpen={!!selectedCustomer}
          onClose={() => {
            setSelectedCustomer(null);
            setTasks([]);
          }}
          onSubmit={handleTaskRequestSubmit}
          customerId={selectedCustomer._id}
          customerName={selectedCustomer.name}
          tasks={tasks}
        />
      )}
    </div>
  );
};

export default CustomerTaskRequests;
