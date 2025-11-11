import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { onSnapshot, orderBy, query } from "firebase/firestore";

const DIAS = [
  { value: "dom", label: "Domingo" },
  { value: "seg", label: "Segunda" },
  { value: "ter", label: "Terça" },
  { value: "qua", label: "Quarta" },
  { value: "qui", label: "Quinta" },
  { value: "sex", label: "Sexta" },
  { value: "sab", label: "Sábado" },
] as const;

const TIPOS_ENSAIO = [
  "Regional",
  "Local",
  "Geral por Familia",
  "Geral por Categoria",
  "DARPE",
] as const;

const MESES = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Fev" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Abr" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Ago" },
  { value: 9, label: "Set" },
  { value: 10, label: "Out" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dez" },
] as const;

const ensaioSchema = z.object({
  tipo: z.enum(TIPOS_ENSAIO, { required_error: "Selecione o tipo de ensaio" }),
  semanaDoMes: z.enum(["1", "2", "3", "4", "5"], { required_error: "Selecione a semana" }),
  diaSemana: z.enum(DIAS.map((d) => d.value) as [typeof DIAS[number]["value"], ...string[]], {
    required_error: "Selecione o dia da semana",
  }),
  hora: z.string().regex(/^\d{2}:\d{2}$/g, "Informe o horário (HH:MM)"),
  meses: z.array(z.number().min(1).max(12)).min(1, "Selecione ao menos um mês"),
});

const rjmDiaSchema = z.object({
  dia: z.enum(DIAS.map((d) => d.value) as [typeof DIAS[number]["value"], ...string[]], {
    required_error: "Selecione o dia de RJM",
  }),
  horario: z.string().regex(/^\d{2}:\d{2}$/g, "Informe o horário (HH:MM)"),
});

const schema = z.object({
  codigo: z.string().min(1, "Informe o código da igreja"),
  rua: z.string().min(1, "Informe a rua"),
  numero: z.string().min(1, "Informe o número"),
  bairro: z.string().min(1, "Informe o bairro"),
  cep: z.string().regex(/^\d{5}-?\d{3}$/g, "Informe um CEP válido"),
  cultosDias: z.array(z.enum(DIAS.map((d) => d.value) as [typeof DIAS[number]["value"], ...string[]])).min(
    1,
    "Selecione ao menos um dia de culto"
  ),
  ensaios: z.array(ensaioSchema).default([]),
  rjm: z.array(rjmDiaSchema).default([]),
});

type FormValues = z.infer<typeof schema>;

