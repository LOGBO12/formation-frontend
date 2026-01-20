import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const PrivateRoute = ({ children, requireCompleteProfile = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur a besoin de l'onboarding et que la route le requiert
  if (requireCompleteProfile && user.needs_onboarding) {
    const step = user.onboarding_step || 'role';
    return <Navigate to={`/onboarding/${step}`} replace />;
  }

  return children;
};

export default PrivateRoute;