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

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    current: true
  },
  {
    name: "Calendário",
    href: "/calendario",
    icon: Calendar,
    current: false
  },
  {
    name: "Relatórios",
    href: "/relatorios",
    icon: FileText,
    current: false
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Building2,
    current: false
  },
  {
    name: "Locais",
    href: "/locais",
    icon: MapPin,
    current: false
  },
  {
    name: "Usuários",
    href: "/usuarios",
    icon: Users,
    current: false
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    current: false
  }
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={item.current ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    item.current && "bg-secondary text-secondary-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}