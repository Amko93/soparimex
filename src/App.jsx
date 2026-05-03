import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SelectionProvider } from './context/SelectionContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ThemeCustomizer from './components/ThemeCustomizer';
import ProtectedRoute from './components/ProtectedRoute';

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
import PendingValidationPage from './pages/PendingValidationPage';
import DashboardPage from './pages/DashboardPage';

// Admin
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminMessagesPage from './pages/AdminMessagesPage';
import AdminDeletedUsersPage from './pages/AdminDeletedUsersPage';
import AdminLeadsPage from './pages/AdminLeadsPage';
import AdminLeadDetailsPage from './pages/admin/AdminLeadDetailsPage';
import AdminLeadsArchivePage from './pages/admin/AdminLeadsArchivePage';
import AdminUserProfilePage from './pages/admin/AdminUserProfilePage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import ConfidentialitePage from './pages/ConfidentialitePage';
import SelectionPage from './pages/SelectionPage';
import SelectionConfirmationPage from './pages/SelectionConfirmationPage';
import ClientRequestsPage from './pages/client/ClientRequestsPage';
import ClientRequestDetailsPage from './pages/client/ClientRequestDetailsPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SelectionProvider>
          <div className="flex flex-col min-h-screen overflow-x-hidden bg-site transition-colors duration-300 font-sans">
            <Header />

            <main className="flex-1 w-full relative overflow-x-hidden">
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
                <Route path="/mentions" element={<MentionsLegalesPage />} />
                <Route path="/confidentialite" element={<ConfidentialitePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/update-password" element={<UpdatePasswordPage />} />
                <Route path="/pending-validation" element={<PendingValidationPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/selection" element={<ProtectedRoute><SelectionPage /></ProtectedRoute>} />
                <Route path="/selection/confirmation" element={<ProtectedRoute><SelectionConfirmationPage /></ProtectedRoute>} />
                <Route path="/mes-demandes" element={<ProtectedRoute allowedRoles={['client', 'admin', 'developpeur', 'commercial']}><ClientRequestsPage /></ProtectedRoute>} />
                <Route path="/mes-demandes/:id" element={<ProtectedRoute allowedRoles={['client', 'admin', 'developpeur', 'commercial']}><ClientRequestDetailsPage /></ProtectedRoute>} />

                {/* Routes Admin (connexion + rôle admin ou developpeur) */}
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute>} />
                <Route path="/admin/users/:id" element={<ProtectedRoute requireAdmin><AdminUserProfilePage /></ProtectedRoute>} />
                <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><AdminCategoriesPage /></ProtectedRoute>} />
                <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={['admin', 'developpeur', 'commercial']}><AdminMessagesPage /></ProtectedRoute>} />
                <Route path="/admin/deleted-users" element={<ProtectedRoute requireAdmin><AdminDeletedUsersPage /></ProtectedRoute>} />
                <Route path="/admin/leads" element={<ProtectedRoute allowedRoles={['admin', 'developpeur', 'commercial']}><AdminLeadsPage /></ProtectedRoute>} />
                <Route path="/admin/leads/archive" element={<ProtectedRoute allowedRoles={['admin', 'developpeur', 'commercial']}><AdminLeadsArchivePage /></ProtectedRoute>} />
                <Route path="/admin/leads/:id" element={<ProtectedRoute allowedRoles={['admin', 'developpeur', 'commercial', 'client']}><AdminLeadDetailsPage /></ProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            <Footer />
            <ThemeCustomizer />
          </div>
        </SelectionProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;