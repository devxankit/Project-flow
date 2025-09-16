import React from 'react';
import PMNavbar from '../components/PM-Navbar';
import { 
  FolderKanban, 
  CheckSquare, 
  TrendingUp, 
  Users, 
  Calendar, 
  Bell, 
  Plus,
  BarChart3,
  Clock,
  Star,
  ArrowRight
} from 'lucide-react';

const Home = () => {
  const quickStats = [
    { label: 'Active Projects', value: '12', icon: FolderKanban, color: 'text-primary' },
    { label: 'Completed Tasks', value: '48', icon: CheckSquare, color: 'text-green-600' },
    { label: 'Team Members', value: '24', icon: Users, color: 'text-blue-600' },
    { label: 'This Week', value: '8', icon: Calendar, color: 'text-purple-600' }
  ];

  const recentProjects = [
    { name: 'Website Redesign', progress: 65, status: 'In Progress', dueDate: 'Feb 15' },
    { name: 'Mobile App', progress: 20, status: 'Planning', dueDate: 'Mar 30' },
    { name: 'Database Migration', progress: 100, status: 'Completed', dueDate: 'Jan 20' }
  ];

  const upcomingTasks = [
    { title: 'Review design mockups', project: 'Website Redesign', dueDate: 'Today' },
    { title: 'Update API documentation', project: 'Mobile App', dueDate: 'Tomorrow' },
    { title: 'Team standup meeting', project: 'All Projects', dueDate: 'Tomorrow' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Responsive Welcome Section */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Welcome back!</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Here's what's happening today</p>
              </div>
              <button className="p-3 bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-shadow md:rounded-lg md:px-4 md:py-2 md:flex md:items-center md:space-x-2">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="hidden md:block text-sm font-medium text-gray-700">Notifications</span>
              </button>
            </div>
          </div>

          {/* Responsive Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            {quickStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 active:scale-95 md:hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <IconComponent className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
                    <span className="text-xs md:text-sm text-gray-500">Today</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs md:text-sm text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Desktop Layout - Two Column Grid */}
          <div className="md:grid md:grid-cols-2 md:gap-8 md:mb-8">
            {/* Quick Actions - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
                <button className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl md:rounded-lg p-4 shadow-sm active:scale-95 md:hover:shadow-md transition-all flex flex-col md:flex-row items-center md:justify-start space-y-2 md:space-y-0 md:space-x-3">
                  <Plus className="h-6 w-6 md:h-5 md:w-5" />
                  <p className="text-sm md:text-base font-medium">New Task</p>
                </button>
                <button className="bg-white border border-gray-200 rounded-2xl md:rounded-lg p-4 shadow-sm active:scale-95 md:hover:shadow-md transition-all flex flex-col md:flex-row items-center md:justify-start space-y-2 md:space-y-0 md:space-x-3">
                  <FolderKanban className="h-6 w-6 md:h-5 md:w-5 text-primary" />
                  <p className="text-sm md:text-base font-medium text-gray-900">New Project</p>
                </button>
              </div>
            </div>

            {/* Recent Projects - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Recent Projects</h2>
                <button className="text-primary text-sm md:text-base font-medium flex items-center">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                {recentProjects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1 md:mb-2">
                        <h3 className="text-sm md:text-base font-medium text-gray-900">{project.name}</h3>
                        <span className="text-xs md:text-sm text-gray-500">{project.dueDate}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 mb-1 md:mb-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary-dark h-1.5 md:h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-gray-600">{project.progress}% complete</span>
                        <span className={`text-xs md:text-sm px-2 py-1 rounded-full ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'In Progress' ? 'bg-primary/10 text-primary' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Layout - Two Column Grid */}
          <div className="md:grid md:grid-cols-2 md:gap-8 md:mb-8">
            {/* Upcoming Tasks - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Upcoming Tasks</h2>
                <button className="text-primary text-sm md:text-base font-medium flex items-center">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              <div className="space-y-3 md:space-y-4">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-lg">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs md:text-sm text-gray-600">{task.project}</p>
                    </div>
                    <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-500">
                      <Clock className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Overview - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Performance</h2>
                <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                    <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                  </div>
                  <p className="text-lg md:text-xl font-bold text-gray-900">85%</p>
                  <p className="text-xs md:text-sm text-gray-600">Efficiency</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                    <Star className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                  </div>
                  <p className="text-lg md:text-xl font-bold text-gray-900">4.8</p>
                  <p className="text-xs md:text-sm text-gray-600">Rating</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                  </div>
                  <p className="text-lg md:text-xl font-bold text-gray-900">24</p>
                  <p className="text-xs md:text-sm text-gray-600">Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
