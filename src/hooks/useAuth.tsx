import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  client_id?: string;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isCliente: () => boolean;
  canAccessRoute: (route: string) => boolean;
  canManageUsers: () => boolean;
  canSeeAllClients: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            console.log('Fetching profile for user:', session.user.id);
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            if (error) {
              console.error('Error fetching profile:', error);
            } else {
              console.log('Profile fetched:', profile);
            }
            
            setProfile(profile as Profile);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('SignIn error:', error.message);
    } else {
      console.log('SignIn successful:', data.user?.email);
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });
    
    // Se o cadastro foi bem-sucedido e o usuário foi criado, criar o perfil manualmente
    if (!error && data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: fullName,
            email: email,
            role: 'cliente'
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }
    
    if (error) {
      console.error('SignUp error:', error.message);
    } else if (data.user && !data.user.email_confirmed_at) {
      console.log('Email confirmation required for:', email);
    }
    
    return { error, data };
  };

  const signOut = async () => {
    try {
      console.log('Iniciando logout...');
      
      // Limpar estados locais primeiro
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
        throw error;
      }
      
      console.log('Logout realizado com sucesso');
      
      // Redirecionar para página de auth
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Erro durante o logout:', error);
      
      // Mesmo com erro, limpar estados e redirecionar
      setUser(null);
      setProfile(null);
      setSession(null);
      navigate('/auth', { replace: true });
    }
  };

  const hasRole = (roles: string[]) => {
    return profile ? roles.includes(profile.role) : false;
  };

  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  const isCliente = () => {
    return profile?.role === 'cliente';
  };

  const canAccessRoute = (route: string) => {
    if (!profile) return false;
    
    // Rotas permitidas para admin
    const adminRoutes = ['/dashboard', '/calendario', '/relatorios', '/clientes', '/locais', '/usuarios', '/configuracoes'];
    
    // Rotas permitidas para cliente
    const clienteRoutes = ['/dashboard', '/calendario', '/relatorios'];
    
    if (isAdmin()) {
      return adminRoutes.includes(route);
    }
    
    if (isCliente()) {
      return clienteRoutes.includes(route);
    }
    
    return false;
  };

  const canManageUsers = () => {
    return isAdmin();
  };

  const canSeeAllClients = () => {
    return isAdmin();
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      hasRole,
      isAdmin,
      isCliente,
      canAccessRoute,
      canManageUsers,
      canSeeAllClients
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}