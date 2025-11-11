import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

const schema = z.object({
  congregacao: z.string().min(1, "Selecione a congregação"),
  data: z.string().min(1, "Informe a data"),
  hora: z.string().min(1, "Informe o horário"),
});

type FormValues = z.infer<typeof schema>;

export default function MarcacaoColetas() {
  const { toast } = useToast();
  const [congregacoes, setCongregacoes] = useState<string[]>([
    "Congregação Central",
    "Congregação Vila Nova",
    "Congregação Jardim América",
  ]);

  useEffect(() => {
    getDocs(collection(db, "congregacoes"))
      .then((snap) => {
        const nomes = snap.docs.map((d) => {
          const data = d.data();
          const nomeField = (data as Record<string, unknown>)["nome"];
          return typeof nomeField === "string" ? nomeField : d.id;
        });
        if (nomes.length) setCongregacoes(nomes);
      })
      .catch(() => {
        // Se a coleção não existir ainda, mantém valores padrão.
      });
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { congregacao: "", data: "", hora: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const ref = await addDoc(collection(db, "marcacoes"), {
        tipo: "coleta",
        congregacao: values.congregacao,
        data: values.data,
        hora: values.hora,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Marcação de Coleta criada",
        description: `ID: ${ref.id} | ${values.congregacao} • ${values.data} ${values.hora}`,
      });
      form.reset();
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a marcação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marcação de Coletas</h1>
        <p className="text-muted-foreground mt-1">Cadastre coletas informando congregação, data e horário.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova marcação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label>Congregação</Label>
              <Controller
                control={form.control}
                name="congregacao"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma congregação" />
                    </SelectTrigger>
                    <SelectContent>
                      {congregacoes.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.congregacao && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.congregacao.message}
                </p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="data">Data</Label>
                <Input id="data" type="date" {...form.register("data")} />
                {form.formState.errors.data && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.data.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hora">Horário</Label>
                <Input id="hora" type="time" {...form.register("hora")} />
                {form.formState.errors.hora && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.hora.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={!form.formState.isValid}>Agendar Coleta</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}