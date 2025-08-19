import { useState, useEffect } from "react";
import { Plus, MapPin, Edit, Trash2 } from "lucide-react";
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
import { NovoLocalDialog } from "@/components/locais/NovoLocalDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  client_type?: string;
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

  const [showNovoLocal, setShowNovoLocal] = useState(false);
  const [localToDelete, setLocalToDelete] = useState<Local | null>(null);

  useEffect(() => {
    loadLocais();
  }, []);

  const loadLocais = async () => {
    setLoading(true);
    try {
      console.log('Carregando locais...');
      
      // Carregar locais
      const { data: locaisData, error: locaisError } = await supabase
        .from('locations')
        .select('*')
        .eq('active', true)
        .order('name');

      console.log('Locais carregados:', locaisData);
      console.log('Erro nos locais:', locaisError);

      if (locaisError) throw locaisError;

      // Carregar contadores de extintores para cada local
      const locaisWithCounts = await Promise.all(
        (locaisData || []).map(async (local) => {
          console.log('Carregando extintores para local:', local.name);
          
          const { data: extintoresData, error: extintoresError } = await supabase
            .from('extintores')
            .select('status')
            .eq('local_id', local.id);

          console.log(`Extintores para ${local.name}:`, extintoresData);

          if (extintoresError) {
            console.error('Erro ao carregar extintores:', extintoresError);
            return {
              ...local,
              extintores: { total: 0, ok: 0, warning: 0, danger: 0 }
            };
          }

          const counts = {
            total: extintoresData?.length || 0,
            ok: extintoresData?.filter(e => e.status === 'ok').length || 0,
            warning: extintoresData?.filter(e => e.status === 'warning').length || 0,
            danger: extintoresData?.filter(e => e.status === 'danger' || e.status === 'expired').length || 0,
          };

          return { ...local, extintores: counts };
        })
      );

      console.log('Locais com contadores:', locaisWithCounts);
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

  const handleNovoLocalSuccess = () => {
    // Recarregar locais após criar novo
    loadLocais();
  };

  const handleDeleteLocal = async () => {
    if (!localToDelete) return;

    try {
      console.log('Iniciando exclusão do local:', localToDelete.id);
      
      // Primeiro verificar se há extintores associados ao local
      const { data: extintores, error: extintoresError } = await supabase
        .from('extintores')
        .select('id')
        .eq('local_id', localToDelete.id);

      console.log('Verificação de extintores:', { extintores, extintoresError });

      if (extintoresError) throw extintoresError;

      if (extintores && extintores.length > 0) {
        toast({
          title: "Erro",
          description: `Não é possível excluir o local "${localToDelete.name}" pois há ${extintores.length} extintor(es) associado(s). Remova os extintores primeiro.`,
          variant: "destructive",
        });
        setLocalToDelete(null);
        return;
      }

      // Se não há extintores, proceder com a exclusão - usar active = false em vez de DELETE
      const { data, error } = await supabase
        .from('locations')
        .update({ active: false })
        .eq('id', localToDelete.id)
        .select();

      console.log('Resultado da "exclusão" (desativação):', { data, error });

      if (error) throw error;

      // Atualizar a lista local imediatamente removendo o local excluído
      setLocais(prevLocais => prevLocais.filter(local => local.id !== localToDelete.id));

      toast({
        title: "Sucesso",
        description: `Local "${localToDelete.name}" excluído com sucesso.`,
      });

      setLocalToDelete(null);
    } catch (error: any) {
      console.error('Erro ao excluir local:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir o local.",
        variant: "destructive",
      });
      setLocalToDelete(null);
    }
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
              <Button 
                className="flex items-center gap-2"
                onClick={() => setShowNovoLocal(true)}
              >
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
                      <TableHead>Tipo</TableHead>
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
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {local.client_type || 'N/A'}
                          </Badge>
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
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditExtintores(local)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Extintores
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocalToDelete(local)}
                              className="flex items-center gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {locais.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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

          {/* Dialog de Novo Local */}
          <NovoLocalDialog
            isOpen={showNovoLocal}
            onClose={() => setShowNovoLocal(false)}
            onSuccess={handleNovoLocalSuccess}
          />

          {/* Dialog de Confirmação de Exclusão */}
          <AlertDialog open={!!localToDelete} onOpenChange={() => setLocalToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o local "{localToDelete?.name}"? 
                  Esta ação não pode ser desfeita.
                  {localToDelete && (
                    <div className="mt-2 text-sm">
                      <strong>Endereço:</strong> {localToDelete.address}
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteLocal}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}