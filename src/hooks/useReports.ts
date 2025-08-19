import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  clientId?: string;
  locationId?: string;
  status?: 'all' | 'ok' | 'warning' | 'danger';
  equipmentType?: 'all' | 'extintores' | 'hidrantes' | 'sprinklers' | 'alarmes' | 'iluminacao';
}

export interface ReportData {
  id: string;
  equipment_type: string;
  equipment_number: string;
  client_name: string;
  location_name: string;
  location_address: string;
  status: string;
  last_maintenance: string | null;
  next_maintenance: string | null;
  responsible: string | null;
  observations: string | null;
}

export const useReports = () => {
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string; client_id: string }>>([]);
  const { toast } = useToast();
  const { hasRole } = useAuth();

  const fetchClients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchLocations = useCallback(async (clientId?: string) => {
    try {
      let query = supabase
        .from('locations')
        .select('id, name, client_id')
        .eq('active', true);

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar locais",
        variant: "destructive",
      });
    }
  }, [toast]);

  const generateReport = useCallback(async (filters: ReportFilters) => {
    if (!filters.startDate || !filters.endDate) {
      toast({
        title: "Erro",
        description: "Data inicial e final são obrigatórias",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Buscar dados de extintores
      let query = supabase
        .from('extintores')
        .select(`
          id,
          numero,
          tipo,
          status,
          ultima_inspecao,
          proxima_inspecao,
          responsavel_manutencao,
          observacoes,
          locations:local_id (
            id,
            name,
            address,
            clients:client_id (
              id,
              name
            )
          )
        `);

      // Aplicar filtros de data
      const startDateStr = filters.startDate.toISOString().split('T')[0];
      const endDateStr = filters.endDate.toISOString().split('T')[0];

      query = query.or(
        `ultima_inspecao.gte.${startDateStr},ultima_inspecao.lte.${endDateStr},proxima_inspecao.gte.${startDateStr},proxima_inspecao.lte.${endDateStr}`
      );

      // Aplicar filtros adicionais
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.locationId) {
        query = query.eq('local_id', filters.locationId);
      } else if (filters.clientId) {
        // Se cliente específico, filtrar por locais desse cliente
        const { data: clientLocations } = await supabase
          .from('locations')
          .select('id')
          .eq('client_id', filters.clientId);
        
        if (clientLocations) {
          const locationIds = clientLocations.map(l => l.id);
          if (locationIds.length > 0) {
            query = query.in('local_id', locationIds);
          }
        }
      }

      const { data: extintoresData, error } = await query;

      if (error) throw error;

      // Transformar dados para formato padrão
      const reportData: ReportData[] = (extintoresData || []).map(item => ({
        id: item.id,
        equipment_type: 'Extintor',
        equipment_number: `${item.tipo}-${item.numero}`,
        client_name: (item.locations as any)?.clients?.name || '',
        location_name: (item.locations as any)?.name || '',
        location_address: (item.locations as any)?.address || '',
        status: item.status,
        last_maintenance: item.ultima_inspecao,
        next_maintenance: item.proxima_inspecao,
        responsible: item.responsavel_manutencao,
        observations: item.observacoes,
      }));

      setData(reportData);
      toast({
        title: "Sucesso",
        description: `Relatório gerado com ${reportData.length} registros`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const exportCSV = useCallback((filters: ReportFilters) => {
    if (!data.length) {
      toast({
        title: "Erro",
        description: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      'Cliente',
      'Local',
      'Endereço',
      'Tipo de Equipamento',
      'Número',
      'Status',
      'Última Inspeção',
      'Próxima Inspeção',
      'Responsável',
      'Observações'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        `"${row.client_name}"`,
        `"${row.location_name}"`,
        `"${row.location_address}"`,
        `"${row.equipment_type}"`,
        `"${row.equipment_number}"`,
        `"${row.status}"`,
        `"${row.last_maintenance || ''}"`,
        `"${row.next_maintenance || ''}"`,
        `"${row.responsible || ''}"`,
        `"${row.observations || ''}"`
      ].join(','))
    ].join('\n');

    const startDate = filters.startDate?.toISOString().split('T')[0] || '';
    const endDate = filters.endDate?.toISOString().split('T')[0] || '';
    const filename = `relatorio-ppci-${startDate}_a_${endDate}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Sucesso",
      description: "CSV exportado com sucesso",
    });
  }, [data, toast]);

  const exportPDF = useCallback(async (filters: ReportFilters) => {
    if (!data.length) {
      toast({
        title: "Erro",
        description: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    try {
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF();
      
      // Configurar fonte para suportar caracteres especiais
      doc.setFont('helvetica');
      
      const startDate = filters.startDate?.toLocaleDateString('pt-BR') || '';
      const endDate = filters.endDate?.toLocaleDateString('pt-BR') || '';
      
      // Cabeçalho
      doc.setFontSize(16);
      doc.text('Relatório PPCI', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Período: ${startDate} a ${endDate}`, 20, 35);
      doc.text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
      
      // Sumário
      const statusCount = data.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      doc.text('Sumário por Status:', 20, 65);
      let yPos = 75;
      Object.entries(statusCount).forEach(([status, count]) => {
        const statusLabel = status === 'ok' ? 'Em dia' : 
                           status === 'warning' ? 'A vencer' : 
                           status === 'danger' ? 'Vencido' : status;
        doc.text(`${statusLabel}: ${count}`, 25, yPos);
        yPos += 10;
      });
      
      // Tabela
      const tableData = data.map(row => [
        row.client_name,
        row.location_name,
        row.equipment_type,
        row.equipment_number,
        row.status === 'ok' ? 'Em dia' : 
        row.status === 'warning' ? 'A vencer' : 
        row.status === 'danger' ? 'Vencido' : row.status,
        row.last_maintenance || '-',
        row.next_maintenance || '-',
        row.responsible || '-',
      ]);
      
      (doc as any).autoTable({
        head: [['Cliente', 'Local', 'Tipo', 'Número', 'Status', 'Última Inspeção', 'Próxima Inspeção', 'Responsável']],
        body: tableData,
        startY: yPos + 10,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [233, 112, 58] }, // Cor primária do tema
      });
      
      const filename = `relatorio-ppci-${filters.startDate?.toISOString().split('T')[0]}_a_${filters.endDate?.toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      toast({
        title: "Sucesso",
        description: "PDF exportado com sucesso",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar PDF",
        variant: "destructive",
      });
    }
  }, [data, toast]);

  return {
    data,
    loading,
    clients,
    locations,
    fetchClients,
    fetchLocations,
    generateReport,
    exportCSV,
    exportPDF,
  };
};