export default function Congregacoes() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  type Ensaio = {
    tipo: typeof TIPOS_ENSAIO[number];
    semanaDoMes: "1" | "2" | "3" | "4" | "5";
    diaSemana: typeof DIAS[number]["value"];
    hora: string;
    meses: number[];
  };
  type RJMDiaHorario = { dia: typeof DIAS[number]["value"]; horario: string };
  type CongregacaoItem = {
    id: string;
    codigo: string;
    endereco: { rua: string; numero: string; bairro: string; cep: string };
    cultosDias: Array<typeof DIAS[number]["value"]>;
    ensaios: Ensaio[];
    rjm: RJMDiaHorario[];
  };
  const [items, setItems] = useState<CongregacaoItem[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      codigo: "",
      rua: "",
      numero: "",
      bairro: "",
      cep: "",
      cultosDias: [],
      ensaios: [],
      rjm: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "ensaios" });
  const { fields: rjmFields, append: appendRjm, remove: removeRjm } = useFieldArray({ control: form.control, name: "rjm" });

  const addEnsaio = () => {
    const primeiroDiaCulto = form.getValues("cultosDias")[0] ?? "dom";
    append({ tipo: "Local", semanaDoMes: "1", diaSemana: primeiroDiaCulto, hora: "19:00", meses: [1] });
  };

  const addRJM = () => {
    const primeiroDiaCulto = form.getValues("cultosDias")[0] ?? "dom";
    appendRjm({ dia: primeiroDiaCulto, horario: "19:30" });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const ref = await addDoc(collection(db, "congregacoes"), {
        codigo: values.codigo,
        endereco: {
          rua: values.rua,
          numero: values.numero,
          bairro: values.bairro,
          cep: values.cep,
        },
        cultosDias: values.cultosDias,
        ensaios: values.ensaios,
        rjm: values.rjm,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Congregação cadastrada", description: `ID: ${ref.id} • Código ${values.codigo}` });
      form.reset();
      setShowForm(false);
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível cadastrar a congregação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const q = query(collection(db, "congregacoes"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows: CongregacaoItem[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        const enderecoRaw = data["endereco"] as Record<string, unknown> | undefined;
        const codigo = typeof data["codigo"] === "string" ? (data["codigo"] as string) : d.id;
        const endereco = {
          rua: typeof enderecoRaw?.["rua"] === "string" ? (enderecoRaw?.["rua"] as string) : "",
          numero: typeof enderecoRaw?.["numero"] === "string" ? (enderecoRaw?.["numero"] as string) : "",
          bairro: typeof enderecoRaw?.["bairro"] === "string" ? (enderecoRaw?.["bairro"] as string) : "",
          cep: typeof enderecoRaw?.["cep"] === "string" ? (enderecoRaw?.["cep"] as string) : "",
        };
        const cultosDiasRaw = Array.isArray(data["cultosDias"]) ? (data["cultosDias"] as unknown[]) : [];
        const cultosDias = cultosDiasRaw.filter((v): v is typeof DIAS[number]["value"] =>
          typeof v === "string" && DIAS.some((d) => d.value === v)
        );
        const ensaiosRaw = Array.isArray(data["ensaios"]) ? (data["ensaios"] as unknown[]) : [];
        const ensaios: Ensaio[] = ensaiosRaw
          .map((e) => (typeof e === "object" && e ? (e as Record<string, unknown>) : undefined))
          .filter(Boolean)
          .map((e) => ({
            tipo:
              typeof e!["tipo"] === "string" && (TIPOS_ENSAIO as readonly string[]).includes(e!["tipo"]) 
                ? (e!["tipo"] as typeof TIPOS_ENSAIO[number])
                : "Local",
            semanaDoMes: ["1", "2", "3", "4", "5"].includes(String(e!["semanaDoMes"]))
              ? (String(e!["semanaDoMes"]) as "1" | "2" | "3" | "4" | "5")
              : "1",
            diaSemana: DIAS.some((d) => d.value === e!["diaSemana"]) ? (e!["diaSemana"] as typeof DIAS[number]["value"]) : "dom",
            hora: typeof e!["hora"] === "string" && /^\d{2}:\d{2}$/.test(e!["hora"]) ? (e!["hora"] as string) : "19:00",
            meses: Array.isArray(e!["meses"]) ? (e!["meses"] as unknown[]).filter((m): m is number => typeof m === "number") : [],
          }));
        const rjmRaw = Array.isArray(data["rjm"]) ? (data["rjm"] as unknown[]) : [];
        const rjm: RJMDiaHorario[] = rjmRaw
          .map((r) => (typeof r === "object" && r ? (r as Record<string, unknown>) : undefined))
          .filter(Boolean)
          .map((r) => ({
            dia: DIAS.some((d) => d.value === r!["dia"]) ? (r!["dia"] as typeof DIAS[number]["value"]) : "dom",
            horario: typeof r!["horario"] === "string" && /^\d{2}:\d{2}$/.test(r!["horario"]) ? (r!["horario"] as string) : "19:30",
          }));
        return { id: d.id, codigo, endereco, cultosDias, ensaios, rjm };
      });
      setItems(rows);
    });
    return () => unsub();
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Congregações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as congregações
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Nova Congregação
        </Button>
      </div>
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar congregação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="codigo">Código da igreja</Label>
                  <Input id="codigo" placeholder="Ex.: 001" {...form.register("codigo")} />
                  {form.formState.errors.codigo && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.codigo.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" placeholder="00000-000" {...form.register("cep")} />
                  {form.formState.errors.cep && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.cep.message}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rua">Rua</Label>
                  <Input id="rua" {...form.register("rua")} />
                  {form.formState.errors.rua && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.rua.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" {...form.register("numero")} />
                  {form.formState.errors.numero && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.numero.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" {...form.register("bairro")} />
                  {form.formState.errors.bairro && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.bairro.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dias de Cultos</Label>
                <Controller
                  control={form.control}
                  name="cultosDias"
                  render={({ field }) => (
                    <div className="grid sm:grid-cols-4 gap-2">
                      {DIAS.map((d) => {
                        const checked = field.value.includes(d.value);
                        return (
                          <label key={d.value} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = new Set(field.value);
                                if (e.target.checked) next.add(d.value);
                                else next.delete(d.value);
                                field.onChange(Array.from(next));
                              }}
                            />
                            <span>{d.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
                {form.formState.errors.cultosDias && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.cultosDias.message as string}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>RJM • Dias e horários</Label>
                  <Button type="button" variant="outline" onClick={addRJM}>Adicionar RJM</Button>
                </div>

                {rjmFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum dia/horário de RJM adicionado.</p>
                )}

                {rjmFields.map((fieldItem, idx) => (
                  <div key={fieldItem.id} className="border rounded-md p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">RJM #{idx + 1}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeRjm(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Dia da semana</Label>
                        <Controller
                          control={form.control}
                          name={`rjm.${idx}.dia` as const}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {DIAS.map((d) => (
                                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Horário</Label>
                        <Input type="time" {...form.register(`rjm.${idx}.horario` as const)} />
                        {form.formState.errors.rjm?.[idx]?.horario && (
                          <p className="text-sm text-destructive mt-1">{(form.formState.errors.rjm?.[idx]?.horario as { message?: string })?.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ensaios</Label>
                  <Button type="button" variant="outline" onClick={addEnsaio}>Adicionar Ensaio</Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum ensaio adicionado.</p>
                )}

                {fields.map((fieldItem, idx) => (
                  <div key={fieldItem.id} className="border rounded-md p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ensaio #{idx + 1}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-4 gap-4">
                      <div className="grid gap-2">
                        <Label>Tipo</Label>
                        <Controller
                          control={form.control}
                          name={`ensaios.${idx}.tipo` as const}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIPOS_ENSAIO.map((t) => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Semana do mês</Label>
                        <Controller
                          control={form.control}
                          name={`ensaios.${idx}.semanaDoMes` as const}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {(["1", "2", "3", "4", "5"] as const).map((s) => (
                                  <SelectItem key={s} value={s}>{s}ª</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Dia da semana</Label>
                        <Controller
                          control={form.control}
                          name={`ensaios.${idx}.diaSemana` as const}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {DIAS.map((d) => (
                                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Horário</Label>
                        <Input type="time" {...form.register(`ensaios.${idx}.hora` as const)} />
                        {form.formState.errors.ensaios?.[idx]?.hora && (
                          <p className="text-sm text-destructive mt-1">{(form.formState.errors.ensaios?.[idx]?.hora as { message?: string })?.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Meses</Label>
                      <Controller
                        control={form.control}
                        name={`ensaios.${idx}.meses` as const}
                        render={({ field }) => (
                          <div className="grid sm:grid-cols-6 gap-2">
                            {MESES.map((m) => {
                              const checked = field.value?.includes(m.value) ?? false;
                              return (
                                <label key={m.value} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      const next = new Set(field.value ?? []);
                                      if (e.target.checked) next.add(m.value);
                                      else next.delete(m.value);
                                      field.onChange(Array.from(next));
                                    }}
                                  />
                                  <span>{m.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={!form.formState.isValid}>Cadastrar</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma congregação cadastrada ainda.
            </div>
          ) : (
            items.map((c) => (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Congregação • Código {c.codigo}</span>
                    <span className="text-sm text-muted-foreground">ID: {c.id}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Endereço</span>
                      <div>
                        {c.endereco.rua}, {c.endereco.numero} • {c.endereco.bairro}
                        {c.endereco.cep ? ` • CEP ${c.endereco.cep}` : ""}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dias de Cultos</span>
                      <div>
                        {c.cultosDias.length
                          ? c.cultosDias
                              .map((v) => DIAS.find((d) => d.value === v)?.label ?? v)
                              .join(", ")
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ensaios</span>
                      <div>
                        {c.ensaios.length ? `${c.ensaios.length} cadastrados` : "Nenhum"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">RJM</span>
                      <div>
                        {c.rjm && c.rjm.length
                          ? c.rjm
                              .map((r) => `${DIAS.find((d) => d.value === r.dia)?.label ?? r.dia} • ${r.horario}`)
                              .join(", ")
                          : "Nenhum"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
