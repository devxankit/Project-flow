import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import PMDashboard from './pages/PM-dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import ActivityPage from './pages/Activity';
import Auth from './pages/Auth';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PMDashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pm-dashboard" element={<PMDashboard />} />
          <Route path="/dashboard" element={<PMDashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/activity" element={<ActivityPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
