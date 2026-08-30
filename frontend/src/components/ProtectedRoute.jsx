import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards a route: requires a logged-in user, and optionally a specific role.
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  }

  return children;
};

export default ProtectedRoute;
