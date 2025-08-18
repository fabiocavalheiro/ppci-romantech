import { 
  Shield, 
  Droplet, 
  Users, 
  Sprout, 
  AlertTriangle, 
  Lightbulb 
} from "lucide-react";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const equipmentData = [
  {
    title: "Extintores",
    icon: Shield,
    counts: { ok: 45, warning: 8, danger: 2 },
    total: 55
  },
  {
    title: "Hidrantes",
    icon: Droplet,
    counts: { ok: 12, warning: 3, danger: 1 },
    total: 16
  },
  {
    title: "Brigadistas",
    icon: Users,
    counts: { ok: 28, warning: 5, danger: 0 },
    total: 33
  },
  {
    title: "Sprinklers",
    icon: Sprout,
    counts: { ok: 84, warning: 12, danger: 4 },
    total: 100
  },
  {
    title: "Alarmes",
    icon: AlertTriangle,
    counts: { ok: 15, warning: 2, danger: 1 },
    total: 18
  },
  {
    title: "Iluminação",
    icon: Lightbulb,
    counts: { ok: 67, warning: 8, danger: 3 },
    total: 78
  }
];

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Visão geral do sistema de prevenção contra incêndio
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <RecentActivities />
            <div className="col-span-3">
              <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Resumo do Sistema</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Equipamentos Ativos</span>
                    <span className="font-medium">300</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Manutenções Pendentes</span>
                    <span className="font-medium text-warning">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Itens Vencidos</span>
                    <span className="font-medium text-destructive">11</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Eficiência Geral</span>
                    <span className="font-medium text-success">96.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}