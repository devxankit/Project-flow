import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeNavbar from '../components/Employee-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { 
  FolderKanban, 
  Calendar, 
  User, 
  Clock,
  Target,
  Users,
  ArrowLeft,
  CheckSquare,
  TrendingUp,
  FileText,
  MessageSquare,
  BarChart3,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const EmployeeProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Scroll to top when component mounts
  useScrollToTop();

  // Fetch customer details
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const response = await api.employee.getCustomerDetails(id);
        
        if (response.data && response.data.success) {
          setCustomer(response.data.data.customer);
          setTasks(response.data.data.tasks || []);
        } else {
          toast.error('Error', 'Customer not found or access denied');
          navigate('/employee-customers');
        }
      } catch (error) {
        console.error('Error fetching customer details:', error);
        toast.error('Error', 'Failed to load customer details');
        navigate('/employee-customers');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerDetails();
    }
  }, [id, navigate]);

  // Countdown logic
  useEffect(() => {
    if (!customer) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const dueDate = new Date(customer.dueDate);
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
  }, [customer]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <EmployeeNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-4xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading customer details...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Return early if customer not found
  if (!customer) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-primary/10 text-primary border-primary/20';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCountdownColor = () => {
    if (!customer.dueDate) return 'text-blue-600';
    
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

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'tasks', label: 'Tasks', icon: Target },
    { key: 'team', label: 'Team', icon: Users }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Customer Stats */}
      <div className="space-y-4">
        {/* Progress Card */}
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

        {/* My Tasks Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{customer.myTasks || 0}</div>
                <div className="text-xs text-gray-500">My Tasks</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {customer.myCompletedTasks || 0} completed
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{customer.assignedTeam?.length || 0}</div>
                <div className="text-xs text-gray-500">Team Members</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              Active contributors
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary/20 rounded-xl">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Customer Information</h3>
        </div>

        {/* Client Section */}
        {customer.customer && (
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {customer.customer.company ? 
                    customer.customer.company.split(' ').map(word => word[0]).join('').substring(0, 2) :
                    customer.customer.fullName.split(' ').map(word => word[0]).join('').substring(0, 2)
                  }
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-primary/80 uppercase tracking-wide mb-1">Client</p>
              <p className="text-lg font-bold text-gray-900">{customer.customer.company || customer.customer.fullName}</p>
            </div>
          </div>
        )}

        {/* Date Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customer.startDate && (
            <div className="bg-white/50 rounded-xl p-4 border border-primary/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Start Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(customer.startDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {customer.dueDate && (
            <div className="bg-white/50 rounded-xl p-4 border border-primary/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Due Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(customer.dueDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-4">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <div 
            key={task._id} 
            className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => navigate(`/employee-task/${task._id}?customerId=${customer._id}`)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">{task.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium border ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900 font-medium">{task.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div 
                  className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
              <span>My Subtasks: {task.myCompletedSubtasks || 0}/{task.mySubtasks || 0}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-600">Tasks will appear here when they are created</p>
        </div>
      )}
    </div>
  );

  const renderTeam = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {customer.assignedTeam && customer.assignedTeam.length > 0 ? (
        customer.assignedTeam.map((member) => (
          <div key={member._id} className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-200">
                {member.avatar ? (
                  <img 
                    src={member.avatar} 
                    alt={member.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-base font-bold text-primary">
                    {member.fullName.split(' ').map(word => word[0]).join('').substring(0, 2)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors duration-200">{member.fullName}</h3>
                <p className="text-sm text-gray-600">{member.role || 'Team Member'}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 col-span-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members</h3>
          <p className="text-gray-600">Team members will appear here when they are assigned</p>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'tasks': return renderTasks();
      case 'team': return renderTeam();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <EmployeeNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-4xl md:mx-auto md:px-6 lg:px-8">

          {/* Customer Header Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(customer.status)}`}>
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900">{customer.name}</h1>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(customer.priority)}`}>
                    {customer.priority}
                  </span>
                </div>
              </div>
              
              {customer.dueDate && (
                <div className="text-right">
                  <div className={`text-sm md:text-lg font-semibold ${getCountdownColor()}`}>
                    {timeLeft}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">
                    Due: {new Date(customer.dueDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Description */}
            {customer.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{customer.description}</p>
              </div>
            )}
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden mb-6">
            <div className="grid grid-cols-3 gap-3">
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

          {/* Desktop Tabs */}
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
    </div>
  );
};

export default EmployeeProjectDetails;