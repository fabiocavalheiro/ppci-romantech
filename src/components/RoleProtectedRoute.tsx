import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function RoleProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/dashboard' 
}: RoleProtectedRouteProps) {
  const { profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      navigate('/auth', { replace: true });
      return;
    }

    // Verificar roles se especificado
    if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
      navigate(redirectTo, { replace: true });
      return;
    }

    setChecked(true);
  }, [profile, loading, location.pathname, allowedRoles, navigate, redirectTo]);

  if (loading || !checked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return <>{children}</>;
}