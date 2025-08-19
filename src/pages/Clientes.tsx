import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NovoClienteDialog } from "@/components/clientes/NovoClienteDialog";
import { EditarClienteDialog } from "@/components/clientes/EditarClienteDialog";

interface Cliente {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  address?: any;
  created_at: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [novoClienteOpen, setNovoClienteOpen] = useState(false);
  const [editarClienteOpen, setEditarClienteOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null);
  const { toast } = useToast();

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleEditCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setEditarClienteOpen(true);
  };

  const handleDeleteCliente = (cliente: Cliente) => {
    setClienteParaExcluir(cliente);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clienteParaExcluir) return;

    try {
      const { error } = await supabase
        .from("clients")
        .update({ active: false })
        .eq("id", clienteParaExcluir.id);

      if (error) throw error;

      toast({
        title: "Cliente excluído com sucesso!",
        description: "O cliente foi removido do sistema.",
      });

      fetchClientes();
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast({
        title: "Erro ao excluir cliente",
        description: "Não foi possível excluir o cliente.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setClienteParaExcluir(null);
    }
  };

  const filteredClientes = clientes.filter((cliente) =>
    cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
      <Layout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
              <p className="text-muted-foreground">
                Gerenciar clientes do sistema
              </p>
            </div>
            <Button onClick={() => setNovoClienteOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                Todos os clientes cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar clientes..." 
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Locais</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Carregando clientes...
                      </TableCell>
                    </TableRow>
                  ) : filteredClientes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Nenhum cliente encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.name}</TableCell>
                        <TableCell>{cliente.cnpj || "-"}</TableCell>
                        <TableCell>{cliente.email || "-"}</TableCell>
                        <TableCell>{cliente.phone || "-"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MapPin className="mr-1 h-3 w-3" />
                            - locais
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditCliente(cliente)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCliente(cliente)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <NovoClienteDialog
          isOpen={novoClienteOpen}
          onClose={() => setNovoClienteOpen(false)}
          onSuccess={fetchClientes}
        />

        <EditarClienteDialog
          isOpen={editarClienteOpen}
          onClose={() => {
            setEditarClienteOpen(false);
            setClienteSelecionado(null);
          }}
          onSuccess={fetchClientes}
          cliente={clienteSelecionado}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o cliente "{clienteParaExcluir?.name}"? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteDialogOpen(false);
                setClienteParaExcluir(null);
              }}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Layout>
    </ProtectedRoute>
  );
}