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
      navigate('/auth');
      return;
    }

    // Verificar se o usuário tem permissão para acessar a rota atual
    const currentRoute = location.pathname;
    
    // Se roles específicos foram definidos, verificar se o usuário tem um deles
    if (allowedRoles.length > 0) {
      const hasRequiredRole = allowedRoles.includes(profile.role);
      if (!hasRequiredRole) {
        console.warn(`Acesso negado: usuário ${profile.role} tentou acessar ${currentRoute}`);
        navigate(redirectTo);
        return;
      }
    }

    // Verificar se o usuário pode acessar a rota usando a função geral
    if (!canAccessRoute(currentRoute)) {
      console.warn(`Acesso negado: rota ${currentRoute} não permitida para ${profile.role}`);
      navigate(redirectTo);
      return;
    }

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