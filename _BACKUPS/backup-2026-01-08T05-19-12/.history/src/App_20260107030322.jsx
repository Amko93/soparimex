import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages publiques
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import CataloguesPage from './pages/CataloguesPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Pages Admin
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminUsersPage from './pages/AdminUsersPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Routes Publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/catalogues" element={<CataloguesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routes Administration */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;