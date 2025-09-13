import React from 'react';
import PMNavbar from '../components/PM-Navbar';
import { FolderKanban, Plus, Search, Filter } from 'lucide-react';
import { Button } from '../components/magicui/button';

const Projects = () => {
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of company website',
      status: 'In Progress',
      progress: 65,
      team: 4,
      dueDate: '2024-02-15'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'iOS and Android app for customer portal',
      status: 'Planning',
      progress: 20,
      team: 6,
      dueDate: '2024-03-30'
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migrate to new database system',
      status: 'Completed',
      progress: 100,
      team: 3,
      dueDate: '2024-01-20'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PMNavbar />
      
      <main className="pt-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Projects</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">Manage and track all your projects</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" className="flex items-center justify-center space-x-2 text-sm">
                <Search className="h-4 w-4" />
                <span className="hidden xs:inline">Search</span>
                <span className="xs:hidden">Search</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center space-x-2 text-sm">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
              <Button className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-hover hover:to-primary text-white flex items-center justify-center space-x-2 text-sm">
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">New Project</span>
                <span className="xs:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-600">
                    <span>Team: {project.team} members</span>
                    <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
