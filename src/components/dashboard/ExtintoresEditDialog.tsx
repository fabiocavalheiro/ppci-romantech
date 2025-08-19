import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Extintor {
  id?: string;
  numero: number;
  tipo: 'BC' | 'ABC' | 'CO2';
  status: 'ok' | 'warning' | 'danger' | 'expired';
  localizacao_texto?: string;
  responsavel_manutencao?: string;
  ultima_inspecao?: Date;
  proxima_inspecao?: Date;
  observacoes?: string;
  isNew?: boolean;
}

interface ExtintoresEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  localId: string | null;
  localName: string;
}

const extintorSchema = z.object({
  numero: z.number().min(1, "Número deve ser maior que 0"),
  tipo: z.enum(['BC', 'ABC', 'CO2'], { required_error: "Tipo obrigatório" }),
  status: z.enum(['ok', 'warning', 'danger', 'expired']),
  localizacao_texto: z.string().optional(),
  responsavel_manutencao: z.string().optional(),
  ultima_inspecao: z.date().optional(),
  proxima_inspecao: z.date().optional(),
  observacoes: z.string().optional(),
});

export function ExtintoresEditDialog({
  isOpen,
  onClose,
  localId,
  localName,
}: ExtintoresEditDialogProps) {
  const [extintores, setExtintores] = useState<Extintor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar extintores do local
  useEffect(() => {
    if (isOpen && localId) {
      loadExtintores();
    }
  }, [isOpen, localId]);

  const loadExtintores = async () => {
    if (!localId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('extintores')
        .select('*')
        .eq('local_id', localId)
        .order('numero');

      if (error) throw error;

      const formattedData = data.map(item => ({
        ...item,
        ultima_inspecao: item.ultima_inspecao ? new Date(item.ultima_inspecao) : undefined,
        proxima_inspecao: item.proxima_inspecao ? new Date(item.proxima_inspecao) : undefined,
      }));

      setExtintores(formattedData);
    } catch (error) {
      console.error('Erro ao carregar extintores:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar extintores do local.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExtintor = () => {
    const newExtintor: Extintor = {
      numero: 1, // Valor inicial, mas será editável
      tipo: 'ABC',
      status: 'ok',
      isNew: true,
    };
    setExtintores([...extintores, newExtintor]);
  };

  const handleRemoveExtintor = (index: number) => {
    const updated = extintores.filter((_, i) => i !== index);
    setExtintores(updated);
  };

  const handleUpdateExtintor = (index: number, field: keyof Extintor, value: any) => {
    const updated = [...extintores];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calcular próxima inspeção quando última inspeção for alterada
    if (field === 'ultima_inspecao' && value) {
      updated[index].proxima_inspecao = addMonths(value, 3); // 3 meses
    }

    setExtintores(updated);
  };

  const handleSave = async () => {
    if (!localId) return;

    setSaving(true);
    try {
      // Deletar extintores removidos (que existiam antes mas não estão mais na lista)
      const { data: existingData } = await supabase
        .from('extintores')
        .select('id')
        .eq('local_id', localId);

      if (existingData) {
        const currentIds = extintores.filter(e => e.id).map(e => e.id);
        const idsToDelete = existingData
          .map(e => e.id)
          .filter(id => !currentIds.includes(id));

        if (idsToDelete.length > 0) {
          await supabase
            .from('extintores')
            .delete()
            .in('id', idsToDelete);
        }
      }

      // Inserir/atualizar extintores
      for (const extintor of extintores) {
        const data = {
          local_id: localId,
          numero: extintor.numero,
          tipo: extintor.tipo,
          status: extintor.status,
          localizacao_texto: extintor.localizacao_texto || null,
          responsavel_manutencao: extintor.responsavel_manutencao || null,
          ultima_inspecao: extintor.ultima_inspecao ? extintor.ultima_inspecao.toISOString().split('T')[0] : null,
          proxima_inspecao: extintor.proxima_inspecao ? extintor.proxima_inspecao.toISOString().split('T')[0] : null,
          observacoes: extintor.observacoes || null,
        };

        if (extintor.id && !extintor.isNew) {
          // Atualizar existente
          await supabase
            .from('extintores')
            .update(data)
            .eq('id', extintor.id);
        } else {
          // Inserir novo
          await supabase
            .from('extintores')
            .insert(data);
        }
      }

      toast({
        title: "Sucesso",
        description: "Extintores atualizados com sucesso.",
      });

      onClose();
      // Redirecionar para página de locais seria implementado aqui
    } catch (error: any) {
      console.error('Erro ao salvar extintores:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar extintores.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Calcular contadores
  const contadores = {
    total: extintores.length,
    ok: extintores.filter(e => e.status === 'ok').length,
    warning: extintores.filter(e => e.status === 'warning').length,
    danger: extintores.filter(e => e.status === 'danger' || e.status === 'expired').length,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Extintores - {localName}</DialogTitle>
          <DialogDescription>
            Gerencie os extintores individuais deste local.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Contadores */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{contadores.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-status-ok">{contadores.ok}</div>
                <div className="text-sm text-muted-foreground">Em dia</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-status-warning">{contadores.warning}</div>
                <div className="text-sm text-muted-foreground">A vencer</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-status-danger">{contadores.danger}</div>
                <div className="text-sm text-muted-foreground">Vencidos</div>
              </div>
            </div>

            {/* Botão Adicionar */}
            <div className="flex justify-between items-center mb-4">
              <Button onClick={handleAddExtintor} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Extintor
              </Button>
            </div>

            {/* Tabela de Extintores */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Número</TableHead>
                    <TableHead className="w-24">Tipo</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="w-32">Última Inspeção</TableHead>
                    <TableHead className="w-32">Próxima Inspeção</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extintores.map((extintor, index) => (
                    <TableRow key={`${extintor.id || 'new'}-${index}`}>
                       <TableCell>
                         <Input
                           type="number"
                           value={extintor.numero}
                           onChange={(e) => handleUpdateExtintor(index, 'numero', parseInt(e.target.value) || 1)}
                           placeholder="Nº"
                           min="1"
                           className="w-16"
                         />
                       </TableCell>
                      
                      <TableCell>
                        <Select
                          value={extintor.tipo}
                          onValueChange={(value) => handleUpdateExtintor(index, 'tipo', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BC">BC</SelectItem>
                            <SelectItem value="ABC">ABC</SelectItem>
                            <SelectItem value="CO2">CO2</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Select
                          value={extintor.status}
                          onValueChange={(value) => handleUpdateExtintor(index, 'status', value)}
                        >
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
                      </TableCell>

                      <TableCell>
                        <Input
                          value={extintor.localizacao_texto || ''}
                          onChange={(e) => handleUpdateExtintor(index, 'localizacao_texto', e.target.value)}
                          placeholder="Ex: Andar 1 - Corredor A"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          value={extintor.responsavel_manutencao || ''}
                          onChange={(e) => handleUpdateExtintor(index, 'responsavel_manutencao', e.target.value)}
                          placeholder="Nome do responsável"
                        />
                      </TableCell>

                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !extintor.ultima_inspecao && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {extintor.ultima_inspecao ? (
                                format(extintor.ultima_inspecao, "dd/MM/yyyy")
                              ) : (
                                <span>Selecionar</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={extintor.ultima_inspecao}
                              onSelect={(date) => handleUpdateExtintor(index, 'ultima_inspecao', date)}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </TableCell>

                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !extintor.proxima_inspecao && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {extintor.proxima_inspecao ? (
                                format(extintor.proxima_inspecao, "dd/MM/yyyy")
                              ) : (
                                <span>Selecionar</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={extintor.proxima_inspecao}
                              onSelect={(date) => handleUpdateExtintor(index, 'proxima_inspecao', date)}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </TableCell>

                      <TableCell>
                        <Textarea
                          value={extintor.observacoes || ''}
                          onChange={(e) => handleUpdateExtintor(index, 'observacoes', e.target.value)}
                          placeholder="Observações..."
                          className="min-h-[60px] resize-none"
                        />
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveExtintor(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {extintores.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nenhum extintor cadastrado. Clique em "Adicionar Extintor" para começar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}