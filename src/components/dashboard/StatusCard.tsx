import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusCount {
  ok: number;
  warning: number;
  danger: number;
}

interface StatusCardProps {
  title: string;
  icon: LucideIcon;
  counts: StatusCount;
  total: number;
}

export function StatusCard({ title, icon: Icon, counts, total }: StatusCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        <Icon className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-4">{total}</div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Em dia</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-status-ok"></div>
              <span className="text-sm font-medium text-status-ok">{counts.ok}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">A vencer</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-status-warning"></div>
              <span className="text-sm font-medium text-status-warning">{counts.warning}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Vencidos</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-status-danger"></div>
              <span className="text-sm font-medium text-status-danger">{counts.danger}</span>
            </div>
          </div>
        </div>
        
        {/* Status bar */}
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full flex">
            <div 
              className="bg-status-ok" 
              style={{ width: `${(counts.ok / total) * 100}%` }}
            ></div>
            <div 
              className="bg-status-warning" 
              style={{ width: `${(counts.warning / total) * 100}%` }}
            ></div>
            <div 
              className="bg-status-danger" 
              style={{ width: `${(counts.danger / total) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}