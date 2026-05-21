import { base44 } from "@/api/base44Client";
import { Pencil, Trash2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, parseISO } from "date-fns";

const statusColors = {
  "Agendada": "bg-blue-500/10 text-blue-500",
  "Em Andamento": "bg-orange-500/10 text-orange-500",
  "Concluída": "bg-primary/10 text-primary",
  "Cancelada": "bg-muted text-muted-foreground",
};

function urgencia(manutencao) {
  if (!manutencao.data_prevista || manutencao.status !== "Agendada") return null;
  const diff = differenceInDays(parseISO(manutencao.data_prevista), new Date());
  if (diff < 0) return "atrasada";
  if (diff <= 7) return "urgente";
  return null;
}

export default function ManutencaoList({ manutencoes, maquinarios, onEdit, onReload, compact = false }) {
  async function handleDelete(id) {
    await base44.entities.ManutencaoMaquinario.delete(id);
    onReload();
  }

  const maqMap = {};
  (maquinarios || []).forEach(m => { maqMap[m.id] = m.nome; });

  if (manutencoes.length === 0) return null;

  return (
    <div className={compact ? "space-y-1.5" : "divide-y divide-border"}>
      {manutencoes.map((m) => {
        const urg = urgencia(m);
        return (
          <div key={m.id} className={`flex items-start gap-3 ${compact ? "" : "p-4 hover:bg-accent/20"}`}>
            <div className={`mt-0.5 p-1 rounded-lg ${urg === "atrasada" ? "bg-destructive/10" : urg === "urgente" ? "bg-orange-500/10" : "bg-accent"}`}>
              {urg === "atrasada"
                ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                : urg === "urgente"
                  ? <Clock className="w-3.5 h-3.5 text-orange-500" />
                  : <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{m.titulo}</p>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                {!compact && maqMap[m.maquinario_id] && (
                  <span className="text-xs text-muted-foreground">🔧 {maqMap[m.maquinario_id]}</span>
                )}
                <span className="text-xs text-muted-foreground">{m.tipo}</span>
                {m.data_prevista && (
                  <span className="text-xs text-muted-foreground">
                    📅 {new Date(m.data_prevista).toLocaleDateString("pt-BR")}
                  </span>
                )}
                {m.horas_previstas && (
                  <span className="text-xs text-muted-foreground">⏱️ {m.horas_previstas}h</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge className={`text-xs ${statusColors[m.status]}`}>{m.status}</Badge>
              {!compact && (
                <>
                  <button onClick={() => onEdit(m)} className="p-1 rounded hover:bg-accent">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-1 rounded hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}