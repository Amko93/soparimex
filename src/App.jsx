import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ThemeCustomizer from './components/ThemeCustomizer';

// Pages
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailsPage from './pages/CategoryDetailsPage';
import SubCategoryProductsPage from './pages/SubCategoryProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import CataloguesPage from './pages/CataloguesPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

// Admin
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminMessagesPage from './pages/AdminMessagesPage'; // NOUVEL IMPORT

function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-site transition-colors duration-300 font-sans">
        <Header />
        
        <main className="flex-grow w-full relative">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Navigation Catalogue */}
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:id" element={<CategoryDetailsPage />} />
            <Route path="/subcategory/:id" element={<SubCategoryProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />

            {/* Recherche */}
            <Route path="/search" element={<SearchResultsPage />} />

            {/* Autres pages */}
            <Route path="/catalogues" element={<CataloguesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Routes Admin */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/messages" element={<AdminMessagesPage />} /> {/* NOUVELLE ROUTE */}
          </Routes>
        </main>

        <Footer />
        <ThemeCustomizer />
      </div>
    </ThemeProvider>
  );
}

export default App;