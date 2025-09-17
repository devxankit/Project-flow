import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import { 
  FolderKanban, 
  Calendar, 
  Users, 
  CheckSquare, 
  TrendingUp,
  Clock,
  Target,
  User,
  MessageSquare,
  Plus,
  MoreVertical,
  BarChart3,
  FileText,
  Settings,
  Flag
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeLeft, setTimeLeft] = useState('');

  // Mock project data - should match the data from Projects page
  const projectsData = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX and improved user experience',
      status: 'In Progress',
      progress: 65,
      team: 4,
      dueDate: '2025-10-15',
      priority: 'High',
      startDate: '2024-01-01',
      budget: '$50,000',
      client: 'Acme Corporation'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'iOS and Android app for customer portal with modern features and intuitive design',
      status: 'Planning',
      progress: 20,
      team: 6,
      dueDate: '2025-01-15',
      priority: 'Medium',
      startDate: '2024-02-01',
      budget: '$75,000',
      client: 'TechCorp Inc'
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migrate to new database system for better performance and scalability',
      status: 'Completed',
      progress: 100,
      team: 3,
      dueDate: '2024-01-20',
      priority: 'High',
      startDate: '2023-12-01',
      budget: '$30,000',
      client: 'DataFlow Systems'
    },
    {
      id: 4,
      name: 'API Integration',
      description: 'Integrate third-party APIs for enhanced functionality and seamless user experience',
      status: 'In Progress',
      progress: 40,
      team: 2,
      dueDate: '2024-12-30',
      priority: 'Low',
      startDate: '2024-03-01',
      budget: '$25,000',
      client: 'Integration Solutions'
    },
    {
      id: 5,
      name: 'E-commerce Platform',
      description: 'Build new e-commerce platform with modern features and secure payment processing',
      status: 'In Progress',
      progress: 30,
      team: 5,
      dueDate: '2025-02-14',
      priority: 'High',
      startDate: '2024-04-01',
      budget: '$100,000',
      client: 'ShopMaster Ltd'
    },
    {
      id: 6,
      name: 'Security Audit',
      description: 'Comprehensive security audit and vulnerability assessment for enterprise systems',
      status: 'Planning',
      progress: 10,
      team: 3,
      dueDate: '2025-01-30',
      priority: 'Medium',
      startDate: '2024-05-01',
      budget: '$40,000',
      client: 'SecureTech Corp'
    }
  ];

  // Find the project based on the ID parameter
  const project = projectsData.find(p => p.id === parseInt(id));
  
  // If project not found, redirect to projects page
  useEffect(() => {
    if (!project) {
      navigate('/projects');
    }
  }, [project, navigate]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  
  // Return early if project not found
  if (!project) {
    return null;
  }

  // Countdown logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const dueDate = new Date(project.dueDate);
      const difference = dueDate.getTime() - now.getTime();

      if (difference > 0) {
        // Project is not overdue - show remaining time
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`);
        } else if (hours > 0) {
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${minutes}m left`);
        }
      } else {
        // Project is overdue - show how many days overdue
        const overdueDays = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
        const overdueHours = Math.floor((Math.abs(difference) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (overdueDays > 0) {
          setTimeLeft(`${overdueDays}d overdue`);
        } else {
          setTimeLeft(`${overdueHours}h overdue`);
        }
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [project.dueDate]);

  const milestones = [
    { id: 1, title: 'Design Phase', status: 'Completed', progress: 100, dueDate: '2024-01-15' },
    { id: 2, title: 'Development Phase', status: 'In Progress', progress: 65, dueDate: '2024-02-15' },
    { id: 3, title: 'Testing Phase', status: 'Pending', progress: 0, dueDate: '2024-02-20' },
    { id: 4, title: 'Launch Phase', status: 'Pending', progress: 0, dueDate: '2024-02-25' }
  ];

  const tasks = [
    { id: 1, title: 'Create wireframes', status: 'Completed', assignee: 'John Doe', dueDate: '2024-01-10' },
    { id: 2, title: 'Design homepage', status: 'In Progress', assignee: 'Jane Smith', dueDate: '2024-02-05' },
    { id: 3, title: 'Implement responsive design', status: 'Pending', assignee: 'Mike Johnson', dueDate: '2024-02-12' },
    { id: 4, title: 'Content integration', status: 'Pending', assignee: 'Sarah Wilson', dueDate: '2024-02-15' }
  ];

  const team = [
    { id: 1, name: 'John Doe', role: 'Project Manager', avatar: 'JD', status: 'online' },
    { id: 2, name: 'Jane Smith', role: 'UI/UX Designer', avatar: 'JS', status: 'online' },
    { id: 3, name: 'Mike Johnson', role: 'Frontend Developer', avatar: 'MJ', status: 'away' },
    { id: 4, name: 'Sarah Wilson', role: 'Backend Developer', avatar: 'SW', status: 'offline' }
  ];


  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'milestones', label: 'Milestones', icon: Target },
    { key: 'tasks', label: 'Tasks', icon: CheckSquare },
    { key: 'team', label: 'Team', icon: Users }
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

  const getDueDateColor = () => {
    const now = new Date();
    const dueDate = new Date(project.dueDate);
    const difference = dueDate.getTime() - now.getTime();
    const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (difference < 0) {
      return 'bg-red-100 text-red-800 border-red-200'; // Overdue
    } else if (daysLeft <= 1) {
      return 'bg-orange-100 text-orange-800 border-orange-200'; // Critical
    } else if (daysLeft <= 3) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Warning
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200'; // Normal
    }
  };

  const getCountdownColor = () => {
    const now = new Date();
    const dueDate = new Date(project.dueDate);
    const difference = dueDate.getTime() - now.getTime();
    const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (difference < 0) {
      return 'text-red-600'; // Overdue
    } else if (daysLeft <= 1) {
      return 'text-orange-600'; // Critical
    } else if (daysLeft <= 3) {
      return 'text-yellow-600'; // Warning
    } else {
      return 'text-blue-600'; // Normal
    }
  };


  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Stats - Mobile App Style */}
      <div className="space-y-4">
        {/* Progress Card - Featured */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-6 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/20 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
                <p className="text-sm text-gray-600">Overall completion status</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{project.progress}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Tasks Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
                <div className="text-xs text-gray-500">Total Tasks</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {tasks.filter(t => t.status === 'Completed').length} completed
            </div>
          </div>

          {/* Team Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{project.team}</div>
                <div className="text-xs text-gray-500">Team Members</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              Active contributors
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">Timeline</div>
                  <div className="text-sm text-gray-600">Project deadline</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getCountdownColor()}`}>
                  {timeLeft}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(project.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Information Card */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 shadow-sm">
        {/* Card Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary/20 rounded-xl">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Project Information</h3>
        </div>

        {/* Client Section */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {project.client.split(' ').map(word => word[0]).join('').substring(0, 2)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-primary/80 uppercase tracking-wide mb-1">Client</p>
            <p className="text-lg font-bold text-gray-900">{project.client}</p>
          </div>
        </div>

        {/* Date Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date Box */}
          <div className="bg-white/50 rounded-xl p-4 border border-primary/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Start Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(project.startDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Due Date Box */}
          <div className="bg-white/50 rounded-xl p-4 border border-primary/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Due Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(project.dueDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMilestones = () => (
    <div className="space-y-4">
      {milestones.map((milestone) => (
        <div key={milestone.id} className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">{milestone.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium border ${getStatusColor(milestone.status)}`}>
              {milestone.status}
            </span>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">{milestone.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
              <div 
                className="bg-gradient-to-r from-primary to-primary-dark h-2 md:h-3 rounded-full transition-all duration-300"
                style={{ width: `${milestone.progress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
            <span>{milestone.progress}% complete</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`p-2 rounded-xl ${getStatusColor(task.status)}`}>
                <CheckSquare className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{task.assignee}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTeam = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {team.map((member) => (
        <div key={member.id} className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm md:text-base font-semibold text-primary">{member.avatar}</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                member.status === 'online' ? 'bg-green-500' :
                member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
              }`}></div>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.role}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${
              member.status === 'online' ? 'bg-green-100 text-green-800' :
              member.status === 'away' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {member.status}
            </span>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );


  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'milestones': return renderMilestones();
      case 'tasks': return renderTasks();
      case 'team': return renderTeam();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <PMNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Mobile Layout - Professional Design */}
          <div className="md:hidden mb-8">
            {/* Project Header Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{project.name}</h1>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={`text-sm font-semibold ${getCountdownColor()}`}>
                    {timeLeft}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Due: {new Date(project.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {/* Full-width description */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
              </div>
              
              {/* Status and Priority Tags */}
              <div className="flex items-center space-x-2 mb-6 overflow-x-auto">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
                {/* Show overdue tag only if project is overdue */}
                {(() => {
                  const now = new Date();
                  const dueDate = new Date(project.dueDate);
                  const difference = dueDate.getTime() - now.getTime();
                  if (difference < 0) {
                    return (
                      <span className="px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap bg-red-100 text-red-800 border-red-200">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Overdue
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2">
                  <Flag className="h-5 w-5" />
                  <span className="font-semibold text-sm">Add Milestone</span>
                </button>
                <button className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold text-sm">Add Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Professional Design */}
          <div className="hidden md:block mb-8">
            {/* Project Header */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                      {/* Show overdue tag only if project is overdue */}
                      {(() => {
                        const now = new Date();
                        const dueDate = new Date(project.dueDate);
                        const difference = dueDate.getTime() - now.getTime();
                        if (difference < 0) {
                          return (
                            <span className="px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap bg-red-100 text-red-800 border-red-200">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Overdue
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={`text-lg font-semibold ${getCountdownColor()}`}>
                    {timeLeft}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Due: {new Date(project.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {/* Full-width description */}
              <div className="mb-6">
                <p className="text-lg text-gray-600 leading-relaxed">{project.description}</p>
              </div>

              {/* Action Section */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to add more content?</h3>
                  <p className="text-sm text-gray-600">Add milestones and tasks to keep the project moving forward</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2">
                    <Flag className="h-5 w-5" />
                    <span className="font-semibold">Add Milestone</span>
                  </button>
                  <button className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold">Add Task</span>
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Mobile Tabs - Tiles Layout */}
          <div className="md:hidden mb-6">
            <div className="grid grid-cols-2 gap-3">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`p-4 rounded-2xl shadow-sm border transition-all ${
                      activeTab === tab.key
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 active:scale-95'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <IconComponent className="h-6 w-6" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Tabs - Website Layout */}
          <div className="hidden md:block mb-8">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                      activeTab === tab.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;
