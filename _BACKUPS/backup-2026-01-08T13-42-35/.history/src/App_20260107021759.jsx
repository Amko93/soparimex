import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Composants
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminUsersPage from './pages/AdminUsersPage'; // Nouvelle page de validation
import CategoriesPage from './pages/CategoriesPage';
import SubCategoriesPage from './pages/SubCategoriesPage';
import ProductsPage from './pages/ProductsPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Routes Publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryId" element={<SubCategoriesPage />} />
          <Route path="/products/:subcategoryId" element={<ProductsPage />} />
          <Route path="/catalogues" element={<div className="p-20 text-center font-bold text-slate-400 text-2xl">Page Catalogues en cours de création</div>} />

          {/* Routes Utilisateur Connecté */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Routes Administration */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />

          {/* Redirection automatique si la page n'existe pas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;