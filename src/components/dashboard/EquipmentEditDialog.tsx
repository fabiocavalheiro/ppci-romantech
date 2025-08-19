import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface StatusCount {
  ok: number;
  warning: number;
  danger: number;
}

interface EquipmentData {
  title: string;
  counts: StatusCount;
  total: number;
}

interface EquipmentEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentData: EquipmentData;
  onSave: (data: EquipmentData) => void;
}

const formSchema = z.object({
  total: z.number().min(1, "Total deve ser maior que 0"),
  ok: z.number().min(0, "Valor deve ser maior ou igual a 0"),
  warning: z.number().min(0, "Valor deve ser maior ou igual a 0"),
  danger: z.number().min(0, "Valor deve ser maior ou igual a 0"),
  location: z.string().optional(),
  lastInspection: z.date().optional(),
  nextInspection: z.date().optional(),
  responsible: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EquipmentEditDialog({
  isOpen,
  onClose,
  equipmentData,
  onSave,
}: EquipmentEditDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      total: equipmentData.total,
      ok: equipmentData.counts.ok,
      warning: equipmentData.counts.warning,
      danger: equipmentData.counts.danger,
      location: "",
      responsible: "",
      notes: "",
    },
  });

  const onSubmit = (data: FormData) => {
    // Validar se os valores somam corretamente
    const sum = data.ok + data.warning + data.danger;
    if (sum !== data.total) {
      toast({
        title: "Erro de validação",
        description: `A soma dos valores (${sum}) deve ser igual ao total (${data.total})`,
        variant: "destructive",
      });
      return;
    }

    const updatedData: EquipmentData = {
      title: equipmentData.title,
      total: data.total,
      counts: {
        ok: data.ok,
        warning: data.warning,
        danger: data.danger,
      },
    };

    onSave(updatedData);
    toast({
      title: "Dados atualizados",
      description: `${equipmentData.title} foi atualizado com sucesso.`,
    });
    onClose();
  };

  const getEquipmentFields = () => {
    const title = equipmentData.title.toLowerCase();
    
    if (title.includes("extintor")) {
      return {
        locationLabel: "Localização",
        responsibleLabel: "Responsável pela manutenção",
        additionalFields: (
          <>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Andar 1 - Corredor A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ),
      };
    }

    if (title.includes("hidrante")) {
      return {
        locationLabel: "Localização do hidrante",
        responsibleLabel: "Responsável pela manutenção",
        additionalFields: (
          <>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Subsolo - Garagem" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ),
      };
    }

    if (title.includes("brigadista")) {
      return {
        locationLabel: "Setor de atuação",
        responsibleLabel: "Coordenador da brigada",
        additionalFields: (
          <>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Administração, Produção" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ),
      };
    }

    // Campos padrão para outros equipamentos
    return {
      locationLabel: "Localização",
      responsibleLabel: "Responsável",
      additionalFields: (
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Localização</FormLabel>
              <FormControl>
                <Input placeholder="Localização do equipamento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ),
    };
  };

  const fields = getEquipmentFields();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar {equipmentData.title}</DialogTitle>
          <DialogDescription>
            Atualize os dados de {equipmentData.title.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-status-ok"></div>
                      Em dia
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="warning"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-status-warning"></div>
                      A vencer
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="danger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-status-danger"></div>
                      Vencidos
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {fields.additionalFields}

            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fields.responsibleLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lastInspection"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Última inspeção</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecionar data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextInspection"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Próxima inspeção</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecionar data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações sobre o equipamento..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar alterações
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}