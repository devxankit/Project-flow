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
import { customerApi } from '../utils/api';

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
        const response = await customerApi.getTaskRequestDetails(id);
        if (response.success) {
          const request = response.data;
          setTaskRequest(request);
          
          // Fetch tasks for the customer
          if (request.customer) {
            const customerId = typeof request.customer === 'string' ? request.customer : request.customer._id;
            setTasksLoading(true);
            try {
              const tasksResponse = await customerApi.getCustomerTasks(customerId);
              if (tasksResponse.success) {
                setTasks(tasksResponse.data || []);
              } else {
                console.warn('Failed to fetch tasks:', tasksResponse.message);
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
      const response = await customerApi.updateTaskRequest(id, formData);
      if (response.success) {
        toast.success('Success', 'Task request updated successfully');
        navigate(`/customer-task-request/${id}`);
      } else {
        toast.error('Error', response.message || 'Failed to update task request');
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading task request...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!taskRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
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
        </main>
      </div>
    );
  }

  if (taskRequest.status !== 'Pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
        <CustomerNavbar />
        <main className="pt-4 pb-24 md:pt-8 md:pb-8">
          <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
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
        </main>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:bg-gray-50">
      <CustomerNavbar />
      
      <main className="pt-4 pb-24 md:pt-8 md:pb-8">
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/customer-task-request/${id}`)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Request Details
            </button>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Task Request</h1>
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
      </main>
    </div>
  );
};

export default CustomerTaskRequestEdit;