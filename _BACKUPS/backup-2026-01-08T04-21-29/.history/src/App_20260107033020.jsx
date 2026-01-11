import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages Publiques
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import CataloguesPage from './pages/CataloguesPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage'; // <--- L'import qui manquait sûrement

// Pages Admin
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Routes Visiteurs */}
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/catalogues" element={<CataloguesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Route Profil Utilisateur */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Routes Administration */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;