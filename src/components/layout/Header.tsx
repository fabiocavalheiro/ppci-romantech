import { useState, useEffect } from "react";
import { Bell, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import romanTechLogo from '@/assets/romantech-logo.png';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/useSettings";

export function Header() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { settings } = useSettings();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [expiringExtintores, setExpiringExtintores] = useState<any[]>([]);
  
  useEffect(() => {
    if (isAdmin()) {
      loadExpiringExtintores();
    }
  }, [isAdmin]);

  const loadExpiringExtintores = async () => {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const { data, error } = await supabase
        .from('extintores')
        .select(`
          *,
          locations:local_id (
            name,
            address
          )
        `)
        .or(`proxima_inspecao.lt.${today.toISOString().split('T')[0]},proxima_inspecao.lt.${thirtyDaysFromNow.toISOString().split('T')[0]}`);

      if (error) {
        console.error('Erro ao carregar extintores:', error);
        return;
      }

      if (data) {
        const expired = data.filter(ext => ext.proxima_inspecao && new Date(ext.proxima_inspecao) < today);
        const expiring = data.filter(ext => ext.proxima_inspecao && new Date(ext.proxima_inspecao) >= today && new Date(ext.proxima_inspecao) <= thirtyDaysFromNow);
        
        const notifications = [...expired, ...expiring];
        setExpiringExtintores(notifications);
        setNotificationCount(notifications.length);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Mobile menu trigger */}
        <SidebarTrigger className="lg:hidden" />
        
        {/* Logo - visible on larger screens */}
        <div className="hidden lg:flex items-center space-x-4">
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt={settings.company_name || "RomanTech"} 
              className="h-8 w-auto max-w-40 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = romanTechLogo;
              }}
            />
          ) : (
            <img 
              src={romanTechLogo} 
              alt="RomanTech" 
              className="h-8 w-auto"
            />
          )}
        </div>

        {/* Mobile logo - visible when sidebar is closed */}
        <div className="flex lg:hidden items-center">
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt={settings.company_name || "RomanTech"} 
              className="h-7 w-auto max-w-32 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = romanTechLogo;
              }}
            />
          ) : (
            <img 
              src={romanTechLogo} 
              alt="RomanTech" 
              className="h-7 w-auto"
            />
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side items */}
        <div className="flex items-center space-x-4">
          {/* Notifications - Apenas para Admin */}
          {isAdmin() && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                  <span className="sr-only">Notificações de extintores</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Extintores para Inspeção</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {expiringExtintores.length === 0 ? (
                  <DropdownMenuItem disabled>
                    Nenhuma notificação
                  </DropdownMenuItem>
                ) : (
                  expiringExtintores.slice(0, 5).map((extintor) => {
                    const isExpired = extintor.proxima_inspecao && new Date(extintor.proxima_inspecao) < new Date();
                    const daysUntilExpiry = extintor.proxima_inspecao 
                      ? Math.ceil((new Date(extintor.proxima_inspecao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : 0;
                    
                    return (
                      <DropdownMenuItem key={extintor.id} className="flex flex-col items-start p-3">
                        <div className="font-medium">
                          Extintor #{extintor.numero} - {extintor.tipo}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {extintor.locations?.name || 'Local não identificado'}
                        </div>
                        <div className={`text-xs ${isExpired ? 'text-destructive' : 'text-orange-600'}`}>
                          {isExpired 
                            ? `Vencido há ${Math.abs(daysUntilExpiry)} dias`
                            : `Vence em ${daysUntilExpiry} dias`
                          }
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
                {expiringExtintores.length > 5 && (
                  <DropdownMenuItem disabled className="text-center">
                    +{expiringExtintores.length - 5} mais...
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 h-9 px-3">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium">{profile?.full_name || 'Usuário'}</span>
                  <span className="text-xs text-muted-foreground capitalize">{profile?.role || 'cliente'}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut} 
                disabled={isLoggingOut}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Saindo..." : "Sair"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}