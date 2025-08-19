import { useState, useEffect } from "react";
import { Plus, MapPin, Edit } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExtintoresEditDialog } from "@/components/dashboard/ExtintoresEditDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ExtintorCount {
  total: number;
  ok: number;
  warning: number;
  danger: number;
}

interface Local {
  id: string;
  name: string;
  address: string;
  description?: string;
  client_id: string;
  active: boolean;
  created_at: string;
  extintores?: ExtintorCount;
}

export default function Locais() {
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLocal, setEditingLocal] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    loadLocais();
  }, []);

  const loadLocais = async () => {
    setLoading(true);
    try {
      // Carregar locais
      const { data: locaisData, error: locaisError } = await supabase
        .from('locations')
        .select('*')
        .eq('active', true)
        .order('name');

      if (locaisError) throw locaisError;

      // Carregar contadores de extintores para cada local
      const locaisWithCounts = await Promise.all(
        locaisData.map(async (local) => {
          const { data: extintoresData, error: extintoresError } = await supabase
            .from('extintores')
            .select('status')
            .eq('local_id', local.id);

          if (extintoresError) {
            console.error('Erro ao carregar extintores:', extintoresError);
            return {
              ...local,
              extintores: { total: 0, ok: 0, warning: 0, danger: 0 }
            };
          }

          const counts = {
            total: extintoresData.length,
            ok: extintoresData.filter(e => e.status === 'ok').length,
            warning: extintoresData.filter(e => e.status === 'warning').length,
            danger: extintoresData.filter(e => e.status === 'danger' || e.status === 'expired').length,
          };

          return { ...local, extintores: counts };
        })
      );

      setLocais(locaisWithCounts);
    } catch (error: any) {
      console.error('Erro ao carregar locais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar locais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditExtintores = (local: Local) => {
    setEditingLocal({
      id: local.id,
      name: local.name
    });
  };

  const handleCloseDialog = () => {
    setEditingLocal(null);
    // Recarregar locais para atualizar contadores
    loadLocais();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Locais</h2>
                <p className="text-muted-foreground">
                  Gerencie os locais e seus extintores
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Local
              </Button>
            </div>
          </div>

          {/* Resumo Geral */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Locais</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{locais.length}</div>
                <p className="text-xs text-muted-foreground">locais ativos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Extintores</CardTitle>
                <div className="w-3 h-3 rounded-full bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locais.reduce((acc, local) => acc + (local.extintores?.total || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">em todos os locais</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">A Vencer</CardTitle>
                <div className="w-3 h-3 rounded-full bg-status-warning"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-status-warning">
                  {locais.reduce((acc, local) => acc + (local.extintores?.warning || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">extintores</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                <div className="w-3 h-3 rounded-full bg-status-danger"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-status-danger">
                  {locais.reduce((acc, local) => acc + (local.extintores?.danger || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">extintores</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Locais */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Locais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Em dia</TableHead>
                      <TableHead className="text-center">A vencer</TableHead>
                      <TableHead className="text-center">Vencidos</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locais.map((local) => (
                      <TableRow key={local.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{local.name}</div>
                            {local.description && (
                              <div className="text-sm text-muted-foreground">
                                {local.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{local.address}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {local.extintores?.total || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-status-ok text-status-ok-foreground">
                            {local.extintores?.ok || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-status-warning text-status-warning-foreground">
                            {local.extintores?.warning || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-status-danger text-status-danger-foreground">
                            {local.extintores?.danger || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditExtintores(local)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Extintores
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {locais.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum local encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Dialog de Edição de Extintores */}
          {editingLocal && (
            <ExtintoresEditDialog
              isOpen={!!editingLocal}
              onClose={handleCloseDialog}
              localId={editingLocal.id}
              localName={editingLocal.name}
            />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}