import { useState } from "react";
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
import { EquipmentEditDialog } from "@/components/dashboard/EquipmentEditDialog";
import { ExtintoresEditDialog } from "@/components/dashboard/ExtintoresEditDialog";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";


export default function Dashboard() {
  const [equipmentData, setEquipmentData] = useState([
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
  ]);

  const [editingEquipment, setEditingEquipment] = useState<{
    index: number;
    data: {
      title: string;
      counts: { ok: number; warning: number; danger: number };
      total: number;
    };
  } | null>(null);

  const [editingExtintores, setEditingExtintores] = useState<{
    localId: string;
    localName: string;
  } | null>(null);

  const handleCardClick = (index: number) => {
    const equipment = equipmentData[index];
    
    // Se for extintores, abrir modal específico
    if (equipment.title === "Extintores") {
      // Por enquanto usar um local fictício - depois integrar com dados reais
      setEditingExtintores({
        localId: "local-exemplo", // Seria dinâmico
        localName: "Local Exemplo"
      });
    } else {
      setEditingEquipment({
        index,
        data: equipment
      });
    }
  };

  const handleSaveEquipment = (updatedData: {
    title: string;
    counts: { ok: number; warning: number; danger: number };
    total: number;
  }) => {
    if (editingEquipment) {
      const newEquipmentData = [...equipmentData];
      newEquipmentData[editingEquipment.index] = {
        ...newEquipmentData[editingEquipment.index],
        counts: updatedData.counts,
        total: updatedData.total
      };
      setEquipmentData(newEquipmentData);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Visão geral do sistema de prevenção contra incêndio
            </p>
          </div>
          
          {/* Equipment Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipmentData.map((equipment, index) => (
              <StatusCard
                key={equipment.title}
                title={equipment.title}
                icon={equipment.icon}
                counts={equipment.counts}
                total={equipment.total}
                onClick={() => handleCardClick(index)}
              />
            ))}
          </div>
          
          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <RecentActivities />
            </div>
            
            {/* System Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border bg-card text-card-foreground shadow p-6 h-full">
                <h3 className="text-lg font-semibold mb-4">Resumo do Sistema</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Equipamentos Ativos</span>
                    <span className="font-medium">300</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Manutenções Pendentes</span>
                    <span className="font-medium text-status-warning">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Itens Vencidos</span>
                    <span className="font-medium text-status-danger">11</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Eficiência Geral</span>
                    <span className="font-medium text-status-ok">96.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Edit Dialog */}
          {editingEquipment && (
            <EquipmentEditDialog
              isOpen={!!editingEquipment}
              onClose={() => setEditingEquipment(null)}
              equipmentData={editingEquipment.data}
              onSave={handleSaveEquipment}
            />
          )}

          {/* Extintores Edit Dialog */}
          {editingExtintores && (
            <ExtintoresEditDialog
              isOpen={!!editingExtintores}
              onClose={() => setEditingExtintores(null)}
              localId={editingExtintores.localId}
              localName={editingExtintores.localName}
            />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}