import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Composants
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';       // Espace Client
import AdminDashboardPage from './pages/AdminDashboardPage'; // <-- NOUVEAU (Super Admin)
import AdminCategoriesPage from './pages/AdminCategoriesPage'; // Outil Admin Catégories

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Espace Client (Compte) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Espace Super Admin */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          
          {/* Sous-pages Admin */}
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          
          {/* Pages publiques */}
          <Route path="/categories" element={<div className="p-20 text-center text-2xl">Page Catégories (À faire étape suivante)</div>} />
          <Route path="/catalogues" element={<div className="p-20 text-center text-2xl">Page Catalogues (En construction)</div>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;