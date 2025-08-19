import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Client {
  id: string;
  name: string;
}

interface NovoLocalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const localSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  description: z.string().optional(),
  client_id: z.string().min(1, "Cliente é obrigatório"),
});

type LocalFormData = z.infer<typeof localSchema>;

export function NovoLocalDialog({
  isOpen,
  onClose,
  onSuccess,
}: NovoLocalDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<LocalFormData>({
    resolver: zodResolver(localSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      client_id: "",
    },
  });

  // Carregar clientes
  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  const loadClients = async () => {
    setLoading(true);
    try {
      console.log('Carregando clientes...');
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Erro na query de clientes:', error);
        throw error;
      }
      
      console.log('Clientes carregados:', data);
      setClients(data || []);
      
      // Se houver apenas um cliente, selecioná-lo automaticamente
      if (data && data.length === 1) {
        form.setValue('client_id', data[0].id);
        console.log('Cliente único selecionado automaticamente:', data[0].name);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LocalFormData) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('locations')
        .insert({
          name: data.name,
          address: data.address,
          description: data.description || null,
          client_id: data.client_id,
          active: true,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Local criado com sucesso.",
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar local:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar local.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Local</DialogTitle>
          <DialogDescription>
            Adicione um novo local para gerenciar equipamentos de segurança.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border shadow-md max-h-[200px] overflow-auto z-[100]">
                        {clients.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            {loading ? "Carregando..." : "Nenhum cliente encontrado"}
                          </div>
                        ) : (
                          clients.map((client) => (
                            <SelectItem 
                              key={client.id} 
                              value={client.id}
                              className="cursor-pointer hover:bg-accent"
                            >
                              {client.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {clients.length === 0 && !loading && (
                      <p className="text-sm text-destructive">
                        É necessário ter pelo menos um cliente cadastrado para criar um local.
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Local *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Matriz - São Paulo" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição opcional do local..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving || clients.length === 0}
                  title={clients.length === 0 ? "Nenhum cliente disponível" : ""}
                >
                  {saving ? "Criando..." : "Criar Local"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}