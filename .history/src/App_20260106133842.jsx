import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; // Import nouveau

function App() {
  return (
    <Routes>
      <Route path="/" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} /> {/* Route nouvelle */}
      
      {/* Sécurité 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;