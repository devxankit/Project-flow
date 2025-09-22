import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import PMDashboard from './pages/PM-dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import CustomerForm from './components/CustomerForm';
import Tasks from './pages/Tasks';
import ActivityPage from './pages/Activity';
import PMProfile from './pages/PM-Profile';
import UserManagement from './pages/UserManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import Auth from './pages/Auth';
// PM Module imports
import PMTaskDetail from './pages/PMTaskDetail';
// Note: PMMilestoneDetail removed - replaced with PMTaskDetail
// Customer Module imports
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerActivity from './pages/CustomerActivity';
import CustomerTaskDetail from './pages/CustomerTaskDetail';
// Note: CustomerMilestoneDetail removed - replaced with CustomerTaskDetail
import CustomerFiles from './pages/CustomerFiles';
import CustomerProfile from './pages/CustomerProfile';
import CustomerTaskRequests from './pages/CustomerTaskRequests';
import CustomerTaskRequestDetail from './pages/CustomerTaskRequestDetail';
import CustomerTaskRequestEdit from './pages/CustomerTaskRequestEdit';
// Employee Module imports
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeTaskDetail from './pages/EmployeeTaskDetail';
import EmployeeCustomers from './pages/EmployeeCustomers';
import EmployeeCustomerDetails from './pages/EmployeeCustomerDetails';
// Note: EmployeeMilestoneDetail removed - replaced with EmployeeTaskDetail
import EmployeeActivity from './pages/EmployeeActivity';
import EmployeeProfile from './pages/EmployeeProfile';
import EmployeeFiles from './pages/EmployeeFiles';
import TaskRequests from './pages/TaskRequests';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="App">
            <Routes>
              {/* Public Route - Auth Page */}
              <Route path="/" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />
              <Route path="/auth" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />
              {/* PM Module Routes - Protected for PM role only */}
              <Route path="/pm-dashboard" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <PMDashboard />
                </ProtectedRoute>
              } />
              <Route path="/customers" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <Customers />
                </ProtectedRoute>
              } />
              <Route path="/customer/:id" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <CustomerDetails />
                </ProtectedRoute>
              } />
              <Route path="/customer-details/:id" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <CustomerDetails />
                </ProtectedRoute>
              } />
              <Route path="/customers/edit/:id" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <CustomerForm />
                </ProtectedRoute>
              } />
              <Route path="/tasks" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <Tasks />
                </ProtectedRoute>
              } />
              <Route path="/task-requests" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <TaskRequests />
                </ProtectedRoute>
              } />
              <Route path="/activity" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <ActivityPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <PMProfile />
                </ProtectedRoute>
              } />
              <Route path="/user-management" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/employee-management" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <EmployeeManagement />
                </ProtectedRoute>
              } />
          
              <Route path="/pm-task/:id" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <PMTaskDetail />
                </ProtectedRoute>
              } />
              <Route path="/pm-milestone/:id" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <PMTaskDetail />
                </ProtectedRoute>
              } />
          
              {/* Customer Module Routes - Protected for Customer role only */}
              <Route path="/customer-dashboard" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/customer-details/:id" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDetails />
                </ProtectedRoute>
              } />
              <Route path="/customer-activity" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerActivity />
                </ProtectedRoute>
              } />
              <Route path="/customer-task/:id" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerTaskDetail />
                </ProtectedRoute>
              } />
              <Route path="/customer-milestone/:id" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerTaskDetail />
                </ProtectedRoute>
              } />
              <Route path="/customer-files" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerFiles />
                </ProtectedRoute>
              } />
              <Route path="/customer-profile" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerProfile />
                </ProtectedRoute>
              } />
              <Route path="/customer-task-requests" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerTaskRequests />
                </ProtectedRoute>
              } />
              <Route path="/customer-task-request/:id" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerTaskRequestDetail />
                </ProtectedRoute>
              } />
              <Route path="/customer-task-request/:id/edit" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerTaskRequestEdit />
                </ProtectedRoute>
              } />
          
              {/* Employee Module Routes - Protected for Employee role only */}
              <Route path="/employee-dashboard" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              } />
              <Route path="/employee-task/:id" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeTaskDetail />
                </ProtectedRoute>
              } />
              <Route path="/employee-customers" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeCustomers />
                </ProtectedRoute>
              } />
              <Route path="/employee-customer-details/:id" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeCustomerDetails />
                </ProtectedRoute>
              } />
              <Route path="/employee/milestone-details/:id" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeTaskDetail />
                </ProtectedRoute>
              } />
              <Route path="/employee-activity" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeActivity />
                </ProtectedRoute>
              } />
              <Route path="/employee-files" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeFiles />
                </ProtectedRoute>
              } />
              <Route path="/employee-profile" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeProfile />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
