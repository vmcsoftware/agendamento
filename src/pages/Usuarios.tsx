import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Usuarios() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>
      <div className="text-center py-12 text-muted-foreground">
        Em desenvolvimento...
      </div>
    </div>
  );
}
