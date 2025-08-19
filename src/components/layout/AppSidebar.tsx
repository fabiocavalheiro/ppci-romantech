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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const allNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "cliente"]
  },
  {
    name: "Calendário",
    href: "/calendario",
    icon: Calendar,
    roles: ["admin", "cliente"]
  },
  {
    name: "Relatórios",
    href: "/relatorios",
    icon: FileText,
    roles: ["admin", "cliente"]
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Building2,
    roles: ["admin"] // Apenas admin pode ver todos os clientes
  },
  {
    name: "Locais",
    href: "/locais",
    icon: MapPin,
    roles: ["admin", "cliente"] // Cliente vê apenas seus locais
  },
  {
    name: "Usuários",
    href: "/usuarios",
    icon: Users,
    roles: ["admin"] // Apenas admin pode gerenciar usuários
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    roles: ["admin"] // Apenas admin pode alterar configurações do sistema
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();

  const navigation = allNavigation.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  const isExpanded = navigation.some((i) => isActive(i.href));
  
  const getNavClass = (active: boolean) => 
    active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar
      className={state === "collapsed" ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup className="py-4">
          <SidebarGroupLabel className="px-4 text-sidebar-foreground/70 font-semibold text-xs uppercase tracking-wider">
            RomanTech
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    className={getNavClass(isActive(item.href))}
                    tooltip={item.name}
                  >
                    <NavLink to={item.href} className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {state !== "collapsed" && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}