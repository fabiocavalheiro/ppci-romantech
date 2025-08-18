import { 
  Shield, 
  Droplets, 
  Users, 
  Zap, 
  Bell, 
  Lightbulb 
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { RecentActivities } from "@/components/dashboard/RecentActivities";

// Mock data para demonstração
const equipmentData = [
  {
    title: "Extintores",
    icon: Shield,
    counts: { ok: 85, warning: 12, danger: 8 },
    total: 105
  },
  {
    title: "Hidrantes",
    icon: Droplets,
    counts: { ok: 18, warning: 3, danger: 1 },
    total: 22
  },
  {
    title: "Brigadistas",
    icon: Users,
    counts: { ok: 24, warning: 4, danger: 2 },
    total: 30
  },
  {
    title: "Sprinklers",
    icon: Droplets,
    counts: { ok: 156, warning: 8, danger: 4 },
    total: 168
  },
  {
    title: "Alarmes",
    icon: Bell,
    counts: { ok: 42, warning: 6, danger: 2 },
    total: 50
  },
  {
    title: "Iluminação",
    icon: Lightbulb,
    counts: { ok: 78, warning: 15, danger: 7 },
    total: 100
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar className="hidden lg:block border-r border-border bg-card" />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Visão geral do status de todos os equipamentos PPCI
            </p>
          </div>
          
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {equipmentData.map((equipment) => (
              <StatusCard
                key={equipment.title}
                title={equipment.title}
                icon={equipment.icon}
                counts={equipment.counts}
                total={equipment.total}
              />
            ))}
          </div>
          
          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivities />
            
            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-ppci-accent/10 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Resumo Geral</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de Equipamentos</span>
                    <span className="font-semibold text-foreground">475</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Em Dia</span>
                    <span className="font-semibold text-status-ok">403 (85%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">A Vencer (30 dias)</span>
                    <span className="font-semibold text-status-warning">48 (10%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vencidos</span>
                    <span className="font-semibold text-status-danger">24 (5%)</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Próximas Atividades</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-foreground">Verificação de Extintores</span>
                    <span className="text-muted-foreground">Amanhã</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-foreground">Teste de Hidrantes</span>
                    <span className="text-muted-foreground">3 dias</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-foreground">Treinamento Brigadistas</span>
                    <span className="text-muted-foreground">1 semana</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;