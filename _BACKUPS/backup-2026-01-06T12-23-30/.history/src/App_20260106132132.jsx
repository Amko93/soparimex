import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ContactPage />} />
    </Routes>
  );
}

export default App;