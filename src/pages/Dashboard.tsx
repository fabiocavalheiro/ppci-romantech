import { useState, useEffect } from "react";
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
import { ExtintoresStatusDialog } from "@/components/dashboard/ExtintoresStatusDialog";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [equipmentData, setEquipmentData] = useState([
    {
      title: "Extintores",
      icon: Shield,
      counts: { ok: 0, warning: 0, danger: 0 },
      total: 0
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

  const [loading, setLoading] = useState(true);

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

  const [extintoresStatusDialog, setExtintoresStatusDialog] = useState<{
    status: 'warning' | 'danger';
    title: string;
  } | null>(null);

  useEffect(() => {
    loadExtintoresData();
  }, []);

  const loadExtintoresData = async () => {
    try {
      const { data, error } = await supabase
        .from('extintores')
        .select('status');

      if (error) throw error;

      const counts = {
        total: data.length,
        ok: data.filter(e => e.status === 'ok').length,
        warning: data.filter(e => e.status === 'warning').length,
        danger: data.filter(e => e.status === 'danger' || e.status === 'expired').length,
      };

      setEquipmentData(prev => 
        prev.map(item => 
          item.title === "Extintores" 
            ? { ...item, counts, total: counts.total }
            : item
        )
      );
    } catch (error) {
      console.error('Erro ao carregar dados dos extintores:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos extintores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (index: number) => {
    const equipment = equipmentData[index];
    
    // Se for extintores, usar dados do primeiro local disponível
    if (equipment.title === "Extintores") {
      try {
        const { data: locaisData, error } = await supabase
          .from('locations')
          .select('id, name')
          .eq('active', true)
          .limit(1);

        if (error) throw error;

        if (locaisData && locaisData.length > 0) {
          setEditingExtintores({
            localId: locaisData[0].id,
            localName: locaisData[0].name
          });
        } else {
          toast({
            title: "Aviso",
            description: "Nenhum local encontrado. Crie um local primeiro.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao buscar locais:', error);
        toast({
          title: "Erro",
          description: "Erro ao buscar locais disponíveis.",
          variant: "destructive",
        });
      }
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

  const handleExtintoresStatusClick = (status: 'warning' | 'danger') => {
    const title = status === 'warning' ? 'Extintores A Vencer' : 'Extintores Vencidos';
    setExtintoresStatusDialog({ status, title });
  };

  const handleCloseExtintoresDialog = () => {
    setEditingExtintores(null);
    // Recarregar dados dos extintores
    loadExtintoresData();
  };

  return (
    <ProtectedRoute>
      <Layout>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
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
                  onWarningClick={equipment.title === "Extintores" ? () => handleExtintoresStatusClick('warning') : undefined}
                  onDangerClick={equipment.title === "Extintores" ? () => handleExtintoresStatusClick('danger') : undefined}
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
                onClose={handleCloseExtintoresDialog}
                localId={editingExtintores.localId}
                localName={editingExtintores.localName}
              />
            )}
            {/* Extintores Status Dialog */}
            {extintoresStatusDialog && (
              <ExtintoresStatusDialog
                isOpen={!!extintoresStatusDialog}
                onClose={() => setExtintoresStatusDialog(null)}
                status={extintoresStatusDialog.status}
                title={extintoresStatusDialog.title}
              />
            )}
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}