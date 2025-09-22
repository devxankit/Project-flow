import React, { useState, useEffect } from 'react';
import PMNavbar from '../components/PM-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { Activity, Filter, Calendar, User, CheckCircle, Plus, MessageSquare, UserPlus, BarChart3, FolderPlus, Loader2 } from 'lucide-react';
import { activityApi } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const ActivityPage = () => {
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [allActivities, setAllActivities] = useState([]);
  const [pagination, setPagination] = useState(null);
  const { toast } = useToast();
  
  // Scroll to top when component mounts
  useScrollToTop();

  // Fetch all activity data (unfiltered)
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await activityApi.getActivities({ 
          page: 1,
          limit: 100 // Get more activities to ensure we have all for counting
        });
        
        if (response.data && response.data.success) {
          setAllActivities(response.data.data?.activities || []);
          setPagination(response.data.data?.pagination || null);
        } else {
          toast.error('Error', 'Failed to load activity data');
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast.error('Error', 'Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [toast]);

  // Filter activities based on selected filter
  const filteredActivities = filter === 'all' 
    ? allActivities 
    : allActivities.filter(activity => activity.type === filter);

  // Helper function to get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'subtask_completed': return CheckCircle;
      case 'customer_created': return FolderPlus;
      case 'comment_added': return MessageSquare;
      case 'task_assigned': return UserPlus;
      case 'customer_updated': return BarChart3;
      case 'task_created': return Plus;
      case 'subtask_created': return BarChart3;
      case 'task_completed': return CheckCircle;
      case 'team_member_added': return UserPlus;
      case 'file_uploaded': return Plus;
      default: return Activity;
    }
  };

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'subtask_completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'customer_created': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'comment_added': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'task_assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'customer_updated': return 'bg-primary/10 text-primary border-primary/20';
      case 'task_created': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'subtask_created': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'task_completed': return 'bg-green-100 text-green-800 border-green-200';
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <PMNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-gray-600">Loading activities...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                { key: 'all', label: 'All', count: allActivities.length },
                { key: 'task_completed', label: 'Done', count: allActivities.filter(a => a.type === 'task_completed').length },
                { key: 'project_created', label: 'Projects', count: allActivities.filter(a => a.type === 'project_created').length },
                { key: 'comment_added', label: 'Comments', count: allActivities.filter(a => a.type === 'comment_added').length }
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
                { key: 'all', label: 'All', count: allActivities.length },
                { key: 'task_completed', label: 'Done', count: allActivities.filter(a => a.type === 'task_completed').length },
                { key: 'project_created', label: 'Projects', count: allActivities.filter(a => a.type === 'project_created').length },
                { key: 'comment_added', label: 'Comments', count: allActivities.filter(a => a.type === 'comment_added').length }
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

          {/* Enhanced Activity Feed */}
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="group bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200">
                  <div className="flex items-start space-x-3">
                    {/* Activity Icon - Smaller and more compact */}
                    <div className={`p-2 rounded-lg ${getActivityTypeColor(activity.type)} flex-shrink-0`}>
                      <IconComponent className="h-4 w-4" />
                    </div>

                    {/* Activity Content - Better space utilization */}
                    <div className="flex-1 min-w-0">
                      {/* Header Section - More compact */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors duration-200 mb-1">
                            {activity.title}
                          </h3>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {activity.description}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-gray-500 ml-2 flex-shrink-0">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>

                      {/* Meta Information - More compact layout */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{activity.actor?.fullName || 'Unknown'}</span>
                        </div>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Project and Milestone Information - Inline layout */}
                      <div className="flex items-center space-x-4">
                        {activity.project && (
                          <div className="flex items-center space-x-1.5">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <span className="text-xs font-semibold text-primary">{activity.project.name}</span>
                          </div>
                        )}
                        {activity.target && activity.target.title && (
                          <div className="flex items-center space-x-1.5">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                            <span className="text-xs font-medium text-orange-600">{activity.target.title}</span>
                          </div>
                        )}
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
          {filteredActivities.length > 0 && pagination && pagination.pages > 1 && (
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
