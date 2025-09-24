import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import ThreeDotMenu from '../components/ThreeDotMenu';
import CopyConfirmDialog from '../components/CopyConfirmDialog';
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
import { customerApi, taskApi, subtaskApi, handleApiError } from '../utils/api';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '../components/magicui/dialog';
import { Button } from '../components/magicui/button';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeLeft, setTimeLeft] = useState('');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [copyDialog, setCopyDialog] = useState({ isOpen: false, isLoading: false, type: null, item: null });
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    customer: false,
    tasks: false,
    subtasks: false
  });

  // Fetch customer data
  useEffect(() => {
    if (id) {
      setLoading(true);
      loadCustomer();
      loadTasks();
    }
  }, [id]);

  useEffect(() => {
    if (id && tasks.length > 0) {
      loadSubtasks();
    } else {
      setSubtasks([]);
    }
  }, [id, tasks]);

  const loadCustomer = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, customer: true }));
      const response = await customerApi.getCustomerById(id);
      if (response.success) {
        setCustomerData(response.data);
        setLoading(false);
      } else {
        toast.error('Error', 'Customer not found');
        navigate('/customer-dashboard');
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      handleApiError(error, toast);
      setLoading(false);
      navigate('/customer-dashboard');
    } finally {
      setLoadingStates(prev => ({ ...prev, customer: false }));
    }
  };

  const loadTasks = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, tasks: true }));
      const response = await customerApi.getCustomerTasks(id);
      if (response.success) {
        setTasks(response.data || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, tasks: false }));
    }
  };

  const loadSubtasks = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, subtasks: true }));
      // Load subtasks for all tasks
      if (tasks.length > 0) {
        const allSubtasks = [];
        for (const task of tasks) {
          const response = await subtaskApi.getSubtasksByTask(task._id, id);
          if (response.success && response.data) {
            const subs = (response.data.subtasks || []).map(s => ({ ...s, taskId: s.task?._id || task._id }));
            allSubtasks.push(...subs);
          }
        }
        setSubtasks(allSubtasks);
      }
    } catch (error) {
      console.error('Error loading subtasks:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, subtasks: false }));
    }
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
    if (!customerData?._id) return;
    setShowDeleteDialog(true);
  };

  // Confirm customer deletion
  const confirmDeleteCustomer = async () => {
    if (!customerData?._id) return;

    try {
      setIsDeleting(true);
      await customerApi.deleteCustomer(customerData._id);
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
    navigate(`/customers/edit/${customerData._id}`);
  };

  // Scroll to top when component mounts
  useScrollToTop();

  // Countdown logic - moved before conditional returns to follow Rules of Hooks
  useEffect(() => {
    if (!customerData?.dueDate) {
      setTimeLeft('No due date');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const dueDate = new Date(customerData.dueDate);
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
  }, [customerData?.dueDate]);
  
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

  // Get team from customer data
  const team = customerData?.assignedTeam || [];

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
    if (!customerData?.dueDate) {
      return 'bg-gray-100 text-gray-800 border-gray-200'; // No date
    }
    
    const now = new Date();
    const dueDate = new Date(customerData.dueDate);
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
    if (!customerData?.dueDate) {
      return 'text-gray-600'; // No date
    }
    
    const now = new Date();
    const dueDate = new Date(customerData.dueDate);
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
                <h3 className="text-lg font-semibold text-gray-900">Customer Progress</h3>
                <p className="text-sm text-gray-600">Overall completion status</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{customerData.progress || 0}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
              style={{ width: `${customerData.progress || 0}%` }}
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
                <div className="text-xs text-gray-500">Total Tasks</div>
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
                  <div className="text-sm text-gray-600">Customer deadline</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getCountdownColor()}`}>
                  {timeLeft}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(customerData.dueDate).toLocaleDateString()}
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
          <h3 className="text-lg font-bold text-gray-900">Customer Information</h3>
        </div>

        {/* Client Section */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {customerData.customer?.fullName ? 
                  customerData.customer.fullName.split(' ').map(word => word[0]).join('').substring(0, 2) :
                  'C'
                }
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-primary/80 uppercase tracking-wide mb-1">Client</p>
            <p className="text-lg font-bold text-gray-900">{customerData.customer?.fullName || 'No client assigned'}</p>
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
                  {customerData.createdAt ? 
                    new Date(customerData.createdAt).toLocaleDateString('en-US', { 
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
                  {customerData.dueDate ? 
                    new Date(customerData.dueDate).toLocaleDateString('en-US', { 
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
          <p className="text-gray-600 mb-4">Add your first task to get started</p>
          <button 
            onClick={() => setIsTaskFormOpen(true)}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full text-sm font-medium"
          >
            Add Task
          </button>
        </div>
      ) : (
        tasks.map((task) => (
          <div 
            key={task._id} 
            onClick={() => {
              console.log('Task clicked from customer details:', task);
              console.log('Customer ID:', id);
              if (id && id !== 'undefined' && id !== 'null') {
                navigate(`/pm-task/${task._id}?customerId=${id}`);
              } else {
                toast.error('Error', 'Invalid customer ID');
              }
            }}
            className="group bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            {/* Header Section */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors duration-300">
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {formatStatus(task.status)}
                      </span>
                      {user?.role === 'pm' && (
                        <ThreeDotMenu
                          onCopy={(e) => {
                            e?.stopPropagation?.();
                            setCopyDialog({ isOpen: true, isLoading: false, task });
                          }}
                          showCopy={true}
                          itemType="task"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {formatPriority(task.priority)}
                    </span>
                    <span className="text-xs text-gray-500">Seq: {task.sequence || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {task.description || 'No description available'}
            </p>

            {/* Progress Section */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900 font-medium">{task.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckSquare className="h-4 w-4" />
                <span>{task.subtasks?.length || 0} subtasks</span>
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
            onClick={() => navigate(`/pm-subtask/${subtask._id}?taskId=${subtask.task?._id || subtask.taskId}&customerId=${id}`)}
            className="group bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            {/* Header Section */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors duration-300">
                      {subtask.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subtask.status)}`}>
                      {formatStatus(subtask.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(subtask.priority)}`}>
                      {formatPriority(subtask.priority)}
                    </span>
                    <span className="text-xs text-gray-500">Seq: {subtask.sequence || 'N/A'}</span>
                  </div>
                </div>
              </div>
              {/* Three-dot menu for copy */}
              {user?.role === 'pm' && (
                <ThreeDotMenu
                  onCopy={(e) => {
                    e?.stopPropagation?.();
                    setCopyDialog({ isOpen: true, isLoading: false, type: 'subtask', item: subtask });
                  }}
                  showCopy={true}
                  itemType="subtask"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
            </div>

            {/* Description */}
            {subtask.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {subtask.description}
              </p>
            )}

            {/* Footer Section */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Due: {subtask.dueDate ? new Date(subtask.dueDate).toLocaleDateString() : 'No date'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{(subtask.assignedTo?.[0]?.fullName) || 'Unassigned'}</span>
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
                    <h1 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight line-clamp-2">{customerData.name}</h1>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={`text-sm font-semibold ${getCountdownColor()}`}>
                    {timeLeft}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Due: {customerData.dueDate ? new Date(customerData.dueDate).toLocaleDateString() : 'No date'}
                  </div>
                </div>
              </div>
              
              {/* Full-width description */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 leading-relaxed">{customerData.description}</p>
              </div>
              
              {/* Status and Priority Tags */}
              <div className="flex items-center space-x-2 mb-6 overflow-x-auto">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(customerData.status)}`}>
                  {formatStatus(customerData.status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(customerData.priority)}`}>
                  {formatPriority(customerData.priority)}
                </span>
                {/* Show overdue tag only if customer is overdue */}
                {(() => {
                  if (!customerData.dueDate) return null;
                  
                  const now = new Date();
                  const dueDate = new Date(customerData.dueDate);
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
                    <span className="font-semibold text-sm">Add Task</span>
                  </button>
                </div>
                
                {/* Secondary Actions */}
                <div className="flex space-x-3">
                  <button 
                    onClick={handleEditCustomer}
                    className="flex-1 bg-white border-2 border-primary text-primary py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="font-semibold text-sm">Edit Customer</span>
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
                    <span className="font-semibold text-sm">{isDeleting ? 'Deleting...' : 'Delete'}</span>
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
                    <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 line-clamp-2">{customerData.name}</h1>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(customerData.status)}`}>
                        {formatStatus(customerData.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(customerData.priority)}`}>
                        {formatPriority(customerData.priority)}
                      </span>
                      {/* Show overdue tag only if customer is overdue */}
                      {(() => {
                        if (!customerData.dueDate) return null;
                        
                        const now = new Date();
                        const dueDate = new Date(customerData.dueDate);
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
                    Due: {customerData.dueDate ? new Date(customerData.dueDate).toLocaleDateString() : 'No date'}
                  </div>
                </div>
              </div>
              
              {/* Full-width description */}
              <div className="mb-6">
                <p className="text-lg text-gray-600 leading-relaxed">{customerData.description}</p>
              </div>

              {/* Action Section */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to add more tasks?</h3>
                    <p className="text-sm text-gray-600">Add new tasks to keep the customer work moving forward</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setIsTaskFormOpen(true)}
                      className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-semibold">Add Task</span>
                    </button>
                  </div>
                </div>
                
                {/* Customer Management Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Customer Management</h4>
                    <p className="text-xs text-gray-600">Edit customer details or remove the customer</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleEditCustomer}
                      className="bg-white border-2 border-primary text-primary px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="font-semibold text-sm">Edit Customer</span>
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
                      <span className="font-semibold text-sm">{isDeleting ? 'Deleting...' : 'Delete Customer'}</span>
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

      {/* Task Form - Only render when open */}
      {isTaskFormOpen && (
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onSubmit={handleTaskSubmit}
          customerId={customerData?._id}
        />
      )}

      {/* Copy Task Dialog */}
      <CopyConfirmDialog
        isOpen={copyDialog.isOpen}
        onClose={() => setCopyDialog({ isOpen: false, isLoading: false, type: null, item: null })}
        onConfirm={async () => {
          setCopyDialog((p) => ({ ...p, isLoading: true }));
          try {
            if (copyDialog.type === 'task') {
              const resp = await taskApi.copyTask(copyDialog.item._id, id);
              if (!resp.success) throw new Error(resp.message || 'Failed to copy task');
              toast.success('Success', 'Task copied');
            } else if (copyDialog.type === 'subtask') {
              const resp = await subtaskApi.copySubtask(copyDialog.item._id, copyDialog.item.taskId || copyDialog.item.task?._id, id);
              if (!resp.success) throw new Error(resp.message || 'Failed to copy subtask');
              toast.success('Success', 'Subtask copied');
            }
          } catch (e) {
            toast.error('Error', copyDialog.type === 'subtask' ? 'Failed to copy subtask' : 'Failed to copy task');
            setCopyDialog({ isOpen: false, isLoading: false, type: null, item: null });
            return;
          }
          try {
            if (copyDialog.type === 'task') {
              await loadTasks();
            } else if (copyDialog.type === 'subtask') {
              await loadSubtasks();
            }
          } catch (_) {}
          setCopyDialog({ isOpen: false, isLoading: false, type: null, item: null });
        }}
        isLoading={copyDialog.isLoading}
        itemType={copyDialog.type || 'task'}
        itemTitle={copyDialog.item?.title}
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
                  Delete Customer
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete the customer{' '}
              <span className="font-semibold text-gray-900">"{customerData?.name}"</span>?
              This will permanently remove the customer and all its associated data including tasks, subtasks, and files.
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
                  Delete Customer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDetails;
