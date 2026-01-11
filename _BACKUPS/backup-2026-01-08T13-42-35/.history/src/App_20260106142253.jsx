import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import des composants visuels
import Header from './components/Header';
import Footer from './components/Footer';

// Import des pages
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Le Header est en dehors des routes (toujours visible) */}
      <Header />

      {/* 2. Le contenu principal change selon la page */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<ContactPage />} /> {/* Pour l'instant l'accueil est le contact, on changera après */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Pages futures (pour éviter l'erreur si on clique dessus) */}
          <Route path="/categories" element={<div className="p-10 text-center">Page Catégories (En construction)</div>} />
          <Route path="/catalogues" element={<div className="p-10 text-center">Page Catalogues (En construction)</div>} />

          {/* Sécurité 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 3. Le Footer est en bas (toujours visible) */}
      <Footer />
    </div>
  );
}

export default App;