import { useEffect } from 'react';
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
  const { profile, loading, canAccessRoute, checkEmpresaStatus } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      console.log('RoleProtectedRoute: No profile, redirecting to /auth');
      navigate('/auth');
      return;
    }

    console.log('RoleProtectedRoute: Profile found:', profile.role, 'for route:', location.pathname);

    // Se roles específicos foram definidos, verificar se o usuário tem um deles
    if (allowedRoles.length > 0) {
      const hasRequiredRole = allowedRoles.includes(profile.role);
      if (!hasRequiredRole) {
        console.warn(`Acesso negado: usuário ${profile.role} tentou acessar ${location.pathname}`);
        navigate(redirectTo);
        return;
      }
    }

    // Verificar se o usuário pode acessar a rota usando a função geral
    if (!canAccessRoute(location.pathname)) {
      console.warn(`Acesso negado: rota ${location.pathname} não permitida para ${profile.role}`);
      navigate(redirectTo);
      return;
    }

    console.log('RoleProtectedRoute: Access granted for', profile.role, 'to', location.pathname);

    // Verificar se a empresa está ativa (apenas para clientes)
    if (profile.role === 'cliente' && profile.empresa_id) {
      checkEmpresaStatus().then(isActive => {
        if (!isActive) {
          console.warn(`Acesso negado: empresa inativa para usuário ${profile.email}`);
          navigate('/auth');
        }
      });
    }
  }, [profile, loading, location.pathname, allowedRoles, canAccessRoute, checkEmpresaStatus, navigate, redirectTo]);

  if (loading) {
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