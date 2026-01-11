import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ThemeCustomizer from './components/ThemeCustomizer';

// Pages
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailsPage from './pages/CategoryDetailsPage'; // Page des Sous-Catégories
import SubCategoryProductsPage from './pages/SubCategoryProductsPage'; // Page des Produits (Étape suivante)
import CataloguesPage from './pages/CataloguesPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

// Admin
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';

function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-site transition-colors duration-300 font-sans">
        <Header />
        
        <main className="flex-grow w-full relative">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Niveau 1 : Liste des Catégories */}
            <Route path="/categories" element={<CategoriesPage />} />
            
            {/* Niveau 2 : Liste des Sous-Catégories (Quand on clique sur une catégorie) */}
            <Route path="/category/:id" element={<CategoryDetailsPage />} />

            {/* Niveau 3 : Liste des Produits (Quand on clique sur une sous-catégorie) */}
            {/* On créera cette page à l'étape d'après */}
            <Route path="/subcategory/:id" element={<SubCategoryProductsPage />} />

            <Route path="/catalogues" element={<CataloguesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Routes Admin */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          </Routes>
        </main>

        <Footer />
        <ThemeCustomizer />
      </div>
    </ThemeProvider>
  );
}

export default App;