import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Building2, 
  MapPin, 
  Settings,
  Users
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  className?: string;
}

const allNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "cliente", "tecnico"]
  },
  {
    name: "Calendário",
    href: "/calendario",
    icon: Calendar,
    roles: ["admin", "cliente", "tecnico"]
  },
  {
    name: "Relatórios",
    href: "/relatorios",
    icon: FileText,
    roles: ["admin", "cliente", "tecnico"]
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Building2,
    roles: ["admin", "tecnico"]
  },
  {
    name: "Locais",
    href: "/locais",
    icon: MapPin,
    roles: ["admin", "cliente", "tecnico"]
  },
  {
    name: "Usuários",
    href: "/usuarios",
    icon: Users,
    roles: ["admin"]
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    roles: ["admin", "cliente", "tecnico"]
  }
];

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { profile } = useAuth();

  const navigation = allNavigation.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  return (
    <div className={cn("pb-12 w-64 border-r bg-card", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-secondary text-secondary-foreground"
                    )}
                    asChild
                  >
                    <NavLink to={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </NavLink>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}