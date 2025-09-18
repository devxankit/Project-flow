import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeNavbar from '../components/Employee-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Calendar, User, FolderKanban } from 'lucide-react';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useScrollToTop();
  
  // Mock user data - in a real app, this would come from authentication context
  const currentUser = {
    fullName: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'Frontend Developer'
  };

  // Mock tasks data - only tasks assigned to this employee
  const tasks = [
    {
      id: 1,
      title: 'Update homepage design',
      description: 'Implement new design mockups for homepage with responsive layout',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Mike Johnson',
      dueDate: '2024-02-10',
      project: 'Website Redesign',
      milestone: 'Design Phase',
      createdDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'Implement responsive design',
      description: 'Ensure all pages work perfectly on mobile devices, tablets, and desktop screens',
      status: 'Not Started',
      priority: 'High',
      assignee: 'Mike Johnson',
      dueDate: '2024-02-12',
      project: 'Website Redesign',
      milestone: 'Development Phase',
      createdDate: '2024-01-20'
    },
    {
      id: 3,
      title: 'Fix navigation bugs',
      description: 'Resolve issues with mobile navigation menu and dropdown functionality',
      status: 'Blocked',
      priority: 'Medium',
      assignee: 'Mike Johnson',
      dueDate: '2024-02-05',
      project: 'Website Redesign',
      milestone: 'Bug Fixes',
      createdDate: '2024-01-25'
    },
    {
      id: 4,
      title: 'Optimize page load speed',
      description: 'Improve website performance by optimizing images and code',
      status: 'Done',
      priority: 'Low',
      assignee: 'Mike Johnson',
      dueDate: '2024-01-30',
      project: 'Website Redesign',
      milestone: 'Performance',
      createdDate: '2024-01-10'
    },
    {
      id: 5,
      title: 'Create user dashboard',
      description: 'Build a new user dashboard with modern UI components',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Mike Johnson',
      dueDate: '2024-02-15',
      project: 'Mobile App Development',
      milestone: 'Frontend Development',
      createdDate: '2024-01-28'
    },
    {
      id: 6,
      title: 'Setup testing environment',
      description: 'Configure Jest and React Testing Library for component testing',
      status: 'Not Started',
      priority: 'Medium',
      assignee: 'Mike Johnson',
      dueDate: '2024-02-20',
      project: 'Mobile App Development',
      milestone: 'Testing Setup',
      createdDate: '2024-02-01'
    }
  ];

  const [filter, setFilter] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'Not Started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Blocked': return 'bg-red-100 text-red-800 border-red-200';
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

  // Filter tasks based on selected filter
  const filteredTasks = (() => {
    switch (filter) {
      case 'due-soon':
        return tasks.filter(task => {
          const now = new Date();
          const dueDate = new Date(task.dueDate);
          const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 3 && diffDays >= 0 && task.status !== 'Done';
        });
      case 'overdue':
        return tasks.filter(task => {
          const now = new Date();
          const dueDate = new Date(task.dueDate);
          const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays < 0 && task.status !== 'Done';
        });
      case 'done':
        return tasks.filter(task => task.status === 'Done');
      case 'high-priority':
        return tasks.filter(task => task.priority === 'High' && task.status !== 'Done');
      case 'project':
        return tasks.filter(task => task.project === 'Website Redesign');
      default:
        return tasks;
    }
  })();

  // Calculate stats
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const dueSoonTasks = tasks.filter(task => {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0 && task.status !== 'Done';
  }).length;
  const overdueTasks = tasks.filter(task => {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 0 && task.status !== 'Done';
  }).length;

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
                  Welcome, {currentUser.fullName}!
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Here's your task overview</p>
              </div>
            </div>
          </div>

          {/* Quick Stats - Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-lg">
                  <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Total</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalTasks}</p>
              <p className="text-xs md:text-sm text-gray-600">Tasks</p>
            </div>

            <div className="w-full bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-green-100 rounded-xl md:rounded-lg">
                  <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Done</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{doneTasks}</p>
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

          {/* Visual Progress Section */}
          <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Task Progress Overview</h3>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            
            {/* Overall Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Overall Completion</span>
                <span className="text-sm font-bold text-primary">{totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-primary to-primary-dark h-4 rounded-full transition-all duration-700"
                  style={{ width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{doneTasks} completed</span>
                <span>{totalTasks - doneTasks} remaining</span>
              </div>
            </div>

            {/* Task Status Distribution */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-green-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">{totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Completed</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">{totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-yellow-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${totalTasks > 0 ? (dueSoonTasks / totalTasks) * 100 : 0}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">{totalTasks > 0 ? Math.round((dueSoonTasks / totalTasks) * 100) : 0}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Due Soon</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-red-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">{totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Overdue</p>
              </div>
            </div>
          </div>

          {/* Mobile Filter Tabs - Tiles Layout */}
          <div className="md:hidden mb-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'all', label: 'All', count: totalTasks },
                { key: 'done', label: 'Done', count: doneTasks },
                { key: 'due-soon', label: 'Due Soon', count: dueSoonTasks },
                { key: 'overdue', label: 'Overdue', count: overdueTasks }
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
                { key: 'all', label: 'All', count: totalTasks },
                { key: 'done', label: 'Done', count: doneTasks },
                { key: 'due-soon', label: 'Due Soon', count: dueSoonTasks },
                { key: 'overdue', label: 'Overdue', count: overdueTasks }
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

          {/* Tasks Section */}
          <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">My Tasks</h2>
              <span className="text-sm text-gray-500">{filteredTasks.length} tasks</span>
            </div>

            {/* Responsive Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => navigate(`/employee-task/${task.id}`)}
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                        <CheckSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors duration-300">
                            {task.title}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-1.5 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                    {task.description}
                  </p>

                  {/* Project & Milestone */}
                  <div className="mb-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <FolderKanban className="h-3 w-3" />
                        <span className="text-primary font-semibold">{task.project}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <span className="text-primary font-semibold">{task.milestone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <User className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{task.assignee}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">
                          {new Date(task.dueDate).toLocaleDateString('en-US', { 
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
                          const dueDate = new Date(task.dueDate);
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

            {/* Empty State */}
            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filter to see more tasks</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
