import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import romanTechLogo from '@/assets/romantech-logo.png';
import { supabase } from '@/integrations/supabase/client';

interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  status: string;
}

export default function Auth() {
  const { user, profile, signIn, signUp, loading } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>("");
  const [empresasLoading, setEmpresasLoading] = useState(false);

  // Navegar para dashboard se usuário estiver logado
  useEffect(() => {
    if (user && !loading) {
      console.log('User authenticated, redirecting to dashboard');
      // Usar replace com hash para forçar a navegação no Chrome Android
      window.location.replace('/dashboard#loaded');
    }
  }, [user, loading]);

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    setEmpresasLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, cnpj, status')
        .eq('status', 'ativo')
        .order('nome');

      if (error) {
        console.error('Error fetching empresas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as empresas.",
          variant: "destructive"
        });
      } else {
        setEmpresas(data || []);
      }
    } catch (error) {
      console.error('Error fetching empresas:', error);
    } finally {
      setEmpresasLoading(false);
    }
  };

  // Mostrar loading enquanto verifica autenticação ou carrega configurações
  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    if (!selectedEmpresa) {
      toast({
        title: "Empresa obrigatória",
        description: "Por favor, selecione uma empresa para continuar.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const { error, data } = await signUp(email, password, fullName, selectedEmpresa);
    
    if (error) {
      console.error('Signup error details:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro desconhecido durante o cadastro",
        variant: "destructive",
      });
    } else {
      if (data?.user && !data.user.email_confirmed_at) {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta e fazer login.",
        });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Sua conta foi criada com sucesso.",
        });
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={settings?.company_name || "RomanTech"} 
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = romanTechLogo;
                }}
              />
            ) : (
              <img 
                src={romanTechLogo} 
                alt="RomanTech" 
                className="h-20 w-auto"
              />
            )}
          </div>
          
          <p className="text-muted-foreground mt-2">
          </p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Entrar na conta</CardTitle>
                <CardDescription>
                  Digite suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Criar conta</CardTitle>
                <CardDescription>
                  Preencha os dados para criar sua conta
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa *</Label>
                    <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
                      <SelectTrigger>
                        <SelectValue placeholder={empresasLoading ? "Carregando..." : "Selecione sua empresa"} />
                      </SelectTrigger>
                      <SelectContent>
                        {empresas.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            {empresa.nome} {empresa.cnpj && `- ${empresa.cnpj}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {empresas.length === 0 && !empresasLoading && (
                      <Alert>
                        <AlertDescription>
                          Nenhuma empresa ativa encontrada. Contate o administrador para cadastrar sua empresa.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !selectedEmpresa || empresas.length === 0}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar conta
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}