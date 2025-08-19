import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface LocalExtintores {
  local_id: string;
  local_name: string;
  local_address: string;
  extintores: {
    id: string;
    numero: number;
    tipo: string;
    status: string;
    ultima_inspecao?: string;
    proxima_inspecao?: string;
  }[];
}

interface ExtintoresStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'warning' | 'danger' | null;
  title: string;
}

export function ExtintoresStatusDialog({
  isOpen,
  onClose,
  status,
  title,
}: ExtintoresStatusDialogProps) {
  const [locaisExtintores, setLocaisExtintores] = useState<LocalExtintores[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && status) {
      loadLocaisComExtintores();
    }
  }, [isOpen, status]);

  const loadLocaisComExtintores = async () => {
    if (!status) return;
    
    setLoading(true);
    try {
      // Buscar extintores com o status específico e seus locais
      let statusFilter: ('warning' | 'danger' | 'expired' | 'ok')[];
      
      if (status === 'warning') {
        statusFilter = ['warning'];
      } else {
        statusFilter = ['danger', 'expired'];
      }

      const { data, error } = await supabase
        .from('extintores')
        .select(`
          id,
          numero,
          tipo,
          status,
          ultima_inspecao,
          proxima_inspecao,
          local_id,
          locations:local_id (
            id,
            name,
            address
          )
        `)
        .in('status', statusFilter)
        .order('numero');

      if (error) throw error;

      // Agrupar por local
      const locaisMap = new Map<string, LocalExtintores>();
      
      data.forEach(extintor => {
        const localId = extintor.local_id;
        const local = extintor.locations as any;
        
        if (!locaisMap.has(localId)) {
          locaisMap.set(localId, {
            local_id: localId,
            local_name: local?.name || 'Local não encontrado',
            local_address: local?.address || '',
            extintores: []
          });
        }
        
        locaisMap.get(localId)?.extintores.push({
          id: extintor.id,
          numero: extintor.numero,
          tipo: extintor.tipo,
          status: extintor.status,
          ultima_inspecao: extintor.ultima_inspecao,
          proxima_inspecao: extintor.proxima_inspecao,
        });
      });

      setLocaisExtintores(Array.from(locaisMap.values()));
    } catch (error) {
      console.error('Erro ao carregar locais com extintores:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar locais com extintores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-status-ok" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-status-warning" />;
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-status-danger" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-status-danger" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok': return 'Em dia';
      case 'warning': return 'A vencer';
      case 'danger': return 'Vencido';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  const totalExtintores = locaisExtintores.reduce((total, local) => total + local.extintores.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status === 'warning' ? (
              <Clock className="h-5 w-5 text-status-warning" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-status-danger" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>
            {totalExtintores} extintor{totalExtintores !== 1 ? 'es' : ''} encontrado{totalExtintores !== 1 ? 's' : ''} em {locaisExtintores.length} local{locaisExtintores.length !== 1 ? 'is' : ''}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : locaisExtintores.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum extintor encontrado com este status.
          </div>
        ) : (
          <div className="space-y-6">
            {locaisExtintores.map((local) => (
              <div key={local.local_id} className="border rounded-lg p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{local.local_name}</h3>
                  <p className="text-sm text-muted-foreground">{local.local_address}</p>
                  <Badge variant="secondary" className="mt-2">
                    {local.extintores.length} extintor{local.extintores.length !== 1 ? 'es' : ''}
                  </Badge>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Nº</TableHead>
                      <TableHead className="w-20">Tipo</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead>Última Inspeção</TableHead>
                      <TableHead>Próxima Inspeção</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {local.extintores.map((extintor) => (
                      <TableRow key={extintor.id}>
                        <TableCell className="font-medium">
                          {extintor.numero}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{extintor.tipo}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(extintor.status)}
                            <span className="text-sm">
                              {getStatusText(extintor.status)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {extintor.ultima_inspecao 
                            ? new Date(extintor.ultima_inspecao).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {extintor.proxima_inspecao 
                            ? new Date(extintor.proxima_inspecao).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}