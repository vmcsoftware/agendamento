import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query, getDocs } from "firebase/firestore";

type Marcacao = {
  id: string;
  tipo: "coleta" | "servico" | "rjm";
  congregacao: string;
  data: string;
  hora: string;
  createdAt?: unknown;
};

export default function Marcacoes() {
  const [marcacoes, setMarcacoes] = useState<Marcacao[]>([]);
  type TipoFiltro = "todas" | "coleta" | "servico" | "rjm";
  const [tipo, setTipo] = useState<TipoFiltro>("todas");
  const [congregacoes, setCongregacoes] = useState<string[]>([]);
  const [congregacaoFiltro, setCongregacaoFiltro] = useState<string>("todas");

  useEffect(() => {
    const q = query(collection(db, "marcacoes"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items: Marcacao[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Marcacao, "id">) }));
      setMarcacoes(items);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    getDocs(collection(db, "congregacoes"))
      .then((snap) => {
        const nomes = snap.docs.map((d) => {
          const data = d.data();
          const nomeField = (data as Record<string, unknown>)["nome"];
          return typeof nomeField === "string" ? nomeField : d.id;
        });
        setCongregacoes(nomes);
      })
      .catch(() => {
        // Silencia erros; se não houver coleção, apenas não preenche opções.
      });
  }, []);

  const filtradas = marcacoes.filter((m) => {
    const tipoOk = tipo === "todas" || m.tipo === tipo;
    const congregacaoOk = congregacaoFiltro === "todas" || m.congregacao === congregacaoFiltro;
    return tipoOk && congregacaoOk;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marcações</h1>
        <p className="text-muted-foreground mt-1">Visualize coletas, serviços e RJM agendados, com filtros.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v: TipoFiltro) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="coleta">Coletas</SelectItem>
                  <SelectItem value="servico">Serviços</SelectItem>
                  <SelectItem value="rjm">RJM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Congregação</Label>
              <Select value={congregacaoFiltro} onValueChange={setCongregacaoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por congregação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {congregacoes.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filtradas.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{m.tipo === "coleta" ? "Coleta" : m.tipo === "servico" ? "Serviço" : "RJM"}</span>
                <span className="text-sm text-muted-foreground">{m.congregacao}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Data</span>
                  <div>{m.data}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Horário</span>
                  <div>{m.hora}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">ID</span>
                  <div className="font-mono text-xs">{m.id}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtradas.length === 0 && (
          <p className="text-muted-foreground">Nenhuma marcação encontrada para os filtros selecionados.</p>
        )}
      </div>
    </div>
  );
}