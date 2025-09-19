import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import TaskForm from '../components/TaskForm';
import ProjectForm from '../components/ProjectForm';
import useScrollToTop from '../hooks/useScrollToTop';
import { FolderKanban, CheckSquare, Clock, TrendingUp, Plus, Users, Calendar, MessageSquare } from 'lucide-react';
import { projectApi, taskApi, getCurrentUser, handleApiError } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const PMDashboard = () => {
  const { toast } = useToast();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    onHold: 0,
    planning: 0,
    cancelled: 0,
    urgent: 0,
    high: 0,
    normal: 0,
    low: 0,
    avgProgress: 0
  });
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    urgent: 0,
    high: 0,
    normal: 0,
    low: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useScrollToTop();
  
  // Get current user from localStorage
  const currentUser = getCurrentUser();

  // Load all dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all data in parallel
      const [projectStatsResponse, taskStatsResponse, recentProjectsResponse] = await Promise.all([
        projectApi.getProjectStats(),
        taskApi.getTaskStats(),
        projectApi.getAllProjects({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      // Set project stats
      setProjectStats(projectStatsResponse.data);

      // Set task stats
      setTaskStats(taskStatsResponse.data);

      // Set recent projects
      setRecentProjects(recentProjectsResponse.data);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task form submission
  const handleTaskSubmit = (taskData) => {
    // Here you would typically send the data to your backend API
    // For now, we'll just close the form
    setIsTaskFormOpen(false);
  };

  // Handle project form submission
  const handleProjectSubmit = (projectData) => {
    // Refresh dashboard data after creating a new project
    loadDashboardData();
    setIsProjectFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      {/* Main Content - Responsive Design */}
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Welcome Section - Responsive */}
          <div className="mb-6 md:mb-8">
            <div className="mb-4 md:mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  Welcome, {currentUser?.fullName || 'Project Manager'}!
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Here's your project overview</p>
              </div>
            </div>
          </div>

          {/* Quick Stats - Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <button 
              onClick={() => navigate('/projects')}
              className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 active:scale-95 md:hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-lg">
                  <FolderKanban className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Active</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {isLoading ? '...' : projectStats.total}
              </p>
              <p className="text-xs md:text-sm text-gray-600">Projects</p>
            </button>

            <button 
              onClick={() => navigate('/tasks')}
              className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 active:scale-95 md:hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-green-100 rounded-xl md:rounded-lg">
                  <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Done</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {isLoading ? '...' : projectStats.completed}
              </p>
              <p className="text-xs md:text-sm text-gray-600">Completed</p>
            </button>

            <button 
              onClick={() => navigate('/employee-management')}
              className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 active:scale-95 md:hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-blue-100 rounded-xl md:rounded-lg">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Team</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {isLoading ? '...' : projectStats.active}
              </p>
              <p className="text-xs md:text-sm text-gray-600">Active</p>
            </button>

            <button 
              onClick={() => navigate('/tasks')}
              className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 active:scale-95 md:hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-purple-100 rounded-xl md:rounded-lg">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Tasks</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {isLoading ? '...' : taskStats.total}
              </p>
              <p className="text-xs md:text-sm text-gray-600">Total</p>
            </button>
          </div>

          {/* Desktop Layout - Two Column Grid */}
          <div className="md:grid md:grid-cols-2 md:gap-8 md:mb-8">
            {/* Progress Overview - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Recent Projects</h2>
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              
              <div className="space-y-4 md:space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex justify-between mb-2">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-8"></div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentProjects.length > 0 ? (
                  recentProjects.slice(0, 3).map((project) => (
                    <div key={project._id}>
                      <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                        <span className="text-gray-600 truncate">{project.name}</span>
                        <span className="text-gray-900 font-medium">{Math.round(project.progress || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full transition-all duration-300" 
                          style={{width: `${Math.round(project.progress || 0)}%`}}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No projects found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
                <button 
                  onClick={() => setIsTaskFormOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl md:rounded-lg p-4 md:p-4 shadow-sm active:scale-95 md:hover:shadow-md transition-all flex flex-col md:flex-row items-center md:justify-start space-y-2 md:space-y-0 md:space-x-3"
                >
                  <Plus className="h-6 w-6 md:h-5 md:w-5" />
                  <p className="text-sm md:text-base font-medium">New Task</p>
                </button>
                <button 
                  onClick={() => setIsProjectFormOpen(true)}
                  className="bg-white border border-gray-200 rounded-2xl md:rounded-lg p-4 md:p-4 shadow-sm active:scale-95 md:hover:shadow-md transition-all flex flex-col md:flex-row items-center md:justify-start space-y-2 md:space-y-0 md:space-x-3"
                >
                  <FolderKanban className="h-6 w-6 md:h-5 md:w-5 text-primary" />
                  <p className="text-sm md:text-base font-medium text-gray-900">New Project</p>
                </button>
              </div>
            </div>
          </div>

          {/* Task Requests - Responsive */}
          <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-2xl md:rounded-lg shadow-sm border border-teal-200 mb-6">
            <div className="p-5 md:p-6 border-b border-teal-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Task Requests</h2>
              <p className="text-sm text-gray-600 mt-1">Review and approve customer task requests</p>
            </div>
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm text-gray-600">3 pending requests need review</p>
                </div>
                <button 
                  onClick={() => navigate('/task-requests')}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <span className="font-semibold">View Requests</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Management - Responsive */}
          <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-2xl md:rounded-lg shadow-sm border border-teal-200">
            <div className="p-5 md:p-6 border-b border-teal-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-600 mt-1">Manage user roles and permissions</p>
            </div>
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => navigate('/user-management')}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <span className="font-semibold">Manage Users</span>
                </button>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Assign roles and manage user access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Task Form */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleTaskSubmit}
      />

      {/* Project Form */}
      <ProjectForm
        isOpen={isProjectFormOpen}
        onClose={() => setIsProjectFormOpen(false)}
        onSubmit={handleProjectSubmit}
      />
    </div>
  );
};

export default PMDashboard;
