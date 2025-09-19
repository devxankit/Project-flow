import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PMNavbar from '../components/PM-Navbar';
import MilestoneForm from '../components/MilestoneForm';
import TaskForm from '../components/TaskForm';
import useScrollToTop from '../hooks/useScrollToTop';
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
  Flag,
  Loader2,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { projectApi, milestoneApi, taskApi, handleApiError } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '../components/magicui/dialog';
import { Button } from '../components/magicui/button';

const ProjectDetails = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeLeft, setTimeLeft] = useState('');
  const [isMilestoneFormOpen, setIsMilestoneFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    project: false,
    milestones: false,
    tasks: false
  });

  // Load project data on component mount
  useEffect(() => {
    if (id) {
      loadProject();
      loadMilestones();
      loadTasks();
    }
  }, [id]); // Add proper dependencies

  const loadProject = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, project: true }));
      const response = await projectApi.getProjectById(id);
      setProject(response.data);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Error', 'Failed to load project details');
      navigate('/projects');
    } finally {
      setLoadingStates(prev => ({ ...prev, project: false }));
    }
  };

  const loadMilestones = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, milestones: true }));
      const response = await milestoneApi.getMilestonesByProject(id);
      if (response.success) {
        setMilestones(response.data.milestones);
      } else {
        console.error('Error loading milestones:', response.message);
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
      // Don't show error toast for milestones as it's not critical
    } finally {
      setLoadingStates(prev => ({ ...prev, milestones: false }));
    }
  };

  const loadTasks = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, tasks: true }));
      // First get milestones, then get tasks for each milestone
      const milestoneResponse = await milestoneApi.getMilestonesByProject(id);
      if (milestoneResponse.success && milestoneResponse.data.milestones) {
        const allTasks = [];
        for (const milestone of milestoneResponse.data.milestones) {
          const response = await taskApi.getTasksByMilestone(milestone._id, id);
          if (response.success && response.data) {
            allTasks.push(...response.data.tasks);
          }
        }
        setTasks(allTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      handleApiError(error, toast);
    } finally {
      setLoadingStates(prev => ({ ...prev, tasks: false }));
    }
  };

  // Handle milestone form submission
  const handleMilestoneSubmit = (milestoneData) => {
    // Refresh project data and milestones after creating a new milestone
    loadProject();
    loadMilestones();
    setIsMilestoneFormOpen(false);
  };

  // Handle task form submission
  const handleTaskSubmit = (taskData) => {
    // Refresh project data and tasks after creating a new task
    loadProject();
    loadTasks();
    setIsTaskFormOpen(false);
  };

  // Handle project deletion confirmation
  const handleDeleteProject = () => {
    if (!project?._id) return;
    setShowDeleteDialog(true);
  };

  // Confirm project deletion
  const confirmDeleteProject = async () => {
    if (!project?._id) return;

    try {
      setIsDeleting(true);
      await projectApi.deleteProject(project._id);
      toast.success('Success', 'Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error', 'Failed to delete project');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Cancel project deletion
  const cancelDeleteProject = () => {
    setShowDeleteDialog(false);
  };

  // Handle project edit navigation
  const handleEditProject = () => {
    navigate(`/projects/edit/${project._id}`);
  };


  // Scroll to top when component mounts
  useScrollToTop();

  // Countdown logic - moved before conditional returns to follow Rules of Hooks
  useEffect(() => {
    if (!project?.dueDate) {
      setTimeLeft('No due date');
      return;
    }

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
  }, [project?.dueDate]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <PMNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading project details...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Return early if project not found
  if (!project) {
    return null;
  }

  // Get team from project data (tasks and milestones are loaded separately)
  const team = project?.assignedTeam || [];


  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'milestones', label: 'Milestones', icon: Target },
    { key: 'tasks', label: 'Tasks', icon: CheckSquare },
    { key: 'team', label: 'Team', icon: Users }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-primary/10 text-primary border-primary/20';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  const formatStatus = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'active': return 'Active';
      case 'planning': return 'Planning';
      case 'on-hold': return 'On Hold';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPriority = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'High';
      case 'normal': return 'Normal';
      case 'low': return 'Low';
      default: return priority;
    }
  };

  const getDueDateColor = () => {
    if (!project?.dueDate) {
      return 'bg-gray-100 text-gray-800 border-gray-200'; // No date
    }
    
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
    if (!project?.dueDate) {
      return 'text-gray-600'; // No date
    }
    
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
              <div className="text-3xl font-bold text-primary">{project.progress || 0}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
              style={{ width: `${project.progress || 0}%` }}
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
              {tasks.filter(t => t.status === 'completed').length} completed
            </div>
          </div>

          {/* Team Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{team.length}</div>
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
                {project.customer?.name ? 
                  project.customer.name.split(' ').map(word => word[0]).join('').substring(0, 2) :
                  'C'
                }
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-primary/80 uppercase tracking-wide mb-1">Client</p>
            <p className="text-lg font-bold text-gray-900">{project.customer?.name || 'No client assigned'}</p>
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
                  {project.startDate ? 
                    new Date(project.startDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'Not set'
                  }
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
                  {project.dueDate ? 
                    new Date(project.dueDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'Not set'
                  }
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
      {milestones.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones yet</h3>
          <p className="text-gray-600 mb-4">Create your first milestone to track project progress</p>
          <button 
            onClick={() => setIsMilestoneFormOpen(true)}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full text-sm font-medium"
          >
            Add Milestone
          </button>
        </div>
      ) : (
        milestones.map((milestone) => (
          <div 
            key={milestone._id} 
            onClick={() => navigate(`/pm-milestone/${milestone._id}?projectId=${id}`)}
            className="group bg-white rounded-2xl md:rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            {/* Header Section */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors duration-300">
                      {milestone.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                      {formatStatus(milestone.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(milestone.priority)}`}>
                      {formatPriority(milestone.priority)}
                    </span>
                    <span className="text-xs text-gray-500">Seq: {milestone.sequence || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {milestone.description || 'No description available'}
            </p>

            {/* Progress Section */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900 font-medium">{milestone.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-300"
                  style={{ width: `${milestone.progress || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Due: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'No date'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{milestone.assignedTo?.length || 0} assigned</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-600 mb-4">Create your first task to get started</p>
          <button 
            onClick={() => setIsTaskFormOpen(true)}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full text-sm font-medium"
          >
            Add Task
          </button>
        </div>
      ) : (
        tasks.map((task) => (
          <div 
            key={task._id} 
            onClick={() => navigate(`/pm-task/${task._id}?projectId=${id}`)}
            className="group bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                task.status === 'completed' 
                  ? 'bg-primary border-primary' 
                  : 'border-gray-300 group-hover:border-primary'
              }`}>
                {task.status === 'completed' && (
                  <CheckSquare className="h-3 w-3 text-white" />
                )}
              </div>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-base font-semibold transition-colors duration-200 ${
                    task.status === 'completed' 
                      ? 'text-gray-500 line-through' 
                      : 'text-gray-900 group-hover:text-primary'
                  }`}>
                    {task.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : task.status === 'active'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formatStatus(task.status)}
                  </span>
                </div>
                
                {/* Task Meta */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{task.assignedTo?.length > 0 ? task.assignedTo[0].fullName || task.assignedTo[0].name : 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'No date'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTeam = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {team.length === 0 ? (
        <div className="col-span-2 text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members assigned</h3>
          <p className="text-gray-600">Team members will appear here when assigned to the project</p>
        </div>
      ) : (
        team.map((member) => (
          <div key={member._id} className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-200">
                <span className="text-base font-bold text-primary">
                  {member.fullName ? member.fullName.split(' ').map(word => word[0]).join('').substring(0, 2) : 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors duration-200">{member.fullName}</h3>
                <p className="text-sm text-gray-600">{member.jobTitle || member.workTitle || 'Team Member'}</p>
              </div>
            </div>
          </div>
        ))
      )}
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
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl">
                      <FolderKanban className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight line-clamp-2">{project.name}</h1>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={`text-sm font-semibold ${getCountdownColor()}`}>
                    {timeLeft}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No date'}
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
                  {formatStatus(project.status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(project.priority)}`}>
                  {formatPriority(project.priority)}
                </span>
                {/* Show overdue tag only if project is overdue */}
                {(() => {
                  if (!project.dueDate) return null;
                  
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
              <div className="space-y-3">
                {/* Primary Actions */}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setIsMilestoneFormOpen(true)}
                    className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                  >
                    <Flag className="h-5 w-5" />
                    <span className="font-semibold text-sm">Add Milestone</span>
                  </button>
                  <button 
                    onClick={() => setIsTaskFormOpen(true)}
                    className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold text-sm">Add Task</span>
                  </button>
                </div>
                
                {/* Secondary Actions */}
                <div className="flex space-x-3">
                  <button 
                    onClick={handleEditProject}
                    className="flex-1 bg-white border-2 border-primary text-primary py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="font-semibold text-sm">Edit Project</span>
                  </button>
                  <button 
                    onClick={handleDeleteProject}
                    disabled={isDeleting}
                    className="flex-1 bg-white border-2 border-red-500 text-red-500 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="font-semibold text-sm">{isDeleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
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
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl">
                      <FolderKanban className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 line-clamp-2">{project.name}</h1>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(project.status)}`}>
                        {formatStatus(project.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(project.priority)}`}>
                        {formatPriority(project.priority)}
                      </span>
                      {/* Show overdue tag only if project is overdue */}
                      {(() => {
                        if (!project.dueDate) return null;
                        
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
                    Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No date'}
                  </div>
                </div>
              </div>
              
              {/* Full-width description */}
              <div className="mb-6">
                <p className="text-lg text-gray-600 leading-relaxed">{project.description}</p>
              </div>

              {/* Action Section */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to add more content?</h3>
                    <p className="text-sm text-gray-600">Add milestones and tasks to keep the project moving forward</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setIsMilestoneFormOpen(true)}
                      className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                    >
                      <Flag className="h-5 w-5" />
                      <span className="font-semibold">Add Milestone</span>
                    </button>
                    <button 
                      onClick={() => setIsTaskFormOpen(true)}
                      className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-semibold">Add Task</span>
                    </button>
                  </div>
                </div>
                
                {/* Project Management Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Project Management</h4>
                    <p className="text-xs text-gray-600">Edit project details or remove the project</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleEditProject}
                      className="bg-white border-2 border-primary text-primary px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="font-semibold text-sm">Edit Project</span>
                    </button>
                    <button 
                      onClick={handleDeleteProject}
                      disabled={isDeleting}
                      className="bg-white border-2 border-red-500 text-red-500 px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="font-semibold text-sm">{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
                    </button>
                  </div>
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

      {/* Milestone Form */}
      <MilestoneForm
        isOpen={isMilestoneFormOpen}
        onClose={() => setIsMilestoneFormOpen(false)}
        onSubmit={handleMilestoneSubmit}
        projectId={project?._id}
      />

      {/* Task Form */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleTaskSubmit}
        projectId={project?._id}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md" onClose={cancelDeleteProject}>
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Delete Project
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete the project{' '}
              <span className="font-semibold text-gray-900">"{project?.name}"</span>?
              This will permanently remove the project and all its associated data including milestones, tasks, and files.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={cancelDeleteProject}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteProject}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetails;
