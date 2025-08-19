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
  onClick?: () => void;
}

export function StatusCard({ title, icon: Icon, counts, total, onClick }: StatusCardProps) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden hover:shadow-md transition-all duration-200",
        onClick && "cursor-pointer hover:scale-[1.02] hover:border-primary/20"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        <Icon className="h-6 w-6 text-primary flex-shrink-0" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-2xl font-bold text-foreground">{total}</div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Em dia</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-status-ok flex-shrink-0"></div>
              <span className="text-sm font-medium text-status-ok">{counts.ok}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">A vencer</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-status-warning flex-shrink-0"></div>
              <span className="text-sm font-medium text-status-warning">{counts.warning}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Vencidos</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-status-danger flex-shrink-0"></div>
              <span className="text-sm font-medium text-status-danger">{counts.danger}</span>
            </div>
          </div>
        </div>
        
        {/* Status bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full flex">
            <div 
              className="bg-status-ok transition-all duration-300" 
              style={{ width: `${(counts.ok / total) * 100}%` }}
            ></div>
            <div 
              className="bg-status-warning transition-all duration-300" 
              style={{ width: `${(counts.warning / total) * 100}%` }}
            ></div>
            <div 
              className="bg-status-danger transition-all duration-300" 
              style={{ width: `${(counts.danger / total) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}