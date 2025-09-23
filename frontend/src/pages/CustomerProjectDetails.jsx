import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import TaskForm from '../components/TaskForm';
import useScrollToTop from '../hooks/useScrollToTop';
import { 
  FolderKanban, 
  Calendar, 
  Users, 
  CheckSquare, 
  TrendingUp,
  Clock,
  Target,
  User,
  MessageSquare,
  Plus,
  MoreVertical,
  BarChart3,
  FileText,
  Settings,
  Flag,
  Loader2,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { customerApi, taskApi, subtaskApi } from '../utils/api';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '../components/magicui/dialog';
import { Button } from '../components/magicui/button';
import ThreeDotMenu from '../components/ThreeDotMenu';
import CopyConfirmDialog from '../components/CopyConfirmDialog';

const CustomerProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeLeft, setTimeLeft] = useState('');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    customer: false,
    tasks: false,
    subtasks: false
  });
  
  // Copy dialog states
  const [copyDialog, setCopyDialog] = useState({
    isOpen: false,
    type: null, // 'task' or 'subtask'
    item: null,
    isLoading: false
  });

  // Fetch customer data
  useEffect(() => {
    if (id) {
      setLoading(true);
      loadCustomer();
      loadTasks();
      loadSubtasks();
    }
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, customer: true }));
      const response = await customerApi.getCustomerProjectDetails(id);
      if (response.success) {
        setCustomerData(response.data);
        setLoading(false);
      } else {
        toast.error('Error', 'Customer not found');
        navigate('/customer-dashboard');
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      toast.error('Error', 'Failed to load customer details');
      setLoading(false);
      navigate('/customer-dashboard');
    } finally {
      setLoadingStates(prev => ({ ...prev, customer: false }));
    }
  };

  const loadTasks = async () => {
    // Tasks are now loaded with customer data in loadCustomer
    // This function is kept for compatibility but doesn't need to do anything
  };

  const loadSubtasks = async () => {
    // Subtasks are now loaded with customer data in loadCustomer
    // This function is kept for compatibility but doesn't need to do anything
  };

  // Handle task submission
  const handleTaskSubmit = (taskData) => {
    // Refresh customer data and tasks after creating a new task
    loadCustomer();
    loadTasks();
    setIsTaskFormOpen(false);
  };

  // Handle customer deletion confirmation
  const handleDeleteCustomer = () => {
    if (!customerData?.customer?._id) return;
    setShowDeleteDialog(true);
  };

  // Confirm customer deletion
  const confirmDeleteCustomer = async () => {
    if (!customerData?.customer?._id) return;

    try {
      setIsDeleting(true);
      await customerApi.deleteCustomer(customerData.customer._id);
      toast.success('Success', 'Customer deleted successfully');
      navigate('/customer-dashboard');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Error', 'Failed to delete customer');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Cancel customer deletion
  const cancelDeleteCustomer = () => {
    setShowDeleteDialog(false);
  };

  // Handle customer edit navigation
  const handleEditCustomer = () => {
    navigate(`/customers/edit/${customerData.customer._id}`);
  };

  // Scroll to top when component mounts
  useScrollToTop();

  // Countdown logic - moved before conditional returns to follow Rules of Hooks
  useEffect(() => {
    if (!customerData?.customer?.dueDate) {
      setTimeLeft('No due date');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const dueDate = new Date(customerData.customer.dueDate);
      const difference = dueDate.getTime() - now.getTime();

      if (difference > 0) {
        // Customer is not overdue - show remaining time
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
        // Customer is overdue - show how many days overdue
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
  }, [customerData?.customer?.dueDate]);

  // Copy handlers
  const handleCopyTask = (task) => {
    setCopyDialog({
      isOpen: true,
      type: 'task',
      item: task,
      isLoading: false
    });
  };

  const handleCopySubtask = (subtask) => {
    setCopyDialog({
      isOpen: true,
      type: 'subtask',
      item: subtask,
      isLoading: false
    });
  };

  const handleConfirmCopy = async () => {
    if (!copyDialog.item) return;

    setCopyDialog(prev => ({ ...prev, isLoading: true }));

    try {
      if (copyDialog.type === 'task') {
        try {
          const response = await taskApi.copyTask(copyDialog.item._id, id);
          if (!response.success) {
            toast.error('Error', response.message || 'Failed to copy task');
            setCopyDialog({ isOpen: false, type: null, item: null, isLoading: false });
            return;
          }
          toast.success('Success', 'Task copied successfully');
        } catch (e) {
          toast.error('Error', 'Failed to copy task');
          setCopyDialog({ isOpen: false, type: null, item: null, isLoading: false });
          return;
        }
        // Refresh after success
        try {
          const customerResponse = await api.get(`/customer/${id}`);
          if (customerResponse.success) {
            setCustomerData(customerResponse.data);
          }
        } catch (_) {}
      } else if (copyDialog.type === 'subtask') {
        const response = await subtaskApi.copySubtask(
          copyDialog.item._id, 
          copyDialog.item.task, 
          id
        );
        if (response.success) {
          toast.success('Success', 'Subtask copied successfully');
          // Refresh customer data to show new subtask
          const customerResponse = await api.get(`/customer/${id}`);
          if (customerResponse.success) {
            setCustomerData(customerResponse.data);
          }
        } else {
          toast.error('Error', response.message || 'Failed to copy subtask');
        }
      }
    } catch (error) {
      console.error('Error copying item:', error);
      toast.error('Error', 'Failed to copy item');
    } finally {
      setCopyDialog({
        isOpen: false,
        type: null,
        item: null,
        isLoading: false
      });
    }
  };

  const handleCloseCopyDialog = () => {
    setCopyDialog({
      isOpen: false,
      type: null,
      item: null,
      isLoading: false
    });
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <PMNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading customer details...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Return early if customer not found
  if (!customerData) {
    return null;
  }

  // Extract customer data
  const { customer, tasks = [], subtasks = [] } = customerData;

  // Get team from customer data
  const team = customer?.assignedTeam || [];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'tasks', label: 'Tasks', icon: Target },
    { key: 'subtasks', label: 'Subtasks', icon: CheckSquare },
    { key: 'team', label: 'Team', icon: Users }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-primary/10 text-primary border-primary/20';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'active': return 'Active';
      case 'planning': return 'Planning';
      case 'on-hold': return 'On Hold';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      default: return status;
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

  const formatPriority = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'High';
      case 'normal': return 'Normal';
      case 'low': return 'Low';
      default: return priority;
    }
  };

  const getDueDateColor = () => {
    if (!customer?.dueDate) {
      return 'bg-gray-100 text-gray-800 border-gray-200'; // No date
    }
    
    const now = new Date();
    const dueDate = new Date(customer.dueDate);
    const difference = dueDate.getTime() - now.getTime();
    const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (difference < 0) {
      return 'bg-red-100 text-red-800 border-red-200'; // Overdue
    } else if (daysLeft <= 1) {
      return 'bg-orange-100 text-orange-800 border-orange-200'; // Critical
    } else if (daysLeft <= 3) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Warning
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200'; // Normal
    }
  };

  const getCountdownColor = () => {
    if (!customer?.dueDate) {
      return 'text-gray-600'; // No date
    }
    
    const now = new Date();
    const dueDate = new Date(customer.dueDate);
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Customer Stats - Mobile App Style */}
      <div className="space-y-4">
        {/* Progress Card - Featured */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-6 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/20 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
                <p className="text-sm text-gray-600">Overall completion status</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{customer.progress || 0}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
              style={{ width: `${customer.progress || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Tasks Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
                <div className="text-xs text-gray-500">My Tasks</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {tasks.filter(t => t.status === 'completed').length} completed
            </div>
          </div>

          {/* Team Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{team.length}</div>
                <div className="text-xs text-gray-500">Team Members</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              Active contributors
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">Timeline</div>
                  <div className="text-sm text-gray-600">Project deadline</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getCountdownColor()}`}>
                  {timeLeft}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(customer.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information Card */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 shadow-sm">
        {/* Card Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary/20 rounded-xl">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Project Information</h3>
        </div>

        {/* Client Section */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {customer.customer?.fullName ? 
                  customer.customer.fullName.split(' ').map(word => word[0]).join('').substring(0, 2) :
                  'C'
                }
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-primary/80 uppercase tracking-wide mb-1">Project Owner</p>
            <p className="text-lg font-bold text-gray-900">{customer.customer?.fullName || 'You'}</p>
          </div>
        </div>

        {/* Date Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date Box */}
          <div className="bg-white/50 rounded-xl p-4 border border-primary/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Start Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {customer.createdAt ? 
                    new Date(customer.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'Not set'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Due Date Box */}
          <div className="bg-white/50 rounded-xl p-4 border border-primary/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Due Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {customer.dueDate ? 
                    new Date(customer.dueDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'Not set'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-600 mb-4">Your tasks will appear here when they are assigned</p>
          <button 
            onClick={() => setIsTaskFormOpen(true)}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full text-sm font-medium"
          >
            Request Task
          </button>
        </div>
      ) : (
        tasks.map((task) => (
          <div 
            key={task._id} 
            onClick={() => {
              console.log('Task clicked from customer project details:', task);
              console.log('Customer ID:', id);
              navigate(`/pm-task/${task._id}?customerId=${id}`);
            }}
            className="group bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                task.status === 'completed' 
                  ? 'bg-primary border-primary' 
                  : 'border-gray-300 group-hover:border-primary'
              }`}>
                {task.status === 'completed' && (
                  <CheckSquare className="h-3 w-3 text-white" />
                )}
              </div>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-base font-semibold transition-colors duration-200 ${
                    task.status === 'completed' 
                      ? 'text-gray-500 line-through' 
                      : 'text-gray-900 group-hover:text-primary'
                  }`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : task.status === 'active'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formatStatus(task.status)}
                    </span>
                    {user?.role === 'pm' && (
                      <ThreeDotMenu
                        onCopy={() => handleCopyTask(task)}
                        showCopy={true}
                        itemType="task"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                  </div>
                </div>
                
                {/* Task Meta */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{task.assignedTo?.length > 0 ? task.assignedTo[0].fullName || task.assignedTo[0].name : 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'No date'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderSubtasks = () => (
    <div className="space-y-3">
      {subtasks.length === 0 ? (
        <div className="text-center py-8">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subtasks yet</h3>
          <p className="text-gray-600">Subtasks will appear here when tasks are created</p>
        </div>
      ) : (
        subtasks.map((subtask) => (
          <div 
            key={subtask._id} 
            className="group bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                subtask.status === 'completed' 
                  ? 'bg-primary border-primary' 
                  : 'border-gray-300 group-hover:border-primary'
              }`}>
                {subtask.status === 'completed' && (
                  <CheckSquare className="h-3 w-3 text-white" />
                )}
              </div>

              {/* Subtask Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-base font-semibold transition-colors duration-200 ${
                    subtask.status === 'completed' 
                      ? 'text-gray-500 line-through' 
                      : 'text-gray-900 group-hover:text-primary'
                  }`}>
                    {subtask.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subtask.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : subtask.status === 'active'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formatStatus(subtask.status)}
                    </span>
                    {user?.role === 'pm' && (
                      <ThreeDotMenu
                        onCopy={() => handleCopySubtask(subtask)}
                        showCopy={true}
                        itemType="subtask"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                  </div>
                </div>
                
                {/* Subtask Meta */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{subtask.assignedTo?.length > 0 ? subtask.assignedTo[0].fullName || subtask.assignedTo[0].name : 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{subtask.dueDate ? new Date(subtask.dueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'No date'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTeam = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {team.length === 0 ? (
        <div className="col-span-2 text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members assigned</h3>
          <p className="text-gray-600">Team members will appear here when assigned to the customer</p>
        </div>
      ) : (
        team.map((member) => (
          <div key={member._id} className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-200">
                <span className="text-base font-bold text-primary">
                  {member.fullName ? member.fullName.split(' ').map(word => word[0]).join('').substring(0, 2) : 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors duration-200">{member.fullName}</h3>
                <p className="text-sm text-gray-600">{member.jobTitle || member.workTitle || 'Team Member'}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'tasks': return renderTasks();
      case 'subtasks': return renderSubtasks();
      case 'team': return renderTeam();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Mobile Layout - Professional Design */}
          <div className="md:hidden mb-8">
            {/* Customer Header Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl">
                      <FolderKanban className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight line-clamp-2">{customer.name}</h1>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={`text-sm font-semibold ${getCountdownColor()}`}>
                    {timeLeft}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Due: {customer.dueDate ? new Date(customer.dueDate).toLocaleDateString() : 'No date'}
                  </div>
                </div>
              </div>
              
              {/* Full-width description */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 leading-relaxed">{customer.description}</p>
              </div>
              
              {/* Status and Priority Tags */}
              <div className="flex items-center space-x-2 mb-6 overflow-x-auto">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(customer.status)}`}>
                  {formatStatus(customer.status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(customer.priority)}`}>
                  {formatPriority(customer.priority)}
                </span>
                {/* Show overdue tag only if customer is overdue */}
                {(() => {
                  if (!customer.dueDate) return null;
                  
                  const now = new Date();
                  const dueDate = new Date(customer.dueDate);
                  const difference = dueDate.getTime() - now.getTime();
                  if (difference < 0) {
                    return (
                      <span className="px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap bg-red-100 text-red-800 border-red-200">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Overdue
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary Actions */}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setIsTaskFormOpen(true)}
                    className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold text-sm">Request Task</span>
                  </button>
                </div>
                
                {/* Secondary Actions */}
                <div className="flex space-x-3">
                  <button 
                    onClick={handleEditCustomer}
                    className="flex-1 bg-white border-2 border-primary text-primary py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="font-semibold text-sm">Edit Project</span>
                  </button>
                  <button 
                    onClick={handleDeleteCustomer}
                    disabled={isDeleting}
                    className="flex-1 bg-white border-2 border-red-500 text-red-500 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="font-semibold text-sm">{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Professional Design */}
          <div className="hidden md:block mb-8">
            {/* Customer Header */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl">
                      <FolderKanban className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 line-clamp-2">{customer.name}</h1>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(customer.status)}`}>
                        {formatStatus(customer.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(customer.priority)}`}>
                        {formatPriority(customer.priority)}
                      </span>
                      {/* Show overdue tag only if customer is overdue */}
                      {(() => {
                        if (!customer.dueDate) return null;
                        
                        const now = new Date();
                        const dueDate = new Date(customer.dueDate);
                        const difference = dueDate.getTime() - now.getTime();
                        if (difference < 0) {
                          return (
                            <span className="px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap bg-red-100 text-red-800 border-red-200">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Overdue
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={`text-lg font-semibold ${getCountdownColor()}`}>
                    {timeLeft}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Due: {customer.dueDate ? new Date(customer.dueDate).toLocaleDateString() : 'No date'}
                  </div>
                </div>
              </div>
              
              {/* Full-width description */}
              <div className="mb-6">
                <p className="text-lg text-gray-600 leading-relaxed">{customer.description}</p>
              </div>

              {/* Action Section */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Need more tasks?</h3>
                    <p className="text-sm text-gray-600">Request new tasks to keep your project moving forward</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setIsTaskFormOpen(true)}
                      className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-semibold">Request Task</span>
                    </button>
                  </div>
                </div>
                
                {/* Customer Management Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Project Management</h4>
                    <p className="text-xs text-gray-600">Manage your project details and settings</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleEditCustomer}
                      className="bg-white border-2 border-primary text-primary px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="font-semibold text-sm">Edit Project</span>
                    </button>
                    <button 
                      onClick={handleDeleteCustomer}
                      disabled={isDeleting}
                      className="bg-white border-2 border-red-500 text-red-500 px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="font-semibold text-sm">{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Tabs - Tiles Layout */}
          <div className="md:hidden mb-6">
            <div className="grid grid-cols-2 gap-3">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`p-4 rounded-2xl shadow-sm border transition-all ${
                      activeTab === tab.key
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 active:scale-95'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <IconComponent className="h-6 w-6" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Tabs - Website Layout */}
          <div className="hidden md:block mb-8">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                      activeTab === tab.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>
        </div>
      </main>

      {/* Task Form */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleTaskSubmit}
        customerId={customerData?._id}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md" onClose={cancelDeleteCustomer}>
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Delete Project
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete the project{' '}
              <span className="font-semibold text-gray-900">"{customer?.name}"</span>?
              This will permanently remove the project and all its associated data including tasks, subtasks, and files.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={cancelDeleteCustomer}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCustomer}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Confirmation Dialog */}
      <CopyConfirmDialog
        isOpen={copyDialog.isOpen}
        onClose={handleCloseCopyDialog}
        onConfirm={handleConfirmCopy}
        isLoading={copyDialog.isLoading}
        itemType={copyDialog.type}
        itemTitle={copyDialog.item?.title}
      />
    </div>
  );
};

export default CustomerProjectDetails;