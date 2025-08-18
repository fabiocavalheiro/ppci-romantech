import { Layout } from "@/components/layout/Layout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function Calendario() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
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
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Atividades Programadas</CardTitle>
              <CardDescription>
                {date ? `Atividades para ${date.toLocaleDateString('pt-BR')}` : 'Selecione uma data'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-2 h-8 bg-primary rounded"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Manutenção Preventiva - Extintores</h4>
                    <p className="text-sm text-muted-foreground">Local: Edifício Principal - Andar 2</p>
                    <p className="text-xs text-muted-foreground">09:00 - 11:00</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-2 h-8 bg-warning rounded"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Teste de Hidrantes</h4>
                    <p className="text-sm text-muted-foreground">Local: Estacionamento</p>
                    <p className="text-xs text-muted-foreground">14:00 - 16:00</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-2 h-8 bg-success rounded"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Treinamento de Brigadistas</h4>
                    <p className="text-sm text-muted-foreground">Local: Auditório</p>
                    <p className="text-xs text-muted-foreground">16:30 - 18:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}