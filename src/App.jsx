import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicNavbar from './components/PublicNavbar';
import Navbar from './components/Navbar'; 
import ImprovedFooter from './components/ImprovedFooter';

// Public Pages
import HomePage from './pages/public/HomePage';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import FormationDetailPage from "./pages/apprenant/FormationDetailPage";

// Onboarding Pages
import SelectRole from './pages/onboarding/SelectRole';
import CompleteProfile from './pages/onboarding/CompleteProfile';
import PrivacyPolicy from './pages/onboarding/PrivacyPolicy';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import FormateurDashboard from './pages/dashboard/FormateurDashboard';
import ApprenantDashboard from './pages/dashboard/ApprenantDashboard';

// Admin Pages
import DomainesManagement from './pages/admin/DomainesManagement';
import UsersManagement from './pages/admin/UsersManagement';
import FormationsManagement from './pages/admin/FormationsManagement';

// Formateur Pages
import FormationsPage from './pages/formateur/FormationsPage';
import ApprenantsPage from './pages/formateur/ApprenantsPage';
import StatistiquesPage from './pages/formateur/StatistiquesPage';
import CreateFormation from './pages/formateur/CreateFormation';
import ManageFormation from './pages/formateur/ManageFormation';
import ManageModule from './pages/formateur/ManageModule';
import EditChapitre from './pages/formateur/EditChapitre';
import ManageQuiz from './pages/formateur/ManageQuiz';
import FormateurCommunautesPage from './pages/formateur/FormateurCommunautesPage';

// Apprenant Pages
import MesFormations from './pages/apprenant/MesFormations';
import FormationViewer from './pages/apprenant/FormationViewer';
import QuizViewer from './pages/apprenant/QuizViewer';
import CataloguePage from './pages/apprenant/CataloguePage';
import ProgressionPage from './pages/apprenant/ProgressionPage';
import CommunautesPage from './pages/apprenant/CommunautesPage';

// Communauté Pages
import CommunauteView from './pages/communaute/CommunauteView';
import CommunauteModeration from './pages/communaute/CommunauteModeration';

// Payment Pages
import PaymentCallbackPage from './pages/apprenant/PaymentCallbackPage';
import MesPaiementsPage from './pages/apprenant/Mespaiementspage';
import RevenusPage from './pages/formateur/RevenusPage';

// 🆕 Profile & Settings Pages
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';

import 'bootstrap/dist/css/bootstrap.min.css';

// Layout wrapper
function Layout({ children }) {
  const { user } = useAuth();
  
  return (
    <div className="d-flex flex-column min-vh-100">
      {user ? <Navbar /> : <PublicNavbar />}
      <main className="flex-grow-1">{children}</main>
      <ImprovedFooter />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/formations/:lienPublic" element={<FormationDetailPage />} />

            {/* Onboarding Routes */}
            <Route
              path="/onboarding/role"
              element={
                <PrivateRoute requireCompleteProfile={false}>
                  <SelectRole />
                </PrivateRoute>
              }
            />
            <Route
              path="/onboarding/profile"
              element={
                <PrivateRoute requireCompleteProfile={false}>
                  <CompleteProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/onboarding/privacy_policy"
              element={
                <PrivateRoute requireCompleteProfile={false}>
                  <PrivacyPolicy />
                </PrivateRoute>
              }
            />

            {/* 🆕 Profile & Settings Routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/formateur"
              element={
                <PrivateRoute>
                  <FormateurDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/apprenant"
              element={
                <PrivateRoute>
                  <ApprenantDashboard />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/domaines"
              element={
                <PrivateRoute>
                  <DomainesManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/utilisateurs"
              element={
                <PrivateRoute>
                  <UsersManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/formations"
              element={
                <PrivateRoute>
                  <FormationsManagement />
                </PrivateRoute>
              }
            />

            {/* Formateur Routes - Pages principales */}
            <Route
              path="/formateur/formations"
              element={
                <PrivateRoute>
                  <FormationsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/formateur/apprenants"
              element={
                <PrivateRoute>
                  <ApprenantsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/formateur/statistiques"
              element={
                <PrivateRoute>
                  <StatistiquesPage />
                </PrivateRoute>
              }
            />

            {/* Payment Routes */}
            <Route path="/payment/callback" element={<PrivateRoute><PaymentCallbackPage /></PrivateRoute>} />
            <Route path="/apprenant/paiements" element={<PrivateRoute><MesPaiementsPage /></PrivateRoute>} />
            <Route path="/formateur/revenus" element={<PrivateRoute><RevenusPage /></PrivateRoute>} />

            {/* Formateur Routes - Gestion formations */}
            <Route
              path="/formateur/formations/create"
              element={
                <PrivateRoute>
                  <CreateFormation />
                </PrivateRoute>
              }
            />
            <Route
              path="/formateur/formations/:id"
              element={
                <PrivateRoute>
                  <ManageFormation />
                </PrivateRoute>
              }
            />
            <Route
              path="/formateur/modules/:id"
              element={
                <PrivateRoute>
                  <ManageModule />
                </PrivateRoute>
              }
            />
            <Route
              path="/formateur/quiz/:id"
              element={
                <PrivateRoute>
                  <ManageQuiz />
                </PrivateRoute>
              }
            />
            <Route
              path="/formateur/chapitres/:id/edit"
              element={
                <PrivateRoute>
                  <EditChapitre />
                </PrivateRoute>
              }
            />

            <Route
              path="/formateur/communautes"
              element={
                <PrivateRoute>
                  <FormateurCommunautesPage />
                </PrivateRoute>
              }
            />

            {/* Apprenant Routes */}
            <Route
              path="/apprenant/mes-formations"
              element={
                <PrivateRoute>
                  <MesFormations />
                </PrivateRoute>
              }
            />
            <Route
              path="/apprenant/formations/:id"
              element={
                <PrivateRoute>
                  <FormationViewer />
                </PrivateRoute>
              }
            />
            <Route
              path="/apprenant/quiz/:id"
              element={
                <PrivateRoute>
                  <QuizViewer />
                </PrivateRoute>
              }
            />
            <Route
              path="/apprenant/catalogue"
              element={
                <PrivateRoute>
                  <CataloguePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/apprenant/progression"
              element={
                <PrivateRoute>
                  <ProgressionPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/apprenant/communautes"
              element={
                <PrivateRoute>
                  <CommunautesPage />
                </PrivateRoute>
              }
            />

            {/* Communauté Routes */}
            <Route
              path="/communaute/:id"
              element={
                <PrivateRoute>
                  <CommunauteView />
                </PrivateRoute>
              }
            />
            <Route
              path="/formateur/communaute/:id/moderation"
              element={
                <PrivateRoute>
                  <CommunauteModeration />
                </PrivateRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;