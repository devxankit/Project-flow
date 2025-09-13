import React, { useState } from 'react';
import PMNavbar from '../components/PM-Navbar';
import { CheckSquare, Plus, Search, Filter, Calendar, User } from 'lucide-react';
import { Button } from '../components/magicui/button';

const Tasks = () => {
  const [filter, setFilter] = useState('all');

  const tasks = [
    {
      id: 1,
      title: 'Update homepage design',
      description: 'Implement new design mockups for homepage',
      status: 'In Progress',
      priority: 'High',
      assignee: 'John Doe',
      dueDate: '2024-02-10',
      project: 'Website Redesign'
    },
    {
      id: 2,
      title: 'Review user feedback',
      description: 'Analyze and categorize user feedback from surveys',
      status: 'Pending',
      priority: 'Medium',
      assignee: 'Jane Smith',
      dueDate: '2024-02-12',
      project: 'Mobile App Development'
    },
    {
      id: 3,
      title: 'Database optimization',
      description: 'Optimize database queries for better performance',
      status: 'Completed',
      priority: 'High',
      assignee: 'Mike Johnson',
      dueDate: '2024-02-05',
      project: 'Database Migration'
    },
    {
      id: 4,
      title: 'API documentation',
      description: 'Create comprehensive API documentation',
      status: 'In Progress',
      priority: 'Low',
      assignee: 'Sarah Wilson',
      dueDate: '2024-02-15',
      project: 'Website Redesign'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="min-h-screen bg-gray-50">
      <PMNavbar />
      
      <main className="pt-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tasks</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">Track and manage all your tasks</p>
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
                <span className="hidden xs:inline">New Task</span>
                <span className="xs:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
              {[
                { key: 'all', label: 'All Tasks', shortLabel: 'All' },
                { key: 'pending', label: 'Pending', shortLabel: 'Pending' },
                { key: 'in progress', label: 'In Progress', shortLabel: 'Active' },
                { key: 'completed', label: 'Completed', shortLabel: 'Done' }
              ].map(({ key, label, shortLabel }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {filter === 'all' ? 'All Tasks' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks`}
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                          <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{task.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 break-words">{task.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <span className="text-primary font-medium">{task.project}</span>
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

export default Tasks;
