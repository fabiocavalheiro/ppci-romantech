import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Location {
  id: string;
  name: string;
  address: string;
}

interface NovaAtividadeDialogProps {
  selectedDate: Date | undefined;
  onActivityCreated: () => void;
}

interface FormData {
  title: string;
  description: string;
  location_id: string;
  start_time: string;
  end_time: string;
}

export function NovaAtividadeDialog({ selectedDate, onActivityCreated }: NovaAtividadeDialogProps) {
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      location_id: "",
      start_time: "",
      end_time: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchLocations();
    }
  }, [open]);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, address")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error("Erro ao buscar locais:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os locais",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedDate) {
      toast({
        title: "Erro",
        description: "Selecione uma data no calendário",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("activities")
        .insert({
          title: data.title,
          description: data.description,
          location_id: data.location_id,
          scheduled_date: selectedDate.toISOString().split('T')[0],
          start_time: data.start_time,
          end_time: data.end_time,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Atividade criada com sucesso",
      });

      form.reset();
      setOpen(false);
      onActivityCreated();
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a atividade",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Nova Atividade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Nova Atividade
          </DialogTitle>
          <DialogDescription>
            {selectedDate 
              ? `Criar atividade para ${selectedDate.toLocaleDateString('pt-BR')}`
              : "Selecione uma data no calendário primeiro"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Título é obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Manutenção Preventiva - Extintores" {...field} />
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
                      placeholder="Descreva os detalhes da atividade..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_id"
              rules={{ required: "Local é obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um local" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} - {location.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                rules={{ required: "Horário de início é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                rules={{ required: "Horário de fim é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Fim</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !selectedDate}>
                {loading ? "Criando..." : "Criar Atividade"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}