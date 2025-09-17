import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNavbar from '../components/Customer-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { FolderKanban, CheckSquare, Clock, TrendingUp, Users, Calendar, AlertTriangle } from 'lucide-react';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useScrollToTop();
  
  // Mock user data - in a real app, this would come from authentication context
  const currentUser = {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com'
  };

  // Mock projects data - read-only for customers
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX',
      status: 'In Progress',
      progress: 65,
      team: 4,
      dueDate: '2025-10-15',
      priority: 'High',
      totalTasks: 24,
      completedTasks: 16,
      dueSoonTasks: 3,
      overdueTasks: 1
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'iOS and Android app for customer portal',
      status: 'Planning',
      progress: 20,
      team: 6,
      dueDate: '2025-01-15',
      priority: 'Medium',
      totalTasks: 18,
      completedTasks: 4,
      dueSoonTasks: 2,
      overdueTasks: 0
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migrate to new database system for better performance',
      status: 'Completed',
      progress: 100,
      team: 3,
      dueDate: '2024-01-20',
      priority: 'High',
      totalTasks: 12,
      completedTasks: 12,
      dueSoonTasks: 0,
      overdueTasks: 0
    },
    {
      id: 4,
      name: 'API Integration',
      description: 'Integrate third-party APIs for enhanced functionality',
      status: 'In Progress',
      progress: 40,
      team: 2,
      dueDate: '2024-12-30',
      priority: 'Low',
      totalTasks: 8,
      completedTasks: 3,
      dueSoonTasks: 1,
      overdueTasks: 0
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'Planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate overall stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalTasks = projects.reduce((sum, p) => sum + p.totalTasks, 0);
  const completedTasks = projects.reduce((sum, p) => sum + p.completedTasks, 0);
  const dueSoonTasks = projects.reduce((sum, p) => sum + p.dueSoonTasks, 0);
  const overdueTasks = projects.reduce((sum, p) => sum + p.overdueTasks, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <CustomerNavbar />
      
      {/* Main Content - Responsive Design */}
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Welcome Section - Responsive */}
          <div className="mb-6 md:mb-8">
            <div className="mb-4 md:mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  Welcome, {currentUser.firstName}!
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Here's your project overview</p>
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
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{activeProjects}</p>
              <p className="text-xs md:text-sm text-gray-600">Projects</p>
            </div>

            <div className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-green-100 rounded-xl md:rounded-lg">
                  <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Done</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{completedTasks}</p>
              <p className="text-xs md:text-sm text-gray-600">Tasks</p>
            </div>

            <div className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-yellow-100 rounded-xl md:rounded-lg">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Due Soon</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{dueSoonTasks}</p>
              <p className="text-xs md:text-sm text-gray-600">Tasks</p>
            </div>

            <div className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-red-100 rounded-xl md:rounded-lg">
                  <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Overdue</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{overdueTasks}</p>
              <p className="text-xs md:text-sm text-gray-600">Tasks</p>
            </div>
          </div>

          {/* Desktop Layout - Two Column Grid */}
          <div className="md:grid md:grid-cols-2 md:gap-8 md:mb-8">
            {/* Progress Overview - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Overall Progress</h2>
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              
              {/* Overall Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="text-gray-900 font-medium">{Math.round((completedTasks / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div>
                  <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                    <span className="text-gray-600">Total Tasks</span>
                    <span className="text-gray-900 font-medium">{totalTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                    <div className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-gray-900 font-medium">{completedTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 md:h-3 rounded-full" style={{width: `${(completedTasks / totalTasks) * 100}%`}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Summary - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Project Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Projects</p>
                      <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
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
                      <p className="text-2xl font-bold text-gray-900">{completedProjects}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Your Projects</h2>
              <span className="text-sm text-gray-500">{totalProjects} projects</span>
            </div>

            {/* Responsive Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  onClick={() => navigate(`/customer-project/${project.id}`)}
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
                            {project.name}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-1.5 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Progress Section */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Task Counts */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-gray-900">{project.totalTasks}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-green-600">{project.completedTasks}</div>
                      <div className="text-xs text-gray-500">Done</div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{project.team}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">
                          {new Date(project.dueDate).toLocaleDateString('en-US', { 
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
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
