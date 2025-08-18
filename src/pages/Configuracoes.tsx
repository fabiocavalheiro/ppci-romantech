import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Configuracoes() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
              <p className="text-muted-foreground">
                Configurações gerais do sistema
              </p>
            </div>
          </div>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Manutenção</CardTitle>
                <CardDescription>
                  Configure os parâmetros padrão para manutenções
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="extintor-freq">Frequência Extintores (meses)</Label>
                    <Input id="extintor-freq" type="number" defaultValue="12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hidrante-freq">Frequência Hidrantes (meses)</Label>
                    <Input id="hidrante-freq" type="number" defaultValue="6" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sprinkler-freq">Frequência Sprinklers (meses)</Label>
                    <Input id="sprinkler-freq" type="number" defaultValue="6" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brigadista-freq">Frequência Treinamento (meses)</Label>
                    <Input id="brigadista-freq" type="number" defaultValue="12" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Alertas de Status</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="warning-days">Aviso (dias antes)</Label>
                      <Input id="warning-days" type="number" defaultValue="30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="danger-days">Crítico (dias antes)</Label>
                      <Input id="danger-days" type="number" defaultValue="7" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expired-days">Vencido (dias após)</Label>
                      <Input id="expired-days" type="number" defaultValue="0" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Configure as notificações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email de manutenções vencidas</Label>
                    <div className="text-sm text-muted-foreground">
                      Receber emails sobre equipamentos com manutenção vencida
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificações push</Label>
                    <div className="text-sm text-muted-foreground">
                      Receber notificações no navegador
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Relatórios semanais</Label>
                    <div className="text-sm text-muted-foreground">
                      Receber relatório semanal por email
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select defaultValue="system">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select defaultValue="pt-br">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Salvar Configurações</Button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}