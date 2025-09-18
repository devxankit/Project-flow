import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import TaskForm from '../components/TaskForm';
import useScrollToTop from '../hooks/useScrollToTop';
import { CheckSquare, Plus, Search, Filter, Calendar, User, Clock, MoreVertical } from 'lucide-react';

const Tasks = () => {
  const [filter, setFilter] = useState('all');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useScrollToTop();

  // Handle task form submission
  const handleTaskSubmit = (taskData) => {
    console.log('New task created:', taskData);
    // Here you would typically send the data to your backend API
    // For now, we'll just log it and close the form
    setIsTaskFormOpen(false);
  };

  const tasks = [
    {
      id: 1,
      title: 'Update homepage design',
      description: 'Implement new design mockups for homepage',
      status: 'In Progress',
      priority: 'High',
      assignee: 'John Doe',
      dueDate: '2024-02-10',
      project: 'Website Redesign',
      milestone: 'Design Phase'
    },
    {
      id: 2,
      title: 'Review user feedback',
      description: 'Analyze and categorize user feedback from surveys',
      status: 'Pending',
      priority: 'Medium',
      assignee: 'Jane Smith',
      dueDate: '2024-02-12',
      project: 'Mobile App Development',
      milestone: 'Research Phase'
    },
    {
      id: 3,
      title: 'Database optimization',
      description: 'Optimize database queries for better performance',
      status: 'Completed',
      priority: 'High',
      assignee: 'Mike Johnson',
      dueDate: '2024-02-05',
      project: 'Database Migration',
      milestone: 'Implementation Phase'
    },
    {
      id: 4,
      title: 'API documentation',
      description: 'Create comprehensive API documentation',
      status: 'In Progress',
      priority: 'Low',
      assignee: 'Sarah Wilson',
      dueDate: '2024-02-15',
      project: 'Website Redesign',
      milestone: 'Development Phase'
    },
    {
      id: 5,
      title: 'User authentication setup',
      description: 'Implement secure user authentication system',
      status: 'Pending',
      priority: 'High',
      assignee: 'Alex Brown',
      dueDate: '2024-02-18',
      project: 'E-commerce Platform',
      milestone: 'Security Phase'
    },
    {
      id: 6,
      title: 'Performance testing',
      description: 'Conduct comprehensive performance testing',
      status: 'In Progress',
      priority: 'Medium',
      assignee: 'Emma Davis',
      dueDate: '2024-02-20',
      project: 'API Integration',
      milestone: 'Testing Phase'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status.toLowerCase() === filter.toLowerCase());

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
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Manage your tasks</h2>
                  <p className="text-sm text-gray-600">Add new tasks and track progress</p>
                </div>
                <button 
                  onClick={() => setIsTaskFormOpen(true)}
                  className="ml-4 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add Task</span>
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
                  <h3 className="text-sm font-semibold text-gray-900">Stay productive today</h3>
                  <p className="text-xs text-gray-600">Add new tasks and track progress</p>
                </div>
                <button className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">New Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filter Tabs - Tiles Layout */}
          <div className="md:hidden mb-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'all', label: 'All', count: tasks.length },
                { key: 'pending', label: 'Pending', count: tasks.filter(t => t.status === 'Pending').length },
                { key: 'in progress', label: 'Active', count: tasks.filter(t => t.status === 'In Progress').length },
                { key: 'completed', label: 'Done', count: tasks.filter(t => t.status === 'Completed').length }
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
                { key: 'all', label: 'All', count: tasks.length },
                { key: 'pending', label: 'Pending', count: tasks.filter(t => t.status === 'Pending').length },
                { key: 'in progress', label: 'Active', count: tasks.filter(t => t.status === 'In Progress').length },
                { key: 'completed', label: 'Done', count: tasks.filter(t => t.status === 'Completed').length }
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

          {/* Responsive Task Cards - Balanced Magic UI Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => navigate(`/pm-task/${task.id}`)}
                className="group relative bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Magic UI Border Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Header */}
                <div className="relative flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${getStatusColor(task.status)} flex-shrink-0`}>
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle menu click
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-all duration-200 flex-shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {task.description}
                </p>

                {/* Tags Row */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>

                {/* Project & Milestone */}
                <div className="mb-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <span className="text-primary font-semibold">{task.project}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <span className="text-primary font-semibold">{task.milestone}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 text-gray-500">
                      <User className="h-3.5 w-3.5" />
                      <span className="text-xs">{task.assignee}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs">
                        {new Date(task.dueDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${
                      (() => {
                        const now = new Date();
                        const dueDate = new Date(task.dueDate);
                        const diffTime = dueDate.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays < 0) return 'text-red-600';
                        if (diffDays <= 1) return 'text-orange-600';
                        if (diffDays <= 3) return 'text-yellow-600';
                        return 'text-green-600';
                      })()
                    }`}>
                      {(() => {
                        const now = new Date();
                        const dueDate = new Date(task.dueDate);
                        const diffTime = dueDate.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays < 0) {
                          return `${Math.abs(diffDays)}d`;
                        } else if (diffDays === 0) {
                          return 'Today';
                        } else if (diffDays === 1) {
                          return '1d';
                        } else {
                          return `${diffDays}d`;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filter or create a new task</p>
              <button className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full text-sm font-medium">
                Create Task
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Task Form */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleTaskSubmit}
      />
    </div>
  );
};

export default Tasks;
