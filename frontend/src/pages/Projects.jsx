import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import ProjectForm from '../components/ProjectForm';
import useScrollToTop from '../hooks/useScrollToTop';
import { FolderKanban, Plus, Search, Filter, Users, Calendar, TrendingUp, MoreVertical, Loader2 } from 'lucide-react';
import { projectApi, handleApiError } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const Projects = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useScrollToTop();

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await projectApi.getAllProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Error', 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

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
      case 'active': return 'Active';
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
      case 'normal': return 'Normal';
      case 'low': return 'Low';
      default: return priority;
    }
  };

  // Filter projects based on status and search term
  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.status === filter;
    const matchesSearch = !searchTerm || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleProjectSubmit = (projectData) => {
    // Refresh projects list after creating a new project
    loadProjects();
    setIsFormOpen(false);
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
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Manage your projects</h2>
                  <p className="text-sm text-gray-600">Create and track project progress</p>
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
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
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
                { key: 'active', label: 'Active', count: projects.filter(p => p.status === 'active').length },
                { key: 'planning', label: 'Planning', count: projects.filter(p => p.status === 'planning').length },
                { key: 'completed', label: 'Done', count: projects.filter(p => p.status === 'completed').length }
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
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-lg font-bold">{count}</span>
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
                { key: 'active', label: 'Active', count: projects.filter(p => p.status === 'active').length },
                { key: 'planning', label: 'Planning', count: projects.filter(p => p.status === 'planning').length },
                { key: 'completed', label: 'Done', count: projects.filter(p => p.status === 'completed').length }
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading projects...</span>
            </div>
          )}

          {/* Responsive Project Cards */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProjects.map((project) => (
                <div 
                  key={project._id} 
                  onClick={() => navigate(`/project/${project._id}`)}
                  className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:scale-[0.98]"
                >
                {/* Header Section */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                      <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                          {project.name}
                        </h3>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle menu click
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200 ml-1"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
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
            ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredProjects.length === 0 && (
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
