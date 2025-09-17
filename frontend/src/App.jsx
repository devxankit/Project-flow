import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import PMDashboard from './pages/PM-dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import ActivityPage from './pages/Activity';
import ProfilePage from './pages/Profile';
import UserManagement from './pages/UserManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import Auth from './pages/Auth';
// Customer Module imports
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerProjectDetails from './pages/CustomerProjectDetails';
import CustomerActivity from './pages/CustomerActivity';
import CustomerTaskDetail from './pages/CustomerTaskDetail';
import CustomerFiles from './pages/CustomerFiles';
import CustomerProfile from './pages/CustomerProfile';
// Employee Module imports
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeTaskDetail from './pages/EmployeeTaskDetail';
import EmployeeProjects from './pages/EmployeeProjects';
import EmployeeProfile from './pages/EmployeeProfile';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PMDashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pm-dashboard" element={<PMDashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/employee-management" element={<EmployeeManagement />} />
          
          {/* Customer Module Routes */}
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/customer-project/:id" element={<CustomerProjectDetails />} />
          <Route path="/customer-activity" element={<CustomerActivity />} />
          <Route path="/customer-task/:id" element={<CustomerTaskDetail />} />
          <Route path="/customer-files" element={<CustomerFiles />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          
          {/* Employee Module Routes */}
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee-task/:id" element={<EmployeeTaskDetail />} />
          <Route path="/employee-projects" element={<EmployeeProjects />} />
          <Route path="/employee-profile" element={<EmployeeProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
