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
  client_id: z.string().min(1, "Cliente é obrigatório"),
  client_type: z.string().min(1, "Tipo de cliente é obrigatório"),
});

type LocalFormData = z.infer<typeof localSchema>;

interface Cliente {
  id: string;
  name: string;
}

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
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const form = useForm<LocalFormData>({
    resolver: zodResolver(localSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      client_id: "",
      client_type: "",
    },
  });

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("id, name")
          .eq("active", true)
          .order("name", { ascending: true });

        if (error) throw error;
        setClientes(data || []);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os clientes.",
          variant: "destructive",
        });
      }
    };

    if (isOpen) {
      fetchClientes();
    }
  }, [isOpen]);

  const onSubmit = async (data: LocalFormData) => {
    setSaving(true);
    try {
      console.log('Criando local com dados:', data);

      const { error } = await supabase
        .from('locations')
        .insert({
          name: data.name,
          address: data.address,
          description: data.description || null,
          client_id: data.client_id,
          client_type: data.client_type as "residencial" | "comercial" | "industria",
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
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border shadow-md max-h-[200px] overflow-auto z-[100]">
                      {clientes.map((cliente) => (
                        <SelectItem 
                          key={cliente.id} 
                          value={cliente.id}
                          className="cursor-pointer hover:bg-accent"
                        >
                          {cliente.name}
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
              name="client_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cliente *</FormLabel>
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