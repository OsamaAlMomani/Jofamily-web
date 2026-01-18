import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/admin/context/AdminAuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAdminLoggedIn } = useAdminAuth();

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
