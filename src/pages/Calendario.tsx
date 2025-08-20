import { Layout } from "@/components/layout/Layout";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NovaAtividadeDialog } from "@/components/calendario/NovaAtividadeDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, MapPin } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
  location_id: string;
  locations: {
    name: string;
    address: string;
  } | null;
}

export default function Calendario() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (date) {
      fetchActivities();
    }
  }, [date]);

  const fetchActivities = async () => {
    if (!date) return;
    
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Buscar atividades
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select(`
          id,
          title,
          description,
          start_time,
          end_time,
          status,
          location_id
        `)
        .eq("scheduled_date", dateStr)
        .order("start_time");

      if (activitiesError) throw activitiesError;

      // Buscar informações dos locais
      const locationIds = activitiesData?.map(activity => activity.location_id) || [];
      const { data: locationsData, error: locationsError } = await supabase
        .from("locations")
        .select("id, name, address")
        .in("id", locationIds);

      if (locationsError) throw locationsError;

      // Combinar dados
      const activitiesWithLocations = activitiesData?.map(activity => {
        const location = locationsData?.find(loc => loc.id === activity.location_id);
        return {
          ...activity,
          locations: location || null
        };
      }) || [];

      setActivities(activitiesWithLocations);
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "in_progress":
        return "bg-warning";
      case "cancelled":
        return "bg-destructive";
      default:
        return "bg-primary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluída";
      case "in_progress":
        return "Em Andamento";
      case "cancelled":
        return "Cancelada";
      default:
        return "Agendada";
    }
  };

  return (
    <Layout>
        <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Calendário</h2>
              <p className="text-muted-foreground">
                Agenda de manutenções e atividades
              </p>
            </div>
          </div>
          
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Selecionar Data</CardTitle>
                <CardDescription>
                  Clique em uma data para ver as atividades
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
              {isAdmin() && (
                <div className="px-6 pb-6">
                  <NovaAtividadeDialog
                    selectedDate={date} 
                    onActivityCreated={fetchActivities}
                  />
                </div>
              )}
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Atividades Programadas</CardTitle>
                <CardDescription className="text-sm">
                  {date ? `Atividades para ${date.toLocaleDateString('pt-BR')}` : 'Selecione uma data'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-2 h-8 ${getStatusColor(activity.status)} rounded flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h4 className="font-semibold text-sm sm:text-base truncate">{activity.title}</h4>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {getStatusLabel(activity.status)}
                            </Badge>
                          </div>
                          {activity.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{activity.locations?.name} - {activity.locations?.address}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span className="whitespace-nowrap">{activity.start_time} - {activity.end_time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    {date ? 'Nenhuma atividade programada para este dia' : 'Selecione uma data para ver as atividades'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
  );
}