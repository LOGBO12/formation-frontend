import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Onboarding Pages
import SelectRole from './pages/onboarding/SelectRole';
import CompleteProfile from './pages/onboarding/CompleteProfile';
import PrivacyPolicy from './pages/onboarding/PrivacyPolicy';

// Dashboard Pages
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import FormateurDashboard from './pages/dashboard/FormateurDashboard';
import ApprenantDashboard from './pages/dashboard/ApprenantDashboard';

// Formateur Pages
import CreateFormation from './pages/formateur/CreateFormation';
import ManageFormation from './pages/formateur/ManageFormation';
import ManageModule from './pages/formateur/ManageModule';
import EditChapitre from './pages/formateur/EditChapitre';
import ManageQuiz from './pages/formateur/ManageQuiz';
// Communauté Pages
import CommunauteView from './pages/communaute/CommunauteView';
import CommunauteModeration from './pages/communaute/CommunauteModeration';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Onboarding Routes (authentifié mais pas de vérification du profil) */}
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

          {/* Dashboard Routes (profil complété requis) */}
          <Route
            path="/dashboard/admin"
            element={
              <PrivateRoute>
                <SuperAdminDashboard />
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

          {/* Formateur Routes */}
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
         
          {/* Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;