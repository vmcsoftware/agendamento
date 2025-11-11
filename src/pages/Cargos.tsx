import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Cargos() {
  const { toast } = useToast();
  const schema = z.object({
    nome: z.string().min(2, "Informe o nome"),
    tipo: z.enum(["cargo", "ministerio"], { required_error: "Selecione o tipo" }),
  });
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { nome: "" },
  });
  const [departamentos, setDepartamentos] = useState<string[]>([
    "Música",
    "Orquestra",
    "Limpeza",
    "Som",
    "Recepção",
  ]);
  const [selecionados, setSelecionados] = useState<string[]>([]);

  useEffect(() => {
    // Futuro: carregar de Firestore (coleção "departamentos").
    // Mantém os defaults caso não exista.
  }, []);

  function toggleDepartamento(dep: string, checked: boolean) {
    setSelecionados((prev) => {
      if (checked) return [...prev, dep];
      return prev.filter((d) => d !== dep);
    });
  }

  async function handleSubmit(values: FormValues) {
    try {
      const ref = await addDoc(collection(db, "cargos_ministerios"), {
        nome: values.nome,
        tipo: values.tipo,
        departamentos: selecionados,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Cadastro salvo",
        description: `ID: ${ref.id} • ${values.tipo} • ${values.nome}`,
      });
      form.reset();
      setSelecionados([]);
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o cadastro.",
        variant: "destructive",
      });
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cargos e Ministérios</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie cargos e ministérios
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cargo
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Novo cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" placeholder="Ex.: Regente, Diácono" {...form.register("nome")} />
                {form.formState.errors.nome && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.nome.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Controller
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione cargo ou ministério" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cargo">Cargo</SelectItem>
                        <SelectItem value="ministerio">Ministério</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.tipo && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.tipo.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Departamentos</Label>
              <div className="grid sm:grid-cols-3 gap-3">
                {departamentos.map((dep) => (
                  <label key={dep} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selecionados.includes(dep)}
                      onCheckedChange={(checked) => toggleDepartamento(dep, Boolean(checked))}
                    />
                    <span>{dep}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={!form.formState.isValid}>Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
