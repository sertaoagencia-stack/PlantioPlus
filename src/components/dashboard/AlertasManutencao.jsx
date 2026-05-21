import { useState } from "react";
import { Wrench, AlertTriangle, Clock, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

function classificar(manutencao, maquinario) {
  if (manutencao.status !== "Agendada" && manutencao.status !== "Em Andamento") return null;

  // Alerta por data
  if (manutencao.data_prevista && (manutencao.gatilho === "Data" || manutencao.gatilho === "Ambos")) {
    const diff = differenceInDays(parseISO(manutencao.data_prevista), new Date());
    if (diff < 0) return { tipo: "atrasada", info: `${Math.abs(diff)}d atrasada`, dataDiff: diff };
    if (diff <= 7) return { tipo: "urgente", info: `vence em ${diff}d`, dataDiff: diff };
    if (diff <= 14) return { tipo: "proxima", info: `em ${diff}d`, dataDiff: diff };
  }

  // Alerta por horas
  if (manutencao.horas_previstas && maquinario && (manutencao.gatilho === "Horas de Uso" || manutencao.gatilho === "Ambos")) {
    const horasRestantes = manutencao.horas_previstas - (maquinario.horas_uso_atual || 0);
    if (horasRestantes <= 0) return { tipo: "atrasada", info: `${Math.abs(horasRestantes)}h ultrapassada` };
    if (horasRestantes <= 50) return { tipo: "urgente", info: `${horasRestantes}h restantes` };
  }

  return null;
}

export default function AlertasManutencao({ manutencoes, maquinarios }) {
  const [expanded, setExpanded] = useState(true);

  const maqMap = {};
  maquinarios.forEach(m => { maqMap[m.id] = m; });

  const alertas = manutencoes
    .map(m => ({ ...m, alerta: classificar(m, maqMap[m.maquinario_id]) }))
    .filter(m => m.alerta !== null)
    .sort((a, b) => {
      const ord = { atrasada: 0, urgente: 1, proxima: 2 };
      return ord[a.alerta.tipo] - ord[b.alerta.tipo];
    });

  if (alertas.length === 0) {
    return (
      <Card className="p-4 border-none shadow-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <CheckCircle className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Nenhuma manutenção próxima do vencimento.</span>
        </div>
      </Card>
    );
  }

  const countAtrasadas = alertas.filter(a => a.alerta.tipo === "atrasada").length;
  const countUrgentes = alertas.filter(a => a.alerta.tipo === "urgente").length;

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-accent/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10">
            <Wrench className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm">Alertas de Manutenção</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {countAtrasadas > 0 && <span className="text-destructive font-medium">{countAtrasadas} atrasada(s) </span>}
              {countUrgentes > 0 && <span className="text-orange-500 font-medium">{countUrgentes} urgente(s) </span>}
              · {alertas.length} total
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {alertas.map((m) => {
            const { tipo, info } = m.alerta;
            const maq = maqMap[m.maquinario_id];
            return (
              <div key={m.id} className="flex items-start gap-4 p-4 hover:bg-accent/20 transition-colors">
                <div className={`mt-0.5 p-1.5 rounded-lg ${tipo === "atrasada" ? "bg-destructive/10" : tipo === "urgente" ? "bg-orange-500/10" : "bg-yellow-500/10"}`}>
                  {tipo === "atrasada"
                    ? <AlertTriangle className="w-4 h-4 text-destructive" />
                    : <Clock className={`w-4 h-4 ${tipo === "urgente" ? "text-orange-500" : "text-yellow-600"}`} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{m.titulo}</span>
                    <Badge className={`text-xs ${tipo === "atrasada" ? "bg-destructive/10 text-destructive" : tipo === "urgente" ? "bg-orange-500/10 text-orange-500" : "bg-yellow-500/10 text-yellow-600"}`}>
                      {info}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    🔧 {maq?.nome || "—"} · {m.tipo}
                    {m.data_prevista && <> · 📅 {format(parseISO(m.data_prevista), "dd/MM/yyyy", { locale: ptBR })}</>}
                  </p>
                </div>
                <Link to="/frota" className="text-xs text-primary hover:underline shrink-0">Ver</Link>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}