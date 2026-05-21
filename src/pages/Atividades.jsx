import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AtividadeDialog from "../components/atividades/AtividadeDialog";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  Pendente: { icon: Clock, color: "text-amber-500", dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700" },
  "Em Andamento": { icon: AlertCircle, color: "text-blue-500", dot: "bg-blue-400", badge: "bg-blue-100 text-blue-700" },
  Concluída: { icon: CheckCircle2, color: "text-green-600", dot: "bg-green-400", badge: "bg-green-100 text-green-700" },
  Cancelada: { icon: XCircle, color: "text-gray-400", dot: "bg-gray-300", badge: "bg-gray-100 text-gray-500" },
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Atividades() {
  const [atividades, setAtividades] = useState([]);
  const [lavouras, setLavouras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  async function load() {
    const [atvs, lavs] = await Promise.all([
      base44.entities.Atividade.list("-data_prevista"),
      base44.entities.Lavoura.list(),
    ]);
    setAtividades(atvs);
    setLavouras(lavs);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleStatusChange(atividade, novoStatus) {
    await base44.entities.Atividade.update(atividade.id, {
      ...atividade,
      status: novoStatus,
      data_realizada: novoStatus === "Concluída" ? new Date().toISOString().split("T")[0] : atividade.data_realizada,
    });
    load();
  }

  const lavMap = {};
  lavouras.forEach(l => (lavMap[l.id] = l.nome));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();
  const paddedDays = Array(startPad).fill(null).concat(days);

  function getAtividadesDia(day) {
    return atividades.filter(a => {
      if (!a.data_prevista) return false;
      try { return isSameDay(parseISO(a.data_prevista), day); } catch { return false; }
    });
  }

  const selectedDayAtividades = selectedDay ? getAtividadesDia(selectedDay) : [];

  const counts = {
    Pendente: atividades.filter(a => a.status === "Pendente").length,
    "Em Andamento": atividades.filter(a => a.status === "Em Andamento").length,
    Concluída: atividades.filter(a => a.status === "Concluída").length,
  };

  function openNewForDay(day) {
    setEditing(null);
    setDialogOpen(true);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const selectedDateStr = selectedDay ? format(selectedDay, "yyyy-MM-dd") : "";

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Agenda de Atividades</h1>
          <p className="text-muted-foreground mt-1">Acompanhe e planeje as atividades das lavouras</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2 w-fit">
          <Plus className="w-4 h-4" /> Nova Atividade
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {["Pendente", "Em Andamento", "Concluída"].map(st => {
          const cfg = statusConfig[st];
          const Icon = cfg.icon;
          return (
            <Card key={st} className="p-4 border-none shadow-sm">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <span className="text-xs text-muted-foreground hidden sm:block">{st}</span>
              </div>
              <p className="text-xl font-bold mt-1">{counts[st]}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-accent">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="font-semibold capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-accent">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-border">
              {WEEKDAYS.map(d => (
                <div key={d} className="p-2 text-center text-xs text-muted-foreground font-medium">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {paddedDays.map((day, idx) => {
                if (!day) return <div key={`pad-${idx}`} className="min-h-[72px] border-b border-r border-border/50" />;
                const dayAtvs = getAtividadesDia(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`min-h-[72px] p-1.5 border-b border-r border-border/50 text-left transition-colors
                      ${isSelected ? "bg-primary/10" : "hover:bg-accent/40"}
                      ${!isSameMonth(day, currentMonth) ? "opacity-40" : ""}
                    `}
                  >
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1
                      ${isCurrentDay ? "bg-primary text-primary-foreground" : ""}
                    `}>
                      {format(day, "d")}
                    </span>
                    <div className="space-y-0.5">
                      {dayAtvs.slice(0, 2).map(a => {
                        const cfg = statusConfig[a.status] || statusConfig.Pendente;
                        return (
                          <div key={a.id} className={`w-full text-xs px-1 py-0.5 rounded truncate ${cfg.badge}`}>
                            {a.titulo}
                          </div>
                        );
                      })}
                      {dayAtvs.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">+{dayAtvs.length - 2} mais</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Side panel */}
        <div>
          <Card className="border-none shadow-sm h-full flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                {selectedDay
                  ? format(selectedDay, "dd 'de' MMMM", { locale: ptBR })
                  : "Selecione um dia"}
              </h3>
              {selectedDay && (
                <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs"
                  onClick={() => { setEditing(null); setDialogOpen(true); }}>
                  <Plus className="w-3 h-3" /> Adicionar
                </Button>
              )}
            </div>
            {!selectedDay ? (
              <div className="p-8 text-center text-muted-foreground text-sm flex-1">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Clique em um dia para ver as atividades
              </div>
            ) : selectedDayAtividades.length === 0 ? (
              <div className="p-6 text-center flex-1">
                <p className="text-sm text-muted-foreground mb-3">Nenhuma atividade neste dia</p>
                <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border flex-1 overflow-y-auto">
                {selectedDayAtividades.map(atv => {
                  const cfg = statusConfig[atv.status] || statusConfig.Pendente;
                  const Icon = cfg.icon;
                  return (
                    <div key={atv.id} className="p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{atv.titulo}</p>
                          <p className="text-xs text-muted-foreground">{atv.tipo} • {lavMap[atv.lavoura_id] || "—"}</p>
                          {atv.responsavel && <p className="text-xs text-muted-foreground">👤 {atv.responsavel}</p>}
                        </div>
                        <button onClick={() => { setEditing(atv); setDialogOpen(true); }} className="text-xs text-muted-foreground hover:text-foreground">✏️</button>
                      </div>
                      {atv.status !== "Concluída" && atv.status !== "Cancelada" && (
                        <div className="flex gap-1.5 ml-6">
                          {atv.status === "Pendente" && (
                            <button onClick={() => handleStatusChange(atv, "Em Andamento")} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100">Iniciar</button>
                          )}
                          <button onClick={() => handleStatusChange(atv, "Concluída")} className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100">Concluir</button>
                          <button onClick={() => handleStatusChange(atv, "Cancelada")} className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100">Cancelar</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      <AtividadeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        atividade={editing}
        lavouraId={null}
        lavouras={lavouras}
        onSaved={load}
        preselectedDate={editing ? undefined : selectedDateStr}
      />
    </div>
  );
}