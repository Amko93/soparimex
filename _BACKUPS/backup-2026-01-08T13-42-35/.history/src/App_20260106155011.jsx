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
import CategoriesPage from './pages/CategoriesPage';
import SubCategoriesPage from './pages/SubCategoriesPage';
import ProductsPage from './pages/ProductsPage'; // <-- NOUVEAU

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryId" element={<SubCategoriesPage />} />
          
          {/* Nouvelle route pour les produits */}
          <Route path="/products/:subcategoryId" element={<ProductsPage />} />

          <Route path="/catalogues" element={<div className="p-20 text-center">Page Catalogues</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;