import { Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '../../entities';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirect = user.role === UserRole.Teacher ? '/teacher' : '/student';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
