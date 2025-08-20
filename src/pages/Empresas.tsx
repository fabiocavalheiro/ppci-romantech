import { useState, useEffect } from "react";
import { Plus, Search, Building2, Users, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  status: string;
  created_at: string;
  usuarios_count?: number;
}

export default function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      // Buscar empresas com contagem de usuários
      const { data: empresasData, error } = await supabase
        .from('empresas')
        .select(`
          *,
          profiles!profiles_empresa_id_fkey(count)
        `)
        .order('nome');

      if (error) {
        console.error('Error fetching empresas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as empresas.",
          variant: "destructive"
        });
      } else {
        const empresasWithCount = empresasData?.map(empresa => ({
          ...empresa,
          usuarios_count: empresa.profiles?.[0]?.count || 0
        })) || [];
        setEmpresas(empresasWithCount);
      }
    } catch (error) {
      console.error('Error fetching empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmpresa = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const empresaData = {
      nome: formData.get("nome") as string,
      cnpj: formData.get("cnpj") as string || null,
      status: formData.get("status") as string,
    };

    try {
      if (editingEmpresa) {
        // Atualizar empresa existente
        const { error } = await supabase
          .from('empresas')
          .update(empresaData)
          .eq('id', editingEmpresa.id);

        if (error) throw error;

        toast({
          title: "Empresa atualizada",
          description: "A empresa foi atualizada com sucesso.",
        });
      } else {
        // Criar nova empresa
        const { error } = await supabase
          .from('empresas')
          .insert(empresaData);

        if (error) throw error;

        toast({
          title: "Empresa criada",
          description: "A empresa foi criada com sucesso.",
        });
      }

      setIsDialogOpen(false);
      setEditingEmpresa(null);
      fetchEmpresas();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar a empresa.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEmpresa = async (empresa: Empresa) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', empresa.id);

      if (error) throw error;

      toast({
        title: "Empresa removida",
        description: "A empresa foi removida com sucesso.",
      });

      fetchEmpresas();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao remover a empresa.",
        variant: "destructive"
      });
    }
  };

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnpj?.includes(searchTerm)
  );

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingEmpresa(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">
            Gerencie as empresas do sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEmpresa ? "Editar Empresa" : "Nova Empresa"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveEmpresa} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa *</Label>
                <Input
                  id="nome"
                  name="nome"
                  defaultValue={editingEmpresa?.nome || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  defaultValue={editingEmpresa?.cnpj || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editingEmpresa?.status || "ativo"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEmpresa ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmpresas.map((empresa) => (
          <Card key={empresa.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <CardTitle className="text-lg">{empresa.nome}</CardTitle>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(empresa)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a empresa "{empresa.nome}"? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteEmpresa(empresa)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {empresa.cnpj && (
                  <p className="text-sm text-muted-foreground">
                    CNPJ: {empresa.cnpj}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant={empresa.status === 'ativo' ? 'default' : 'secondary'}>
                    {empresa.status}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{empresa.usuarios_count} usuários</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Criada em: {new Date(empresa.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmpresas.length === 0 && !loading && (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhuma empresa encontrada</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente ajustar sua busca." : "Comece criando uma nova empresa."}
          </p>
        </div>
      )}
    </div>
  );
}