import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeNavbar from '../components/Employee-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { FolderKanban, CheckSquare, Clock, TrendingUp, Users, Calendar, AlertTriangle, Eye } from 'lucide-react';

const EmployeeProjects = () => {
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useScrollToTop();
  
  // Mock user data - in a real app, this would come from authentication context
  const currentUser = {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@company.com',
    role: 'Frontend Developer'
  };

  // Mock projects data - only projects assigned to this employee
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX and improved user experience',
      status: 'In Progress',
      progress: 65,
      team: 4,
      dueDate: '2025-10-15',
      priority: 'High',
      startDate: '2024-01-01',
      client: 'Acme Corporation',
      totalTasks: 24,
      completedTasks: 16,
      dueSoonTasks: 3,
      overdueTasks: 1,
      myTasks: 6,
      myCompletedTasks: 2
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'iOS and Android app for customer portal with modern features and intuitive design',
      status: 'Planning',
      progress: 20,
      team: 6,
      dueDate: '2025-01-15',
      priority: 'Medium',
      startDate: '2024-02-01',
      client: 'TechCorp Inc',
      totalTasks: 18,
      completedTasks: 4,
      dueSoonTasks: 2,
      overdueTasks: 0,
      myTasks: 3,
      myCompletedTasks: 0
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migrate to new database system for better performance and scalability',
      status: 'Completed',
      progress: 100,
      team: 3,
      dueDate: '2024-01-20',
      priority: 'High',
      startDate: '2023-12-01',
      client: 'DataFlow Systems',
      totalTasks: 12,
      completedTasks: 12,
      dueSoonTasks: 0,
      overdueTasks: 0,
      myTasks: 2,
      myCompletedTasks: 2
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
  const totalMyTasks = projects.reduce((sum, p) => sum + p.myTasks, 0);
  const completedMyTasks = projects.reduce((sum, p) => sum + p.myCompletedTasks, 0);

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
                  My Projects
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Projects you're assigned to</p>
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
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalProjects}</p>
              <p className="text-xs md:text-sm text-gray-600">Projects</p>
            </div>
          </div>

          {/* Desktop Layout - Two Column Grid */}
          <div className="md:grid md:grid-cols-2 md:gap-8 md:mb-8">
            {/* Progress Overview - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">My Progress</h2>
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              
              {/* Overall Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="text-gray-900 font-medium">{Math.round((completedMyTasks / totalMyTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(completedMyTasks / totalMyTasks) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div>
                  <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                    <span className="text-gray-600">My Tasks</span>
                    <span className="text-gray-900 font-medium">{totalMyTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                    <div className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-gray-900 font-medium">{completedMyTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 md:h-3 rounded-full" style={{width: `${(completedMyTasks / totalMyTasks) * 100}%`}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Summary - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Project Summary</h2>
              <div className="grid grid-cols-1 gap-3 md:gap-4">
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
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Assigned Projects</h2>
              <span className="text-sm text-gray-500">{totalProjects} projects</span>
            </div>

            {/* Responsive Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {projects.map((project) => (
                <div 
                  key={project.id} 
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

                  {/* My Tasks Count */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-gray-900">{project.myTasks}</div>
                      <div className="text-xs text-gray-500">My Tasks</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-green-600">{project.myCompletedTasks}</div>
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

                  {/* View Project Button */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/employee-project/${project.id}`);
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-primary/10 text-primary py-2 rounded-lg hover:bg-primary/20 transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">View Project</span>
                    </button>
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
