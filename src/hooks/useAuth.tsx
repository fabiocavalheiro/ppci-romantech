import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  client_id?: string;
  empresa_id?: string;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, empresaId: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isCliente: () => boolean;
  canAccessRoute: (route: string) => boolean;
  canManageUsers: () => boolean;
  canSeeAllClients: () => boolean;
  checkEmpresaStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          try {
            console.log('Fetching profile for user:', session.user.id);
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            if (error) {
              console.error('Error fetching profile:', error);
              // Se não encontrar perfil, tentar criar um
              if (error.code === 'PGRST116') {
                console.log('Profile not found, creating one...');
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    user_id: session.user.id,
                    full_name: session.user.user_metadata?.full_name || session.user.email || 'Usuário',
                    email: session.user.email || '',
                    role: 'cliente'
                  })
                  .select()
                  .single();
                
                if (createError) {
                  console.error('Error creating profile:', createError);
                  setProfile(null);
                } else {
                  console.log('Profile created:', newProfile);
                  setProfile(newProfile as Profile);
                }
              } else {
                setProfile(null);
              }
            } else {
              console.log('Profile fetched:', profile);
              setProfile(profile as Profile);
            }
          } catch (fetchError) {
            console.error('Network error fetching profile:', fetchError);
            setProfile(null);
          }
          setLoading(false);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (!session) {
          setLoading(false);
        }
        // Se há sessão, o listener onAuthStateChange vai lidar com ela
      } catch (error) {
        console.error('Network error getting session:', error);
        setLoading(false);
      }
    };
    
    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    setLoading(true);
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('SignIn error:', error);
        setLoading(false);
        return { error };
      }
      
      console.log('SignIn successful:', data.user?.email);
      // O loading será definido como false pelo listener onAuthStateChange
      return { error: null };
    } catch (networkError) {
      console.error('Network error during sign in:', networkError);
      setLoading(false);
      return { error: { message: 'Erro de conexão. Verifique sua internet.' } };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, empresaId: string) => {
    setLoading(true);
    
    try {
      // Primeiro validar se a empresa existe e está ativa
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('id, status')
        .eq('id', empresaId)
        .eq('status', 'ativo')
        .maybeSingle();

      if (empresaError || !empresa) {
        setLoading(false);
        return { 
          error: { 
            message: 'Sua empresa ainda não está cadastrada ou está inativa. Contate o administrador.' 
          } 
        };
      }

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            empresa_id: empresaId
          }
        }
      });
      
      if (error) {
        console.error('SignUp error:', error);
        setLoading(false);
        return { error };
      }
      
      // Se o cadastro foi bem-sucedido e o usuário foi criado, criar o perfil manualmente
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: data.user.id,
              full_name: fullName,
              email: email,
              empresa_id: empresaId,
              role: 'cliente'
            });
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
      
      setLoading(false);
      return { error: null, data };
    } catch (networkError) {
      console.error('Network error during sign up:', networkError);
      setLoading(false);
      return { error: { message: 'Erro de conexão. Verifique sua internet.' } };
    }
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
      
      // O redirecionamento será tratado pelo componente que chama signOut
    } catch (error) {
      console.error('Erro durante o logout:', error);
      
      // Mesmo com erro, limpar estados
      setUser(null);
      setProfile(null);
      setSession(null);
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
    const adminRoutes = ['/dashboard', '/calendario', '/relatorios', '/clientes', '/empresas', '/locais', '/usuarios', '/configuracoes'];
    
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

  const checkEmpresaStatus = async (): Promise<boolean> => {
    if (!profile?.empresa_id) return true; // Admin sem empresa sempre pode acessar
    
    try {
      const { data: empresa, error } = await supabase
        .from('empresas')
        .select('status')
        .eq('id', profile.empresa_id)
        .maybeSingle();
        
      if (error || !empresa) {
        console.error('Error checking empresa status:', error);
        return false;
      }
      
      return empresa.status === 'ativo';
    } catch (error) {
      console.error('Error checking empresa status:', error);
      return false;
    }
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
      canSeeAllClients,
      checkEmpresaStatus
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