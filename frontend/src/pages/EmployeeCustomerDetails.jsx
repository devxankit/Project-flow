import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeNavbar from '../components/Employee-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { 
  Building2, 
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
import api, { handleApiError } from '../utils/api';

const EmployeeCustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [mySubtasksByTask, setMySubtasksByTask] = useState({});

  // Scroll to top when component mounts
  useScrollToTop();

  // Fetch customer details
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const response = await api.employee.getCustomerDetails(id);
        
        if (response.data && response.data.success) {
          const { customer, tasks } = response.data.data;
          setCustomer(customer);
          setTasks(tasks || []);

          // Load my subtasks per task for this customer
          const allMy = await api.employee.getSubtasks({ customerId: id, limit: 100 });
          if (allMy.data && allMy.data.success) {
            const grouped = {};
            (allMy.data.data?.subtasks || []).forEach(st => {
              const tId = st.task?._id || st.task;
              if (!grouped[tId]) grouped[tId] = [];
              grouped[tId].push(st);
            });
            setMySubtasksByTask(grouped);
          }
        } else {
          toast.error('Error', 'Project not found or access denied');
          navigate('/employee-customers');
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
        handleApiError(error, toast);
        navigate('/employee-customers');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerDetails();
    }
  }, [id, navigate, toast]);

  // Calculate time left
  useEffect(() => {
    if (customer?.dueDate) {
      const interval = setInterval(() => {
        const now = new Date();
        const dueDate = new Date(customer.dueDate);
        const diff = dueDate - now;
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setTimeLeft(`${days}d ${hours}h`);
        } else {
          setTimeLeft('Overdue');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [customer?.dueDate]);

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
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <EmployeeNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-gray-600">Loading project details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <EmployeeNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Project not found</h3>
            <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or you don't have access.</p>
            <button
              onClick={() => navigate('/employee-customers')}
              className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'files', name: 'Files', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <EmployeeNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-4xl md:mx-auto md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <button
              onClick={() => navigate('/employee-customers')}
              className="mb-4 text-primary hover:text-primary-dark transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Projects</span>
            </button>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {customer.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(customer.priority)}`}>
                        {customer.priority}
                      </span>
                    </div>
                  </div>
                </div>
                
                {customer.description && (
                  <p className="text-gray-600 mb-4 max-w-3xl">
                    {customer.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {formatDate(customer.dueDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{timeLeft}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{customer.assignedTeam?.length || 0} team members</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Card (matches old layout styling) */}
          <div className="mb-6 md:mb-8">
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
                  <div className="text-3xl font-bold text-primary">{Math.round(customer.progress || 0)}%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(customer.progress || 0)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl md:rounded-lg shadow-sm border border-gray-100">
            {activeTab === 'overview' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <CheckSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        {(() => {
                          const totalMySubtasks = Object.values(mySubtasksByTask).reduce((acc, arr) => acc + arr.length, 0);
                          const completedMySubtasks = Object.values(mySubtasksByTask).reduce((acc, arr) => acc + arr.filter(s => s.status === 'completed').length, 0);
                          return (
                            <>
                              <div className="text-2xl font-bold text-gray-900">{totalMySubtasks}</div>
                              <div className="text-xs text-gray-500">My Subtasks</div>
                              <div className="text-xs text-gray-600 mt-1">{completedMySubtasks} completed</div>
                            </>
                          );
                        })()}
                      </div>
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
                    <div className="text-xs text-gray-600">Active contributors</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Tasks</h3>

                {tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div
                        key={task._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/employee-task/${task._id}?customerId=${customer._id}`)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900">{task.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                        )}

                      {/* My Subtasks for this task */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-800">My Subtasks</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/employee-task/${task._id}?customerId=${customer._id}`);
                            }}
                            className="text-xs text-primary hover:text-primary-dark"
                          >
                            View all
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(mySubtasksByTask[task._id] || []).slice(0, 3).map(st => (
                            <div
                              key={st._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/employee-subtask/${st._id}?taskId=${task._id}&customerId=${customer._id}`);
                              }}
                              className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200 hover:border-primary/30 hover:shadow-sm transition cursor-pointer"
                            >
                              <div>
                                <div className="text-sm font-medium text-gray-900">{st.title}</div>
                                <div className="text-xs text-gray-500">Due: {formatDate(st.dueDate)}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(st.status)}`}>
                                  {st.status}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(st.priority)}`}>
                                  {st.priority}
                                </span>
                              </div>
                            </div>
                          ))}
                          {(!mySubtasksByTask[task._id] || mySubtasksByTask[task._id].length === 0) && (
                            <div className="text-xs text-gray-500">No subtasks assigned to you for this task.</div>
                          )}
                        </div>
                      </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(task.dueDate)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{task.assignedTo?.length || 0}</span>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {Math.round(task.progress || 0)}% complete
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
                    <p className="text-gray-600">Tasks will appear here when assigned to this customer</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'team' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
                {customer.assignedTeam && customer.assignedTeam.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customer.assignedTeam.map((member) => (
                      <div key={member._id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.fullName}</div>
                          <div className="text-sm text-gray-500">{member.jobTitle}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members assigned</h3>
                    <p className="text-gray-600">Team members will appear here when assigned to this customer</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Files & Attachments</h3>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No files uploaded</h3>
                  <p className="text-gray-600">Files will appear here when uploaded to tasks or subtasks</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeCustomerDetails;
