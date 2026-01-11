import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ThemeCustomizer from './components/ThemeCustomizer';

// Pages
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
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
      {/* min-h-screen : Force la page à faire au moins la taille de l'écran 
         flex-col : Organise les éléments (Header, Main, Footer) verticalement
      */}
      <div className="flex flex-col min-h-screen bg-site transition-colors duration-300 font-sans">
        <Header />
        
        {/* flex-grow : C'est le secret. Cet élément va grandir pour occuper tout l'espace vide,
           ce qui pousse le Footer tout en bas.
           w-full : Assure que le contenu prend toute la largeur.
        */}
        <main className="flex-grow w-full relative">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            
            {/* C'est cette ligne qui manquait pour éviter la page blanche quand tu cliques sur une catégorie ! 
                Pour l'instant, je redirige vers CategoriesPage, mais on créera la page produits juste après. */}
            <Route path="/category/:id" element={<CategoriesPage />} />

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