import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
      const { data, error } = await supabase
        .from("activities")
        .select(`
          id,
          title,
          description,
          start_time,
          end_time,
          status,
          location_id,
          locations (
            name,
            address
          )
        `)
        .eq("scheduled_date", dateStr)
        .order("start_time");

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
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
    <ProtectedRoute>
      <Layout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Calendário</h2>
              <p className="text-muted-foreground">
                Agenda de manutenções e atividades
              </p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Selecionar Data</CardTitle>
                <CardDescription>
                  Clique em uma data para ver as atividades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
              {isAdmin() && (
                <div className="p-6 pt-0">
                  <NovaAtividadeDialog 
                    selectedDate={date} 
                    onActivityCreated={fetchActivities}
                  />
                </div>
              )}
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Atividades Programadas</CardTitle>
                <CardDescription>
                  {date ? `Atividades para ${date.toLocaleDateString('pt-BR')}` : 'Selecione uma data'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className={`w-2 h-8 ${getStatusColor(activity.status)} rounded flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{activity.title}</h4>
                            <Badge variant="secondary" className="ml-2">
                              {getStatusLabel(activity.status)}
                            </Badge>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{activity.locations?.name} - {activity.locations?.address}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{activity.start_time} - {activity.end_time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {date ? 'Nenhuma atividade programada para este dia' : 'Selecione uma data para ver as atividades'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}