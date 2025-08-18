import { Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  type: string;
  location: string;
  technician: string;
  date: string;
  status: "completed" | "pending" | "overdue";
}

const recentActivities: Activity[] = [
  {
    id: "1",
    type: "Extintor - Verificação Trimestral",
    location: "Edifício Central - 1º Andar",
    technician: "João Silva",
    date: "2024-01-15",
    status: "completed"
  },
  {
    id: "2",
    type: "Hidrante - Teste Semestral",
    location: "Galpão Industrial - Setor A",
    technician: "Maria Santos",
    date: "2024-01-18",
    status: "pending"
  },
  {
    id: "3",
    type: "Sprinkler - Manutenção Anual",
    location: "Centro de Distribuição",
    technician: "Carlos Oliveira",
    date: "2024-01-10",
    status: "overdue"
  },
  {
    id: "4",
    type: "Alarme - Verificação Trimestral",
    location: "Escritório Administrativo",
    technician: "Ana Costa",
    date: "2024-01-20",
    status: "completed"
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-status-ok" />;
    case "pending":
      return <Clock className="h-4 w-4 text-status-warning" />;
    case "overdue":
      return <XCircle className="h-4 w-4 text-status-danger" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-status-ok/10 text-status-ok border-status-ok/20">Concluída</Badge>;
    case "pending":
      return <Badge className="bg-status-warning/10 text-status-warning border-status-warning/20">Pendente</Badge>;
    case "overdue":
      return <Badge className="bg-status-danger/10 text-status-danger border-status-danger/20">Atrasada</Badge>;
    default:
      return <Badge variant="secondary">Desconhecido</Badge>;
  }
};

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <span>Atividades Recentes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              {getStatusIcon(activity.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.type}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.location}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {activity.technician} • {new Date(activity.date).toLocaleDateString('pt-BR')}
                  </span>
                  {getStatusBadge(activity.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}