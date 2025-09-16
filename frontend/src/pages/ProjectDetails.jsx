import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock project data
  const project = {
    id: parseInt(id),
    name: 'Website Redesign',
    description: 'Complete redesign of company website with modern UI/UX and improved user experience',
    status: 'In Progress',
    progress: 65,
    team: 4,
    dueDate: '2024-02-15',
    priority: 'High',
    startDate: '2024-01-01',
    budget: '$50,000',
    client: 'Acme Corporation'
  };

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


  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-xs text-gray-500">Progress</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{project.progress}%</p>
        </div>
        <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CheckSquare className="h-5 w-5 text-green-600" />
            <span className="text-xs text-gray-500">Tasks</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
        </div>
        <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-xs text-gray-500">Team</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{project.team}</p>
        </div>
        <div className="bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-gray-500">Days Left</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">7</p>
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Project Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Client</label>
            <p className="text-base text-gray-900 mt-1">{project.client}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Budget</label>
            <p className="text-base text-gray-900 mt-1">{project.budget}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Start Date</label>
            <p className="text-base text-gray-900 mt-1">{new Date(project.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Due Date</label>
            <p className="text-base text-gray-900 mt-1">{new Date(project.dueDate).toLocaleDateString()}</p>
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
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">{project.description}</p>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Settings</span>
                </button>
                <button className="p-3 md:px-4 md:py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full md:rounded-lg shadow-sm active:scale-95 md:hover:shadow-md transition-all flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span className="hidden md:block text-sm font-medium">Add Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl md:rounded-lg p-5 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-8">
            <div className="flex justify-between text-sm md:text-base mb-3">
              <span className="text-gray-600">Overall Progress</span>
              <span className="text-gray-900 font-medium">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 md:h-4">
              <div 
                className="bg-gradient-to-r from-primary to-primary-dark h-3 md:h-4 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              ></div>
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
