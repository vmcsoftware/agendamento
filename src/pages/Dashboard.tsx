import { Calendar, Users, Church, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentEvents = [
  {
    id: 1,
    title: "Culto de Quarta-feira",
    date: "2025-11-12",
    time: "19:30",
    congregation: "Congregação Central",
    status: "confirmado"
  },
  {
    id: 2,
    title: "Ensino Bíblico",
    date: "2025-11-13",
    time: "14:00",
    congregation: "Congregação Vila Nova",
    status: "pendente"
  },
  {
    id: 3,
    title: "Culto de Domingo",
    date: "2025-11-14",
    time: "09:30",
    congregation: "Congregação Central",
    status: "confirmado"
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral dos eventos e atividades da CCB
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Eventos Agendados"
          value={24}
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Pessoas Cadastradas"
          value={156}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Congregações"
          value={8}
          icon={Church}
          description="Ativas no sistema"
        />
        <StatCard
          title="Serviços Marcados"
          value={42}
          icon={CheckCircle}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Eventos programados para esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <Badge variant={event.status === "confirmado" ? "default" : "secondary"}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.congregation}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas atualizações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo evento cadastrado</p>
                  <p className="text-xs text-muted-foreground">Culto de Quarta-feira - Há 2 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-accent mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Pessoa adicionada</p>
                  <p className="text-xs text-muted-foreground">João Silva - Há 3 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Serviço confirmado</p>
                  <p className="text-xs text-muted-foreground">Maria Santos confirmou participação - Há 5 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
