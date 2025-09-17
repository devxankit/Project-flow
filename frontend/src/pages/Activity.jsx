import React, { useState } from 'react';
import PMNavbar from '../components/PM-Navbar';
import { Activity, Filter, Calendar, User, Clock, CheckCircle, Plus, MessageSquare, UserPlus, BarChart3, FolderPlus } from 'lucide-react';

const ActivityPage = () => {
  const [filter, setFilter] = useState('all');

  const activities = [
    {
      id: 1,
      type: 'task_completed',
      title: 'Task completed',
      description: 'John Doe completed "Update homepage design"',
      timestamp: '2024-02-08T10:30:00Z',
      user: 'John Doe',
      project: 'Website Redesign',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'project_created',
      title: 'Project created',
      description: 'New project "Mobile App Development" was created',
      timestamp: '2024-02-08T09:15:00Z',
      user: 'Jane Smith',
      project: 'Mobile App Development',
      icon: FolderPlus,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'comment_added',
      title: 'Comment added',
      description: 'Mike Johnson added a comment to "Database optimization"',
      timestamp: '2024-02-08T08:45:00Z',
      user: 'Mike Johnson',
      project: 'Database Migration',
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'task_assigned',
      title: 'Task assigned',
      description: 'Sarah Wilson was assigned to "API documentation"',
      timestamp: '2024-02-07T16:20:00Z',
      user: 'Sarah Wilson',
      project: 'Website Redesign',
      icon: UserPlus,
      color: 'text-yellow-600'
    },
    {
      id: 5,
      type: 'project_updated',
      title: 'Project updated',
      description: 'Project "Website Redesign" progress updated to 65%',
      timestamp: '2024-02-07T14:10:00Z',
      user: 'John Doe',
      project: 'Website Redesign',
      icon: BarChart3,
      color: 'text-indigo-600'
    },
    {
      id: 6,
      type: 'task_created',
      title: 'Task created',
      description: 'New task "Review user feedback" was created',
      timestamp: '2024-02-07T11:30:00Z',
      user: 'Jane Smith',
      project: 'Mobile App Development',
      icon: Plus,
      color: 'text-orange-600'
    }
  ];

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'task_completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'project_created': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'comment_added': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'task_assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'project_updated': return 'bg-primary/10 text-primary border-primary/20';
      case 'task_created': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

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
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Track team progress</h2>
                  <p className="text-sm text-gray-600">Monitor recent updates and activities</p>
                </div>
                <button className="ml-4 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span className="font-medium">Filter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Keep original design */}
          <div className="hidden md:flex md:items-center md:justify-between mb-8">
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Date Range</span>
              </button>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <h3 className="text-sm font-semibold text-gray-900">Track team progress</h3>
                  <p className="text-xs text-gray-600">Monitor recent updates and activities</p>
                </div>
                <button className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span className="font-medium">Filter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filter Tabs - Tiles Layout */}
          <div className="md:hidden mb-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'all', label: 'All', count: activities.length },
                { key: 'task_completed', label: 'Done', count: activities.filter(a => a.type === 'task_completed').length },
                { key: 'project_created', label: 'Projects', count: activities.filter(a => a.type === 'project_created').length },
                { key: 'comment_added', label: 'Comments', count: activities.filter(a => a.type === 'comment_added').length },
                { key: 'task_assigned', label: 'Tasks', count: activities.filter(a => a.type === 'task_assigned').length }
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
                { key: 'all', label: 'All', count: activities.length },
                { key: 'task_completed', label: 'Done', count: activities.filter(a => a.type === 'task_completed').length },
                { key: 'project_created', label: 'Projects', count: activities.filter(a => a.type === 'project_created').length },
                { key: 'comment_added', label: 'Comments', count: activities.filter(a => a.type === 'comment_added').length },
                { key: 'task_assigned', label: 'Tasks', count: activities.filter(a => a.type === 'task_assigned').length }
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

          {/* Responsive Activity Feed */}
          <div className="space-y-3 md:space-y-4">
            {filteredActivities.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 active:scale-98 md:hover:shadow-md transition-all">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className={`p-2 md:p-3 rounded-xl md:rounded-lg bg-gray-50 ${activity.color}`}>
                      <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1 md:mb-2">
                        <h3 className="text-sm md:text-base font-semibold text-gray-900">{activity.title}</h3>
                        <span className="text-xs md:text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm md:text-base text-gray-600 mb-2 md:mb-3">{activity.description}</p>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="w-5 h-5 md:w-6 md:h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                          </div>
                          <span className="text-xs md:text-sm text-gray-600">{activity.user}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs md:text-sm font-medium border ${getActivityTypeColor(activity.type)} w-fit`}>
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100">
                        <span className="text-xs md:text-sm text-primary font-medium">{activity.project}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filter to see more activities</p>
            </div>
          )}

          {/* Load More Button - Mobile App Style */}
          {filteredActivities.length > 0 && (
            <div className="mt-6 text-center">
              <button className="bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                Load More Activity
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActivityPage;
