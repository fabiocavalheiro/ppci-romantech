import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import romantechLogo from "@/assets/romantech-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/calendario': 'Calendário',
  '/relatorios': 'Relatórios',
  '/clientes': 'Clientes',
  '/locais': 'Locais',
  '/usuarios': 'Usuários',
  '/configuracoes': 'Configurações',
};

export function Header() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  
  const currentTitle = routeTitles[location.pathname] || 'Dashboard';

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-romantech-black px-3 py-2 rounded">
            <img
              src={romantechLogo}
              alt="Romantech Logo"
              className="h-8 w-auto"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{currentTitle}</h1>
            <p className="text-sm text-muted-foreground">Sistema de Gestão PPCI</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}