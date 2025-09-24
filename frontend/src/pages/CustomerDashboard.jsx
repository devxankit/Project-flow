import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNavbar from '../components/Customer-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { FolderKanban, CheckSquare, Clock, TrendingUp, Users, Calendar, AlertTriangle, Loader2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { customerApi, taskRequestApi } from '../utils/api';
import TaskRequestForm from '../components/TaskRequestForm';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [isTaskRequestFormOpen, setIsTaskRequestFormOpen] = useState(false);
  
  // Scroll to top when component mounts
  useScrollToTop();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await customerApi.getCustomerDashboard();
        if (response.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Error', 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  const formatStatus = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'active': return 'In Progress';
      case 'planning': return 'Planning';
      case 'on-hold': return 'On Hold';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatPriority = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'High';
      case 'normal': return 'Medium';
      case 'low': return 'Low';
      default: return priority;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading dashboard...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if no data
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-600">Unable to load dashboard data</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Extract data from API response
  const { statistics, recentProjects, recentTasks } = dashboardData;
  const projects = recentProjects || [];
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <CustomerNavbar />
      
      {/* Main Content - Responsive Design */}
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Welcome Section - Responsive */}
          <div className="mb-6 md:mb-8">
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                    Welcome back, {user?.fullName || 'there'}!
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 mt-1">Here's your project workspace overview</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <button
                    onClick={() => setIsTaskRequestFormOpen(true)}
                    className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold">Request Task</span>
                  </button>
                </div>
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
                <span className="text-xs md:text-sm text-gray-500">Active Projects</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{statistics?.projects?.active || 0}</p>
              <p className="text-xs md:text-sm text-gray-600">Projects</p>
            </div>

            <div className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-green-100 rounded-xl md:rounded-lg">
                  <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Done</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{statistics?.tasks?.completed || 0}</p>
              <p className="text-xs md:text-sm text-gray-600">Tasks</p>
            </div>

            <div className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-yellow-100 rounded-xl md:rounded-lg">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Due Soon</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{statistics?.tasks?.dueSoon || 0}</p>
              <p className="text-xs md:text-sm text-gray-600">Tasks</p>
            </div>

            <div className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-red-100 rounded-xl md:rounded-lg">
                  <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Overdue</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{statistics?.tasks?.overdue || 0}</p>
              <p className="text-xs md:text-sm text-gray-600">Tasks</p>
            </div>
          </div>

          {/* Desktop Layout - Two Column Grid */}
          <div className="md:grid md:grid-cols-2 md:gap-8 md:mb-8">
             {/* Progress Overview - Enhanced Design */}
             <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg md:text-xl font-semibold text-gray-900">My Project Progress</h2>
                 <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
               </div>
               
               {/* Overall Progress Bar - Average of Task and Subtask Progress */}
               <div className="mb-6">
                 <div className="flex justify-between text-sm mb-2">
                   <span className="text-gray-600">Overall Progress</span>
                   <span className="text-gray-900 font-medium">{statistics?.overallProgress || 0}%</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-3">
                   <div 
                     className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
                     style={{ width: `${statistics?.overallProgress || 0}%` }}
                   ></div>
                 </div>
               </div>
               
               <div className="space-y-4 md:space-y-6">
                 {/* Total Tasks - Simple display without bar */}
                 <div>
                   <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                     <span className="text-gray-600">Total Tasks</span>
                     <span className="text-gray-900 font-medium">{statistics?.tasks?.total || 0}</span>
                   </div>
                 </div>
                 
                 {/* Completed Tasks - Shows ratio and percentage */}
                 <div>
                   <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                     <span className="text-gray-600">Completed Tasks</span>
                     <span className="text-gray-900 font-medium">{statistics?.tasks?.completed || 0}/{statistics?.tasks?.total || 0} ({statistics?.tasks?.total > 0 ? Math.round(((statistics?.tasks?.completed || 0) / statistics.tasks.total) * 100) : 0}%)</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                     <div 
                       className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full transition-all duration-500" 
                       style={{width: `${statistics?.tasks?.total > 0 ? ((statistics?.tasks?.completed || 0) / statistics.tasks.total) * 100 : 0}%`}}
                     ></div>
                   </div>
                 </div>
                 
                 {/* Total Subtasks - Simple display without bar */}
                 <div>
                   <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                     <span className="text-gray-600">Total Subtasks</span>
                     <span className="text-gray-900 font-medium">{statistics?.subtasks?.total || 0}</span>
                   </div>
                 </div>
                 
                 {/* Completed Subtasks - Shows ratio and percentage */}
                 <div>
                   <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                     <span className="text-gray-600">Completed Subtasks</span>
                     <span className="text-gray-900 font-medium">{statistics?.subtasks?.completed || 0}/{statistics?.subtasks?.total || 0} ({statistics?.subtasks?.total > 0 ? Math.round(((statistics?.subtasks?.completed || 0) / statistics.subtasks.total) * 100) : 0}%)</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                     <div 
                       className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full transition-all duration-500" 
                       style={{width: `${statistics?.subtasks?.total > 0 ? ((statistics?.subtasks?.completed || 0) / statistics.subtasks.total) * 100 : 0}%`}}
                     ></div>
                   </div>
                 </div>
               </div>
             </div>

            {/* Customer Summary - Enhanced Responsive Design */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              {/* Section Header with Better Visual Hierarchy */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">My Projects</h2>
              </div>
              
              {/* Responsive Cards Grid - Better Spacing and Alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {/* Total Customers Card */}
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-teal-200 rounded-xl shadow-sm">
                        <FolderKanban className="h-6 w-6 text-teal-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide mb-1">Total Projects</p>
                        <p className="text-2xl font-bold text-gray-900">{statistics?.projects?.total || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Completed Customers Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-200 rounded-xl shadow-sm">
                        <CheckSquare className="h-6 w-6 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{statistics?.projects?.completed || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Stats Row for Better Context */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary">{statistics?.projects?.active || 0}</p>
                    <p className="text-sm text-gray-600">Active Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-yellow-600">{statistics?.projects?.planning || 0}</p>
                    <p className="text-sm text-gray-600">In Planning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customers Section */}
          <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">My Projects</h2>
              <span className="text-sm text-gray-500">{statistics?.projects?.total || 0} projects</span>
            </div>

            {/* Responsive Customer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.isArray(projects) && projects.filter(project => project != null).map((project) => {
                // Safety check: ensure project has required properties
                if (!project || typeof project !== 'object') {
                  console.error('Invalid project object:', project);
                  return null;
                }
                return (
                <div 
                  key={project._id} 
                  onClick={() => navigate(`/customer-project-details/${project._id}`)}
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
                        <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors duration-300">
                          {typeof project.name === 'string' ? project.name : 'Unnamed Project'}
                        </h3>
                        </div>
                        <div className="flex items-center space-x-1.5 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                            {formatPriority(project.priority)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                            {formatStatus(project.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                    {typeof project.description === 'string' ? project.description : 'No description available'}
                  </p>

                  {/* Progress Section */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-900">{typeof project.progress === 'number' ? project.progress : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${typeof project.progress === 'number' ? project.progress : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Task Counts */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-gray-900">{typeof project.totalTasks === 'number' ? project.totalTasks : 0}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-green-600">{typeof project.completedTasks === 'number' ? project.completedTasks : 0}</div>
                      <div className="text-xs text-gray-500">Done</div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{project.assignedTeam?.length || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">
                          {project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          }) : 'No date'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-gray-700">
                        {(() => {
                          if (!project.dueDate) return 'No date';
                          const now = new Date();
                          const dueDate = new Date(project.dueDate);
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
                );
              })}
              {!Array.isArray(projects) && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No projects data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Task Request Form - Only render when open */}
      {isTaskRequestFormOpen && (
        <TaskRequestForm
          isOpen={isTaskRequestFormOpen}
          onClose={() => setIsTaskRequestFormOpen(false)}
          customerId={user?._id}
          customerName={user?.fullName}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
