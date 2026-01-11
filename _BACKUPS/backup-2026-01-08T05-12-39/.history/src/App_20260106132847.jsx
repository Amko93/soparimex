import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;