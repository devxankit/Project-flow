import React from 'react';
import PMNavbar from '../components/PM-Navbar';
import { FolderKanban, CheckSquare, Clock, TrendingUp, Plus, Bell, Users, Calendar } from 'lucide-react';

const PMDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      {/* Main Content - Responsive Design */}
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Welcome Section - Responsive */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Good morning!</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Here's your project overview</p>
              </div>
              <button className="p-3 bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-shadow md:rounded-lg md:px-4 md:py-2 md:flex md:items-center md:space-x-2">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="hidden md:block text-sm font-medium text-gray-700">Notifications</span>
              </button>
            </div>
          </div>

          {/* Quick Stats - Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 active:scale-95 md:hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-lg">
                  <FolderKanban className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Active</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">12</p>
              <p className="text-xs md:text-sm text-gray-600">Projects</p>
            </div>

            <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 active:scale-95 md:hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-green-100 rounded-xl md:rounded-lg">
                  <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Done</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">48</p>
              <p className="text-xs md:text-sm text-gray-600">Tasks</p>
            </div>

            <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 active:scale-95 md:hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-blue-100 rounded-xl md:rounded-lg">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Team</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">24</p>
              <p className="text-xs md:text-sm text-gray-600">Members</p>
            </div>

            <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 active:scale-95 md:hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="p-2 md:p-3 bg-purple-100 rounded-xl md:rounded-lg">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">This Week</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">8</p>
              <p className="text-xs md:text-sm text-gray-600">Deadlines</p>
            </div>
          </div>

          {/* Desktop Layout - Two Column Grid */}
          <div className="md:grid md:grid-cols-2 md:gap-8 md:mb-8">
            {/* Progress Overview - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Progress Overview</h2>
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div>
                  <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                    <span className="text-gray-600">Website Redesign</span>
                    <span className="text-gray-900 font-medium">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                    <div className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full" style={{width: '65%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                    <span className="text-gray-600">Mobile App</span>
                    <span className="text-gray-900 font-medium">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                    <div className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full" style={{width: '20%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm md:text-base mb-2 md:mb-3">
                    <span className="text-gray-600">Database Migration</span>
                    <span className="text-gray-900 font-medium">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                    <div className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Responsive */}
            <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
                <button className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl md:rounded-lg p-4 md:p-4 shadow-sm active:scale-95 md:hover:shadow-md transition-all flex flex-col md:flex-row items-center md:justify-start space-y-2 md:space-y-0 md:space-x-3">
                  <Plus className="h-6 w-6 md:h-5 md:w-5" />
                  <p className="text-sm md:text-base font-medium">New Task</p>
                </button>
                <button className="bg-white border border-gray-200 rounded-2xl md:rounded-lg p-4 md:p-4 shadow-sm active:scale-95 md:hover:shadow-md transition-all flex flex-col md:flex-row items-center md:justify-start space-y-2 md:space-y-0 md:space-x-3">
                  <FolderKanban className="h-6 w-6 md:h-5 md:w-5 text-primary" />
                  <p className="text-sm md:text-base font-medium text-gray-900">New Project</p>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity - Responsive */}
          <div className="bg-white rounded-2xl md:rounded-lg shadow-sm border border-gray-100">
            <div className="p-5 md:p-6 border-b border-gray-100">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="p-4 md:p-6 flex items-start space-x-3 md:space-x-4">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base text-gray-900 font-medium">Project "Website Redesign" was updated</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="p-4 md:p-6 flex items-start space-x-3 md:space-x-4">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base text-gray-900 font-medium">Task "Update homepage" was completed</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">4 hours ago</p>
                </div>
              </div>
              
              <div className="p-4 md:p-6 flex items-start space-x-3 md:space-x-4">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base text-gray-900 font-medium">New task "Review designs" was created</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">6 hours ago</p>
                </div>
              </div>
              
              <div className="p-4 md:p-6 flex items-start space-x-3 md:space-x-4">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base text-gray-900 font-medium">Team member joined "Mobile App" project</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PMDashboard;
