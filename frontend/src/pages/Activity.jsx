import React, { useState } from 'react';
import PMNavbar from '../components/PM-Navbar';
import { Activity, Filter, Calendar, User, Clock } from 'lucide-react';
import { Button } from '../components/magicui/button';

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
      icon: '✅'
    },
    {
      id: 2,
      type: 'project_created',
      title: 'Project created',
      description: 'New project "Mobile App Development" was created',
      timestamp: '2024-02-08T09:15:00Z',
      user: 'Jane Smith',
      project: 'Mobile App Development',
      icon: '📁'
    },
    {
      id: 3,
      type: 'comment_added',
      title: 'Comment added',
      description: 'Mike Johnson added a comment to "Database optimization"',
      timestamp: '2024-02-08T08:45:00Z',
      user: 'Mike Johnson',
      project: 'Database Migration',
      icon: '💬'
    },
    {
      id: 4,
      type: 'task_assigned',
      title: 'Task assigned',
      description: 'Sarah Wilson was assigned to "API documentation"',
      timestamp: '2024-02-07T16:20:00Z',
      user: 'Sarah Wilson',
      project: 'Website Redesign',
      icon: '👤'
    },
    {
      id: 5,
      type: 'project_updated',
      title: 'Project updated',
      description: 'Project "Website Redesign" progress updated to 65%',
      timestamp: '2024-02-07T14:10:00Z',
      user: 'John Doe',
      project: 'Website Redesign',
      icon: '📊'
    },
    {
      id: 6,
      type: 'task_created',
      title: 'Task created',
      description: 'New task "Review user feedback" was created',
      timestamp: '2024-02-07T11:30:00Z',
      user: 'Jane Smith',
      project: 'Mobile App Development',
      icon: '➕'
    }
  ];

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'task_completed': return 'bg-green-100 text-green-800';
      case 'project_created': return 'bg-blue-100 text-blue-800';
      case 'comment_added': return 'bg-purple-100 text-purple-800';
      case 'task_assigned': return 'bg-yellow-100 text-yellow-800';
      case 'project_updated': return 'bg-indigo-100 text-indigo-800';
      case 'task_created': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <PMNavbar />
      
      <main className="pt-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity</h1>
              <p className="mt-2 text-gray-600">Track all project activities and updates</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button variant="outline" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Date Range</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'all', label: 'All Activity' },
              { key: 'task_completed', label: 'Completed' },
              { key: 'project_created', label: 'Projects' },
              { key: 'comment_added', label: 'Comments' },
              { key: 'task_assigned', label: 'Assignments' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                        {activity.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{activity.user}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(activity.timestamp)}</span>
                        </div>
                        <span className="text-primary font-medium">{activity.project}</span>
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

export default ActivityPage;
