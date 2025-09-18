import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeNavbar from '../components/Employee-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import { 
  FolderKanban, 
  Calendar, 
  User, 
  Clock,
  Target,
  Users,
  ArrowLeft,
  CheckSquare,
  TrendingUp,
  FileText,
  MessageSquare,
  BarChart3
} from 'lucide-react';

const EmployeeProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeLeft, setTimeLeft] = useState('');

  // Mock project data - only projects assigned to this employee
  const projectsData = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX and improved user experience. This project focuses on creating a responsive, accessible, and user-friendly interface that aligns with current design trends.',
      status: 'In Progress',
      progress: 65,
      team: 4,
      dueDate: '2025-10-15',
      priority: 'High',
      startDate: '2024-01-01',
      client: 'Acme Corporation',
      totalTasks: 24,
      completedTasks: 16,
      dueSoonTasks: 3,
      overdueTasks: 1,
      myTasks: 6,
      myCompletedTasks: 2,
      teamMembers: [
        { id: 1, name: 'John Doe', role: 'Project Manager', avatar: 'JD', status: 'online' },
        { id: 2, name: 'Jane Smith', role: 'UI/UX Designer', avatar: 'JS', status: 'online' },
        { id: 3, name: 'Mike Johnson', role: 'Frontend Developer', avatar: 'MJ', status: 'away' },
        { id: 4, name: 'Sarah Wilson', role: 'Backend Developer', avatar: 'SW', status: 'offline' }
      ],
      milestones: [
        { id: 1, title: 'Design Phase', status: 'Completed', progress: 100, dueDate: '2024-01-15', myTasks: 2, myCompletedTasks: 2 },
        { id: 2, title: 'Development Phase', status: 'In Progress', progress: 65, dueDate: '2024-02-15', myTasks: 3, myCompletedTasks: 0 },
        { id: 3, title: 'Testing Phase', status: 'Pending', progress: 0, dueDate: '2024-02-20', myTasks: 1, myCompletedTasks: 0 },
        { id: 4, title: 'Launch Phase', status: 'Pending', progress: 0, dueDate: '2024-02-25', myTasks: 0, myCompletedTasks: 0 }
      ]
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'iOS and Android app for customer portal with modern features and intuitive design. The app will provide seamless user experience across all mobile platforms.',
      status: 'Planning',
      progress: 20,
      team: 6,
      dueDate: '2025-01-15',
      priority: 'Medium',
      startDate: '2024-02-01',
      client: 'TechCorp Inc',
      totalTasks: 18,
      completedTasks: 4,
      dueSoonTasks: 2,
      overdueTasks: 0,
      myTasks: 3,
      myCompletedTasks: 0,
      teamMembers: [
        { id: 1, name: 'Alex Brown', role: 'Project Manager', avatar: 'AB', status: 'online' },
        { id: 2, name: 'Emma Davis', role: 'Mobile Developer', avatar: 'ED', status: 'online' },
        { id: 3, name: 'Mike Johnson', role: 'Frontend Developer', avatar: 'MJ', status: 'away' },
        { id: 4, name: 'Lisa Chen', role: 'UI Designer', avatar: 'LC', status: 'online' },
        { id: 5, name: 'David Kim', role: 'Backend Developer', avatar: 'DK', status: 'offline' },
        { id: 6, name: 'Maria Garcia', role: 'QA Tester', avatar: 'MG', status: 'online' }
      ],
      milestones: [
        { id: 1, title: 'Research Phase', status: 'Completed', progress: 100, dueDate: '2024-02-10', myTasks: 1, myCompletedTasks: 0 },
        { id: 2, title: 'Design Phase', status: 'In Progress', progress: 20, dueDate: '2024-03-01', myTasks: 2, myCompletedTasks: 0 },
        { id: 3, title: 'Development Phase', status: 'Pending', progress: 0, dueDate: '2024-04-15', myTasks: 0, myCompletedTasks: 0 },
        { id: 4, title: 'Testing Phase', status: 'Pending', progress: 0, dueDate: '2024-05-01', myTasks: 0, myCompletedTasks: 0 }
      ]
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migrate to new database system for better performance and scalability. This critical project will improve system reliability and data processing speed.',
      status: 'Completed',
      progress: 100,
      team: 3,
      dueDate: '2024-01-20',
      priority: 'High',
      startDate: '2023-12-01',
      client: 'DataFlow Systems',
      totalTasks: 12,
      completedTasks: 12,
      dueSoonTasks: 0,
      overdueTasks: 0,
      myTasks: 2,
      myCompletedTasks: 2,
      teamMembers: [
        { id: 1, name: 'Tom Wilson', role: 'Project Manager', avatar: 'TW', status: 'online' },
        { id: 2, name: 'Mike Johnson', role: 'Database Developer', avatar: 'MJ', status: 'online' },
        { id: 3, name: 'Anna Lee', role: 'System Administrator', avatar: 'AL', status: 'online' }
      ],
      milestones: [
        { id: 1, title: 'Planning Phase', status: 'Completed', progress: 100, dueDate: '2023-12-15', myTasks: 1, myCompletedTasks: 1 },
        { id: 2, title: 'Migration Phase', status: 'Completed', progress: 100, dueDate: '2024-01-10', myTasks: 1, myCompletedTasks: 1 },
        { id: 3, title: 'Testing Phase', status: 'Completed', progress: 100, dueDate: '2024-01-15', myTasks: 0, myCompletedTasks: 0 },
        { id: 4, title: 'Go-Live Phase', status: 'Completed', progress: 100, dueDate: '2024-01-20', myTasks: 0, myCompletedTasks: 0 }
      ]
    }
  ];

  // Find the project based on the ID parameter
  const project = projectsData.find(p => p.id === parseInt(id));
  
  // If project not found, redirect to employee projects page
  useEffect(() => {
    if (!project) {
      navigate('/employee-projects');
    }
  }, [project, navigate]);

  // Scroll to top when component mounts
  useScrollToTop();
  
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

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'milestones', label: 'Milestones', icon: Target },
    { key: 'team', label: 'Team', icon: Users }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="space-y-4">
        {/* Progress Card */}
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

        {/* My Tasks Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{project.myTasks}</div>
                <div className="text-xs text-gray-500">My Tasks</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {project.myCompletedTasks} completed
            </div>
          </div>

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
        </div>
      </div>

      {/* Project Information */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 shadow-sm">
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

        {/* Date Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      {project.milestones.map((milestone) => (
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
            <span>My Tasks: {milestone.myCompletedTasks}/{milestone.myTasks}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTeam = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {project.teamMembers.map((member) => (
        <div key={member.id} className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-200">
              <span className="text-base font-bold text-primary">{member.avatar}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors duration-200">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'milestones': return renderMilestones();
      case 'team': return renderTeam();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <EmployeeNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-4xl md:mx-auto md:px-6 lg:px-8">

          {/* Project Header Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(project.status)}`}>
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900">{project.name}</h1>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm md:text-lg font-semibold ${getCountdownColor()}`}>
                  {timeLeft}
                </div>
                <div className="text-xs md:text-sm text-gray-500 mt-1">
                  Due: {new Date(project.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{project.description}</p>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden mb-6">
            <div className="grid grid-cols-3 gap-3">
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

          {/* Desktop Tabs */}
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

export default EmployeeProjectDetails;
