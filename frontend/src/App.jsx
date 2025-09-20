import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import PMDashboard from './pages/PM-dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import ProjectForm from './components/ProjectForm';
import Tasks from './pages/Tasks';
import ActivityPage from './pages/Activity';
import PMProfile from './pages/PM-Profile';
import UserManagement from './pages/UserManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import Auth from './pages/Auth';
// PM Module imports
import PMTaskDetail from './pages/PMTaskDetail';
import PMMilestoneDetail from './pages/PMMilestoneDetail';
// Customer Module imports
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerProjectDetails from './pages/CustomerProjectDetails';
import CustomerActivity from './pages/CustomerActivity';
import CustomerTaskDetail from './pages/CustomerTaskDetail';
import CustomerMilestoneDetail from './pages/CustomerMilestoneDetail';
import CustomerFiles from './pages/CustomerFiles';
import CustomerProfile from './pages/CustomerProfile';
// Employee Module imports
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeTaskDetail from './pages/EmployeeTaskDetail';
import EmployeeProjects from './pages/EmployeeProjects';
import EmployeeProjectDetails from './pages/EmployeeProjectDetails';
import EmployeeMilestoneDetail from './pages/EmployeeMilestoneDetail';
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
              <Route path="/projects" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <Projects />
                </ProtectedRoute>
              } />
              <Route path="/project/:id" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <ProjectDetails />
                </ProtectedRoute>
              } />
              <Route path="/project-details/:id" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <ProjectDetails />
                </ProtectedRoute>
              } />
              <Route path="/projects/edit/:id" element={
                <ProtectedRoute allowedRoles={['pm']}>
                  <ProjectForm />
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
                  <PMMilestoneDetail />
                </ProtectedRoute>
              } />
          
              {/* Customer Module Routes - Protected for Customer role only */}
              <Route path="/customer-dashboard" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/customer-project/:id" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerProjectDetails />
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
                  <CustomerMilestoneDetail />
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
              <Route path="/employee-projects" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeProjects />
                </ProtectedRoute>
              } />
              <Route path="/employee-project/:id" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeProjectDetails />
                </ProtectedRoute>
              } />
              <Route path="/employee/milestone-details/:id" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeMilestoneDetail />
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
