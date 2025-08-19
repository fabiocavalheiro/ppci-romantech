import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

interface Cliente {
  id: string;
  name: string;
}

interface Local {
  id: string;
  name: string;
  address: string;
}

interface AdicionarExtintorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExtintorAdded: () => void;
}

const extintorSchema = z.object({
  numero: z.number().min(1, "Número deve ser maior que 0"),
  tipo: z.enum(['ABC', 'BC', 'CO2']),
  status: z.enum(['ok', 'warning', 'danger', 'expired']),
  local_id: z.string().min(1, "Local é obrigatório"),
  localizacao_texto: z.string().optional(),
  observacoes: z.string().optional(),
});

type ExtintorFormData = z.infer<typeof extintorSchema>;
type ExtintorInsert = Database['public']['Tables']['extintores']['Insert'];

export function AdicionarExtintorDialog({
  isOpen,
  onClose,
  onExtintorAdded,
}: AdicionarExtintorDialogProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<ExtintorFormData>({
    numero: 1,
    tipo: 'ABC',
    status: 'ok',
    local_id: '',
    localizacao_texto: '',
    observacoes: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadClientes();
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (clienteSelecionado) {
      loadLocais(clienteSelecionado);
    } else {
      setLocais([]);
      setFormData(prev => ({ ...prev, local_id: '' }));
    }
  }, [clienteSelecionado]);

  const resetForm = () => {
    setFormData({
      numero: 1,
      tipo: 'ABC',
      status: 'ok',
      local_id: '',
      localizacao_texto: '',
      observacoes: '',
    });
    setClienteSelecionado('');
    setLocais([]);
  };

  const loadClientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLocais = async (clienteId: string) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, address')
        .eq('client_id', clienteId)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setLocais(data || []);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar locais do cliente.",
        variant: "destructive",
      });
    }
  };

  const getProximoNumero = async (localId: string) => {
    try {
      const { data, error } = await supabase
        .from('extintores')
        .select('numero')
        .eq('local_id', localId)
        .order('numero', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      return data && data.length > 0 ? data[0].numero + 1 : 1;
    } catch (error) {
      console.error('Erro ao buscar próximo número:', error);
      return 1;
    }
  };

  const handleLocalChange = async (localId: string) => {
    setFormData(prev => ({ ...prev, local_id: localId }));
    
    // Sugerir próximo número automaticamente
    const proximoNumero = await getProximoNumero(localId);
    setFormData(prev => ({ ...prev, numero: proximoNumero }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validar dados
      const validatedData = extintorSchema.parse(formData);
      
      // Verificar se já existe extintor com esse número no local
      const { data: existingExtintor, error: checkError } = await supabase
        .from('extintores')
        .select('id')
        .eq('local_id', validatedData.local_id)
        .eq('numero', validatedData.numero)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingExtintor) {
        toast({
          title: "Erro",
          description: `Já existe um extintor com o número ${validatedData.numero} neste local.`,
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para inserção
      const insertData: ExtintorInsert = {
        numero: validatedData.numero,
        tipo: validatedData.tipo as Database['public']['Enums']['extintor_type'],
        status: validatedData.status as Database['public']['Enums']['equipment_status'],
        local_id: validatedData.local_id,
        localizacao_texto: validatedData.localizacao_texto || null,
        observacoes: validatedData.observacoes || null,
      };

      // Inserir extintor
      const { error: insertError } = await supabase
        .from('extintores')
        .insert(insertData);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Extintor adicionado com sucesso.",
      });

      onExtintorAdded();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar extintor:', error);
      
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao salvar extintor.",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Extintor
          </DialogTitle>
          <DialogDescription>
            Selecione o cliente e local onde o extintor será instalado
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Seleção de Cliente */}
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Local */}
            <div className="space-y-2">
              <Label htmlFor="local">Local *</Label>
              <Select 
                value={formData.local_id} 
                onValueChange={handleLocalChange}
                disabled={!clienteSelecionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !clienteSelecionado 
                      ? "Selecione um cliente primeiro" 
                      : "Selecione um local"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {locais.map((local) => (
                    <SelectItem key={local.id} value={local.id}>
                      <div>
                        <div className="font-medium">{local.name}</div>
                        <div className="text-sm text-muted-foreground">{local.address}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dados do Extintor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  type="number"
                  min="1"
                  value={formData.numero}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ABC">ABC</SelectItem>
                    <SelectItem value="BC">BC</SelectItem>
                    <SelectItem value="CO2">CO2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ok">Em dia</SelectItem>
                  <SelectItem value="warning">A vencer</SelectItem>
                  <SelectItem value="danger">Vencido</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização específica</Label>
              <Input
                id="localizacao"
                placeholder="Ex: Corredor principal, próximo ao elevador"
                value={formData.localizacao_texto}
                onChange={(e) => setFormData(prev => ({ ...prev, localizacao_texto: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações adicionais sobre o extintor"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !formData.local_id}
          >
            {saving ? "Salvando..." : "Adicionar Extintor"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}