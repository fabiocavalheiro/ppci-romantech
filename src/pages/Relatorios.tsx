import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Search, FileText, Calendar } from "lucide-react";
import { useReports, type ReportFilters } from "@/hooks/useReports";

export default function Relatorios() {
  const [filters, setFilters] = useState<ReportFilters>({
    status: 'all',
    equipmentType: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data,
    loading,
    clients,
    locations,
    fetchClients,
    fetchLocations,
    generateReport,
    exportCSV,
    exportPDF,
  } = useReports();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (filters.clientId && filters.clientId !== 'all') {
      fetchLocations(filters.clientId);
    } else {
      fetchLocations();
    }
  }, [filters.clientId, fetchLocations]);

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // Limpar local quando cliente mudar
      if (key === 'clientId') {
        newFilters.locationId = undefined;
      }
      return newFilters;
    });
  };

  const handleGenerateReport = () => {
    generateReport(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      equipmentType: 'all',
    });
    setSearchTerm('');
  };

  const isGenerateDisabled = !filters.startDate || !filters.endDate;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ok: { label: 'Em dia', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      warning: { label: 'A vencer', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      danger: { label: 'Vencido', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const, className: '' };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Filtrar dados localmente baseado no termo de busca
  const filteredData = data.filter(item =>
    searchTerm === '' ||
    item.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.equipment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.equipment_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
              <p className="text-muted-foreground">
                Relatórios e análises do sistema PPCI
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => exportCSV(filters)}
                disabled={!data.length}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
              <Button 
                variant="outline"
                onClick={() => exportPDF(filters)}
                disabled={!data.length}
              >
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>
                Configure os filtros para gerar o relatório
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Data inicial *</Label>
                  <DatePicker
                    date={filters.startDate}
                    onSelect={(date) => handleFilterChange('startDate', date)}
                    placeholder="Selecionar data inicial"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Data final *</Label>
                  <DatePicker
                    date={filters.endDate}
                    onSelect={(date) => handleFilterChange('endDate', date)}
                    placeholder="Selecionar data final"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select 
                    value={filters.clientId || "all"} 
                    onValueChange={(value) => handleFilterChange('clientId', value === "all" ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os clientes</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Local</Label>
                  <Select 
                    value={filters.locationId || "all"} 
                    onValueChange={(value) => handleFilterChange('locationId', value === "all" ? undefined : value)}
                    disabled={!filters.clientId || filters.clientId === 'all'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os locais" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os locais</SelectItem>
                      {locations
                        .filter(location => !filters.clientId || filters.clientId === 'all' || location.client_id === filters.clientId)
                        .map(location => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3 mt-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={filters.status || "all"} 
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ok">Em dia</SelectItem>
                      <SelectItem value="warning">A vencer</SelectItem>
                      <SelectItem value="danger">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo de Equipamento</Label>
                  <Select 
                    value={filters.equipmentType || "all"} 
                    onValueChange={(value) => handleFilterChange('equipmentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="extintores">Extintores</SelectItem>
                      <SelectItem value="hidrantes">Hidrantes</SelectItem>
                      <SelectItem value="sprinklers">Sprinklers</SelectItem>
                      <SelectItem value="alarmes">Alarmes</SelectItem>
                      <SelectItem value="iluminacao">Iluminação de Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar por cliente, local, equipamento..." 
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button 
                  onClick={handleGenerateReport}
                  disabled={isGenerateDisabled || loading}
                  className="flex-1 sm:flex-none"
                >
                  {loading ? (
                    <>
                      <Calendar className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Filter className="mr-2 h-4 w-4" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="flex-1 sm:flex-none"
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                Resultados 
                {data.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({filteredData.length} de {data.length} registros)
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {data.length > 0 
                  ? "Lista de equipamentos encontrados com os filtros aplicados"
                  : "Configure os filtros e clique em 'Gerar Relatório' para visualizar os dados"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Última Manutenção</TableHead>
                      <TableHead>Próxima Manutenção</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Responsável</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.client_name}</TableCell>
                        <TableCell>{item.location_name}</TableCell>
                        <TableCell>{item.equipment_number}</TableCell>
                        <TableCell>
                          {item.last_maintenance 
                            ? new Date(item.last_maintenance).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {item.next_maintenance 
                            ? new Date(item.next_maintenance).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell>{item.responsible || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : data.length === 0 && !loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Filter className="mx-auto h-12 w-12 mb-4" />
                  <p>Nenhum dado encontrado</p>
                  <p className="text-sm">Configure os filtros e gere um novo relatório</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="mx-auto h-12 w-12 mb-4" />
                  <p>Nenhum resultado encontrado para "{searchTerm}"</p>
                  <p className="text-sm">Tente ajustar os termos de busca</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}