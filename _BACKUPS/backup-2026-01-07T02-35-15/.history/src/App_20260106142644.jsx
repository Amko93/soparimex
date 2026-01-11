import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import des composants visuels
import Header from './components/Header';
import Footer from './components/Footer';

// Import des pages
import HomePage from './pages/HomePage';      // <-- Ajouté
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <Routes>
          {/* C'est ici que ça change : Accueil = HomePage */}
          <Route path="/" element={<HomePage />} />
          
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Pages en construction */}
          <Route path="/categories" element={<div className="p-20 text-center text-2xl">Page Catégories (À faire bientôt)</div>} />
          <Route path="/catalogues" element={<div className="p-20 text-center text-2xl">Page Catalogues (À faire bientôt)</div>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;