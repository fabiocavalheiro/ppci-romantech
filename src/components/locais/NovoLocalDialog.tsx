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

interface NovoLocalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const localSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  description: z.string().optional(),
  client_type: z.string().min(1, "Tipo de cliente é obrigatório"),
});

type LocalFormData = z.infer<typeof localSchema>;

// Opções de tipo de cliente
const clientTypes = [
  { value: "residencial", label: "Residencial" },
  { value: "comercial", label: "Comercial" },
  { value: "industria", label: "Indústria" },
];

export function NovoLocalDialog({
  isOpen,
  onClose,
  onSuccess,
}: NovoLocalDialogProps) {
  const [saving, setSaving] = useState(false);

  const form = useForm<LocalFormData>({
    resolver: zodResolver(localSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      client_type: "",
    },
  });

  const onSubmit = async (data: LocalFormData) => {
    setSaving(true);
    try {
      console.log('Criando local com dados:', data);
      
      // Primeiro, precisamos obter um client_id válido para manter a integridade referencial
      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('active', true)
        .limit(1);

      if (clientError) {
        console.error('Erro ao buscar clientes:', clientError);
        throw new Error('Erro ao buscar clientes');
      }

      if (!clients || clients.length === 0) {
        throw new Error('Nenhum cliente ativo encontrado');
      }

      const { error } = await supabase
        .from('locations')
        .insert({
          name: data.name,
          address: data.address,
          description: data.description || null,
          client_id: clients[0].id,
          client_type: data.client_type as "residencial" | "comercial" | "industria", // Usar o tipo selecionado pelo usuário
          active: true,
        });

      if (error) {
        console.error('Erro ao criar local:', error);
        throw error;
      }

      console.log('Local criado com sucesso');

      toast({
        title: "Sucesso",
        description: "Local criado com sucesso.",
      });

      form.reset();
      onSuccess();
      onClose();
      
      // Forçar recarga da página para garantir que os dados apareçam
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Selecione o tipo de cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border shadow-md max-h-[200px] overflow-auto z-[100]">
                      {clientTypes.map((type) => (
                        <SelectItem 
                          key={type.value} 
                          value={type.value}
                          className="cursor-pointer hover:bg-accent"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
                disabled={saving}
              >
                {saving ? "Criando..." : "Criar Local"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}