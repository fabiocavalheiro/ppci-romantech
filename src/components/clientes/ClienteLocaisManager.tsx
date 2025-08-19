import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
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
import { NovoLocalDialog } from "@/components/locais/NovoLocalDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Local {
  id: string;
  name: string;
  address: string;
  description?: string;
  client_type?: string;
  active: boolean;
  created_at: string;
}

interface ClienteLocaisManagerProps {
  clienteId: string;
  clienteName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ClienteLocaisManager({
  clienteId,
  clienteName,
  isOpen,
  onClose,
}: ClienteLocaisManagerProps) {
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNovoLocal, setShowNovoLocal] = useState(false);
  const [localToDelete, setLocalToDelete] = useState<Local | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && clienteId) {
      loadLocais();
    }
  }, [isOpen, clienteId]);

  const loadLocais = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("client_id", clienteId)
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setLocais(data || []);
    } catch (error) {
      console.error("Erro ao carregar locais:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar locais do cliente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocal = async () => {
    if (!localToDelete) return;

    try {
      // Verificar se há extintores associados ao local
      const { data: extintores, error: extintoresError } = await supabase
        .from("extintores")
        .select("id")
        .eq("local_id", localToDelete.id);

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

      // Se não há extintores, proceder com a exclusão
      const { error } = await supabase
        .from("locations")
        .update({ active: false })
        .eq("id", localToDelete.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Local "${localToDelete.name}" excluído com sucesso.`,
      });

      setLocalToDelete(null);
      loadLocais();
    } catch (error) {
      console.error("Erro ao excluir local:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir o local.",
        variant: "destructive",
      });
      setLocalToDelete(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Locais do Cliente</h2>
              <p className="text-muted-foreground">{clienteName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowNovoLocal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Local
              </Button>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Locais Cadastrados ({locais.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {locais.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Nenhum local cadastrado para este cliente.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setShowNovoLocal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Local
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Endereço</TableHead>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocalToDelete(local)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dialog de Novo Local com clienteId pré-definido */}
        <NovoLocalDialog
          isOpen={showNovoLocal}
          onClose={() => setShowNovoLocal(false)}
          onSuccess={() => {
            loadLocais();
            setShowNovoLocal(false);
          }}
          clienteId={clienteId}
        />

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={!!localToDelete} onOpenChange={() => setLocalToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o local "{localToDelete?.name}"? 
                Esta ação não pode ser desfeita.
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
    </div>
  );
}