import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeNavbar from '../components/Employee-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { FolderKanban, CheckSquare, Clock, TrendingUp, Users, Calendar, AlertTriangle, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const EmployeeProjects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Scroll to top when component mounts
  useScrollToTop();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);

  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await api.employee.getCustomers();
        
        if (response.data && response.data.success) {
          setCustomers(response.data.data?.customers || []);
          setPagination(response.data.data?.pagination || null);
        } else {
          toast.error('Error', 'Failed to load customers');
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Error', 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

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

  // Calculate overall stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const completedCustomers = customers.filter(c => c.status === 'completed').length;
  
  // Calculate task counts from real API data
  const totalMyTasks = customers.reduce((sum, c) => {
    return sum + (c.myTasks || 0);
  }, 0);
  
  const completedMyTasks = customers.reduce((sum, c) => {
    return sum + (c.myCompletedTasks || 0);
  }, 0);

  const inProgressMyTasks = customers.reduce((sum, c) => {
    return sum + (c.myInProgressTasks || 0);
  }, 0);

  const pendingMyTasks = customers.reduce((sum, c) => {
    return sum + (c.myPendingTasks || 0);
  }, 0);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <EmployeeNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading customers...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Calculate task-based progress for employee's customers
  const totalTasks = customers.reduce((sum, c) => {
    return sum + (c.myTasks || 0);
  }, 0);
  
  const completedTasks = customers.reduce((sum, c) => {
    return sum + (c.myCompletedTasks || 0);
  }, 0);
  
  // Calculate overall progress based on task completion
  const taskProgress = totalMyTasks > 0 ? (completedMyTasks / totalMyTasks) * 100 : 0;
  const overallProgress = taskProgress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <EmployeeNavbar />
      
      {/* Main Content - Responsive Design */}
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Welcome Section - Responsive */}
          <div className="mb-6 md:mb-8">
            <div className="mb-4 md:mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  My Customers
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Customers you're assigned to</p>
              </div>
            </div>
          </div>

          {/* Quick Stats - Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-lg">
                  <FolderKanban className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Active</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{activeCustomers}</p>
              <p className="text-xs md:text-sm text-gray-600">Customers</p>
            </div>

            <div className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-green-100 rounded-xl md:rounded-lg">
                  <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">My Tasks</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalMyTasks}</p>
              <p className="text-xs md:text-sm text-gray-600">Assigned</p>
            </div>

            <div className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-blue-100 rounded-xl md:rounded-lg">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Completed</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{completedMyTasks}</p>
              <p className="text-xs md:text-sm text-gray-600">Tasks</p>
            </div>

            <div className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-purple-100 rounded-xl md:rounded-lg">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Teams</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalCustomers}</p>
              <p className="text-xs md:text-sm text-gray-600">Customers</p>
            </div>
          </div>

          {/* Desktop Layout - Two Column Grid */}
          <div className="md:grid md:grid-cols-2 md:gap-8 md:mb-8">
            {/* Progress Overview - Enhanced Design */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">My Progress</h2>
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              
              {/* Overall Progress Bar - Task Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="text-gray-900 font-medium">{Math.round(overallProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                {/* Total Tasks - Simple display without bar */}
                <div>
                  <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                    <span className="text-gray-600">My Tasks</span>
                    <span className="text-gray-900 font-medium">{totalMyTasks}</span>
                  </div>
                </div>
                
                {/* Completed Tasks - Shows ratio and percentage */}
                <div>
                  <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                    <span className="text-gray-600">Completed Tasks</span>
                    <span className="text-gray-900 font-medium">{completedMyTasks}/{totalMyTasks} ({Math.round(taskProgress)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full transition-all duration-500" 
                      style={{width: `${taskProgress}%`}}
                    ></div>
                  </div>
                </div>
                
                {/* Total Tasks - Simple display without bar */}
                <div>
                  <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                    <span className="text-gray-600">My Tasks</span>
                    <span className="text-gray-900 font-medium">{totalMyTasks}</span>
                  </div>
                </div>
                
                {/* Completed Tasks - Shows ratio and percentage */}
                <div>
                  <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                    <span className="text-gray-600">Completed Tasks</span>
                    <span className="text-gray-900 font-medium">{completedMyTasks}/{totalMyTasks} ({Math.round(taskProgress)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full transition-all duration-500" 
                      style={{width: `${taskProgress}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Summary - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Customer Summary</h2>
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{completedCustomers}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customers Section */}
          <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Assigned Customers</h2>
              <span className="text-sm text-gray-500">{totalCustomers} customers</span>
            </div>

            {/* Responsive Customer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {customers.map((customer) => (
                <div 
                  key={customer._id} 
                  onClick={() => navigate(`/employee-customer-details/${customer._id}`)}
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors duration-300">
                            {customer.name}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-1.5 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(customer.priority)}`}>
                            {customer.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                            {customer.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                    {customer.description}
                  </p>

                  {/* Progress Section */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-900">{customer.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${customer.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* My Tasks Count */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-gray-900">{customer.myTasks || 0}</div>
                      <div className="text-xs text-gray-500">My Tasks</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-green-600">{customer.myCompletedTasks || 0}</div>
                      <div className="text-xs text-gray-500">Done</div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{customer.assignedTeam?.length || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">
                          {new Date(customer.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-gray-700">
                        {(() => {
                          const now = new Date();
                          const dueDate = new Date(customer.dueDate);
                          const diffTime = dueDate.getTime() - now.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays < 0) {
                            return `${Math.abs(diffDays)}d overdue`;
                          } else if (diffDays === 0) {
                            return 'Today';
                          } else if (diffDays === 1) {
                            return 'Tomorrow';
                          } else {
                            return `${diffDays}d left`;
                          }
                        })()}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeProjects;
