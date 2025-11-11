import { Plus, Search, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const eventos = [
  {
    id: 1,
    title: "Culto de Quarta-feira",
    date: "2025-11-12",
    time: "19:30",
    location: "Congregação Central",
    city: "São Paulo",
    type: "Culto",
    status: "confirmado",
    participants: 120
  },
  {
    id: 2,
    title: "Ensino Bíblico",
    date: "2025-11-13",
    time: "14:00",
    location: "Congregação Vila Nova",
    city: "São Paulo",
    type: "Ensino",
    status: "pendente",
    participants: 45
  },
  {
    id: 3,
    title: "Culto de Domingo",
    date: "2025-11-14",
    time: "09:30",
    location: "Congregação Central",
    city: "São Paulo",
    type: "Culto",
    status: "confirmado",
    participants: 200
  },
  {
    id: 4,
    title: "Reunião de Jovens",
    date: "2025-11-15",
    time: "15:00",
    location: "Congregação Jardim América",
    city: "São Paulo",
    type: "Reunião",
    status: "confirmado",
    participants: 80
  },
];

export default function Eventos() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os eventos da CCB
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filtros</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {eventos.map((evento) => (
          <Card key={evento.id} className="hover:shadow-md transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{evento.title}</CardTitle>
                  <Badge variant="outline" className="mt-2">
                    {evento.type}
                  </Badge>
                </div>
                <Badge variant={evento.status === "confirmado" ? "default" : "secondary"}>
                  {evento.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(evento.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{evento.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{evento.location}, {evento.city}</span>
              </div>
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {evento.participants} participantes
                </span>
                <Button variant="ghost" size="sm">
                  Ver detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
