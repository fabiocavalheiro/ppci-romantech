import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { BrandingSection } from "@/components/BrandingSection";

export default function Configuracoes() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
  // Estados para os campos de configuração
  const [config, setConfig] = useState({
    // Frequências de manutenção
    extintorFreq: 12,
    hidranteFreq: 6,
    sprinklerFreq: 6,
    brigadistaFreq: 12,
    
    // Alertas de status
    warningDays: 30,
    dangerDays: 7,
    expiredDays: 0,
    
    // Notificações
    emailVencidas: true,
    notificacoesPush: true,
    relatoriosSemanais: false,
    
    // Aparência
    tema: "system",
    idioma: "pt-br"
  });
  
  const [saving, setSaving] = useState(false);
  
  // Carregar configurações salvas ao montar o componente
  useEffect(() => {
    const savedConfig = localStorage.getItem('configuracoes');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);
  
  const handleSave = async () => {
    setSaving(true);
    try {
      // Simular salvamento (aqui você pode implementar a integração com banco de dados)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Salvar no localStorage por enquanto
      localStorage.setItem('configuracoes', JSON.stringify(config));
      
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    // Resetar para valores salvos ou padrão
    const savedConfig = localStorage.getItem('configuracoes');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    
    toast({
      title: "Cancelado",
      description: "Alterações descartadas.",
    });
  };
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
            {/* Seção de Branding - Apenas para Admin */}
            {isAdmin() && <BrandingSection />}
            
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
                    <Input 
                      id="extintor-freq" 
                      type="number" 
                      value={config.extintorFreq}
                      onChange={(e) => setConfig({...config, extintorFreq: parseInt(e.target.value) || 12})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hidrante-freq">Frequência Hidrantes (meses)</Label>
                    <Input 
                      id="hidrante-freq" 
                      type="number" 
                      value={config.hidranteFreq}
                      onChange={(e) => setConfig({...config, hidranteFreq: parseInt(e.target.value) || 6})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sprinkler-freq">Frequência Sprinklers (meses)</Label>
                    <Input 
                      id="sprinkler-freq" 
                      type="number" 
                      value={config.sprinklerFreq}
                      onChange={(e) => setConfig({...config, sprinklerFreq: parseInt(e.target.value) || 6})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brigadista-freq">Frequência Treinamento (meses)</Label>
                    <Input 
                      id="brigadista-freq" 
                      type="number" 
                      value={config.brigadistaFreq}
                      onChange={(e) => setConfig({...config, brigadistaFreq: parseInt(e.target.value) || 12})}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Alertas de Status</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="warning-days">Aviso (dias antes)</Label>
                      <Input 
                        id="warning-days" 
                        type="number" 
                        value={config.warningDays}
                        onChange={(e) => setConfig({...config, warningDays: parseInt(e.target.value) || 30})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="danger-days">Crítico (dias antes)</Label>
                      <Input 
                        id="danger-days" 
                        type="number" 
                        value={config.dangerDays}
                        onChange={(e) => setConfig({...config, dangerDays: parseInt(e.target.value) || 7})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expired-days">Vencido (dias após)</Label>
                      <Input 
                        id="expired-days" 
                        type="number" 
                        value={config.expiredDays}
                        onChange={(e) => setConfig({...config, expiredDays: parseInt(e.target.value) || 0})}
                      />
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
                  <Switch 
                    checked={config.emailVencidas}
                    onCheckedChange={(checked) => setConfig({...config, emailVencidas: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificações push</Label>
                    <div className="text-sm text-muted-foreground">
                      Receber notificações no navegador
                    </div>
                  </div>
                  <Switch 
                    checked={config.notificacoesPush}
                    onCheckedChange={(checked) => setConfig({...config, notificacoesPush: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Relatórios semanais</Label>
                    <div className="text-sm text-muted-foreground">
                      Receber relatório semanal por email
                    </div>
                  </div>
                  <Switch 
                    checked={config.relatoriosSemanais}
                    onCheckedChange={(checked) => setConfig({...config, relatoriosSemanais: checked})}
                  />
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
                  <Select 
                    value={config.tema}
                    onValueChange={(value) => setConfig({...config, tema: value})}
                  >
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
                  <Select 
                    value={config.idioma}
                    onValueChange={(value) => setConfig({...config, idioma: value})}
                  >
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
              <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}