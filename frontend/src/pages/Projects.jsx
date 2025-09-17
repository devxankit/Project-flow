import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import ProjectForm from '../components/ProjectForm';
import { FolderKanban, Plus, Search, Filter, Users, Calendar, TrendingUp, MoreVertical } from 'lucide-react';

const Projects = () => {
  const [filter, setFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX',
      status: 'In Progress',
      progress: 65,
      team: 4,
      dueDate: '2025-10-15',
      priority: 'High'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'iOS and Android app for customer portal',
      status: 'Planning',
      progress: 20,
      team: 6,
      dueDate: '2025-01-15',
      priority: 'Medium'
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migrate to new database system for better performance',
      status: 'Completed',
      progress: 100,
      team: 3,
      dueDate: '2024-01-20',
      priority: 'High'
    },
    {
      id: 4,
      name: 'API Integration',
      description: 'Integrate third-party APIs for enhanced functionality',
      status: 'In Progress',
      progress: 40,
      team: 2,
      dueDate: '2024-12-30',
      priority: 'Low'
    },
    {
      id: 5,
      name: 'E-commerce Platform',
      description: 'Build new e-commerce platform with modern features',
      status: 'In Progress',
      progress: 30,
      team: 5,
      dueDate: '2025-02-14',
      priority: 'High'
    },
    {
      id: 6,
      name: 'Security Audit',
      description: 'Comprehensive security audit and vulnerability assessment',
      status: 'Planning',
      progress: 10,
      team: 3,
      dueDate: '2025-01-30',
      priority: 'Medium'
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

  const filteredProjects = filter === 'all' ? projects : projects.filter(project => project.status.toLowerCase() === filter.toLowerCase());

  const handleProjectSubmit = (projectData) => {
    // In a real app, this would make an API call to create the project
    console.log('New project created:', projectData);
    // You could also update the projects state here to show the new project immediately
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Mobile Layout - Creative Tile with Button */}
          <div className="md:hidden mb-6">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Build something amazing</h2>
                  <p className="text-sm text-gray-600">Start your next project</p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="ml-4 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Create</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Keep original design */}
          <div className="hidden md:flex md:items-center md:justify-between mb-8">
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Search className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Search</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter</span>
              </button>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <h3 className="text-sm font-semibold text-gray-900">Build something amazing</h3>
                  <p className="text-xs text-gray-600">Start your next project</p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">New Project</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filter Tabs - Tiles Layout */}
          <div className="md:hidden mb-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'all', label: 'All', count: projects.length },
                { key: 'in progress', label: 'Active', count: projects.filter(p => p.status === 'In Progress').length },
                { key: 'planning', label: 'Planning', count: projects.filter(p => p.status === 'Planning').length },
                { key: 'completed', label: 'Done', count: projects.filter(p => p.status === 'Completed').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`p-4 rounded-2xl shadow-sm border transition-all ${
                    filter === key
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 active:scale-95'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg font-bold">{count}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Filter Tabs - Website Layout */}
          <div className="hidden md:block mb-8">
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', count: projects.length },
                { key: 'in progress', label: 'Active', count: projects.filter(p => p.status === 'In Progress').length },
                { key: 'planning', label: 'Planning', count: projects.filter(p => p.status === 'Planning').length },
                { key: 'completed', label: 'Done', count: projects.filter(p => p.status === 'Completed').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filter === key
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Responsive Project Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 active:scale-98 md:hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4 md:mb-6">
                  <div className="flex items-start space-x-3 md:space-x-4 flex-1">
                    <div className="p-3 md:p-4 bg-primary/10 rounded-xl md:rounded-lg">
                      <FolderKanban className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-2 mb-1 md:mb-2">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900">{project.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs md:text-sm font-medium ${getPriorityColor(project.priority)} w-fit`}>
                          {project.priority}
                        </span>
                      </div>
                      <p className="text-sm md:text-base text-gray-600 line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                  <button className="p-1 md:p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4 md:mb-6">
                  <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900 font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <Users className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      <span className="text-sm md:text-base text-gray-600">{project.team} members</span>
                    </div>
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <Calendar className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      <span className="text-sm md:text-base text-gray-600">{new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium border ${getStatusColor(project.status)} w-fit`}>
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filter or create a new project</p>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full text-sm font-medium"
              >
                Create Project
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Project Creation Form */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleProjectSubmit}
      />
    </div>
  );
};

export default Projects;
