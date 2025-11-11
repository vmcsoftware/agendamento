import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;

const schema = z.object({
  nome: z.string().min(2, "Informe o nome da cidade"),
  uf: z
    .string()
    .refine((v) => UFS.includes(v as (typeof UFS)[number]), { message: "Selecione uma UF válida" }),
});

type FormValues = z.infer<typeof schema>;

export default function Cidades() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { nome: "", uf: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const ref = await addDoc(collection(db, "cidades"), {
        nome: values.nome,
        uf: values.uf,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Cidade cadastrada",
        description: `ID: ${ref.id} • ${values.nome}/${values.uf}`,
      });
      form.reset();
      setShowForm(false);
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível cadastrar a cidade. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cidades</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as cidades cadastradas
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Nova Cidade
        </Button>
      </div>
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar cidade</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Cidade</Label>
                <Input id="nome" placeholder="Ex.: São Paulo" {...form.register("nome")} />
                {form.formState.errors.nome && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.nome.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>UF</Label>
                <Controller
                  control={form.control}
                  name="uf"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {UFS.map((uf) => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.uf && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.uf.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={!form.formState.isValid}>Cadastrar</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Clique em "Nova Cidade" para cadastrar uma cidade e UF.
        </div>
      )}
    </div>
  );
}
