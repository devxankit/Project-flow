import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../components/Customer-Navbar';
import useScrollToTop from '../hooks/useScrollToTop';
import TaskRequestForm from '../components/TaskRequestForm';
import { 
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const CustomerTaskRequestEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [taskRequest, setTaskRequest] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useScrollToTop();

  useEffect(() => {
    const fetchTaskRequest = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/task-requests/customer/${id}`);
        if (response.data.success) {
          const request = response.data.data;
          setTaskRequest(request);
          
          // Fetch tasks for the customer
          if (request.customer) {
            const customerId = typeof request.customer === 'string' ? request.customer : request.customer._id;
            setTasksLoading(true);
            try {
              const tasksResponse = await api.get(`/customers/${customerId}/tasks`);
              if (tasksResponse.data.success) {
                setTasks(tasksResponse.data.data || []);
              } else {
                console.warn('Failed to fetch tasks:', tasksResponse.data.message);
                setTasks([]);
              }
            } catch (error) {
              console.error('Error fetching tasks:', error);
              setTasks([]);
            } finally {
              setTasksLoading(false);
            }
          }
        } else {
          toast.error('Error', 'Task request not found');
          navigate('/customer-task-requests');
        }
      } catch (error) {
        console.error('Error fetching task request:', error);
        toast.error('Error', 'Failed to load task request');
        navigate('/customer-task-requests');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTaskRequest();
    }
  }, [id, navigate, toast]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const response = await api.put(`/task-requests/customer/${id}`, formData);
      if (response.data.success) {
        toast.success('Success', 'Task request updated successfully');
        navigate(`/customer-task-request/${id}`);
      } else {
        toast.error('Error', response.data.message || 'Failed to update task request');
      }
    } catch (error) {
      console.error('Error updating task request:', error);
      toast.error('Error', 'Failed to update task request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate(`/customer-task-request/${id}`);
  };

  if (loading || tasksLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-gray-600">Loading task request...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!taskRequest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Request Not Found</h2>
            <p className="text-gray-600 mb-4">The task request you're trying to edit doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/customer-task-requests')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Back to Task Requests
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (taskRequest.status !== 'Pending') {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Cannot Edit Request</h2>
            <p className="text-gray-600 mb-4">Only pending requests can be edited. This request has already been reviewed.</p>
            <button
              onClick={() => navigate(`/customer-task-request/${id}`)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              View Request Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare initial form data
  const initialFormData = {
    title: taskRequest.title,
    description: taskRequest.description,
    customer: typeof taskRequest.customer === 'string' ? taskRequest.customer : taskRequest.customer?._id,
    task: typeof taskRequest.task === 'string' ? taskRequest.task : taskRequest.task?._id,
    priority: taskRequest.priority,
    dueDate: taskRequest.dueDate ? new Date(taskRequest.dueDate).toISOString().split('T')[0] : '',
    reason: taskRequest.reason
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/customer-task-request/${id}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Request Details
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Edit Task Request</h1>
          <p className="text-gray-600 mt-2">Update your task request details below.</p>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <TaskRequestForm
            isOpen={true}
            onClose={handleClose}
            onSubmit={handleSubmit}
            customerId={initialFormData.customer}
            customerName={typeof taskRequest.customer === 'string' ? taskRequest.customer : taskRequest.customer?.name}
            tasks={tasks}
            initialData={initialFormData}
            isEdit={true}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerTaskRequestEdit;
