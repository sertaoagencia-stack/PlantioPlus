import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Clock, Bell, ChevronDown, ChevronUp, Mail, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

function classificarAtividade(atividade) {
  if (!atividade.data_prevista || atividade.status === "Concluída" || atividade.status === "Cancelada") return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataPrevista = parseISO(atividade.data_prevista);
  const diff = differenceInDays(dataPrevista, hoje);
  if (diff < 0) return { tipo: "atrasada", diasDiff: Math.abs(diff) };
  if (diff <= 3) return { tipo: "urgente", diasDiff: diff };
  if (diff <= 7) return { tipo: "proxima", diasDiff: diff };
  return null;
}

export default function AlertasAtividades({ atividades, lavouras, gerentes }) {
  const [expanded, setExpanded] = useState(true);
  const [enviando, setEnviando] = useState({});

  const alertas = atividades
    .map(a => ({ ...a, alerta: classificarAtividade(a) }))
    .filter(a => a.alerta !== null)
    .sort((a, b) => {
      const ordem = { atrasada: 0, urgente: 1, proxima: 2 };
      return ordem[a.alerta.tipo] - ordem[b.alerta.tipo];
    });

  const lavouraNome = (id) => lavouras.find(l => l.id === id)?.nome || "—";

  async function enviarNotificacao(atividade) {
    setEnviando(prev => ({ ...prev, [atividade.id]: true }));
    const { alerta } = atividade;
    const lavoura = lavouraNome(atividade.lavoura_id);

    const assunto = alerta.tipo === "atrasada"
      ? `⚠️ Atividade Atrasada: ${atividade.titulo}`
      : `🔔 Atividade Próxima: ${atividade.titulo}`;

    const corpo = `
Olá,

${alerta.tipo === "atrasada"
  ? `A atividade abaixo está **atrasada há ${alerta.diasDiff} dia(s)**:`
  : `A atividade abaixo vence em **${alerta.diasDiff} dia(s)**:`}

📋 Atividade: ${atividade.titulo}
🌱 Lavoura: ${lavoura}
📅 Data Prevista: ${format(parseISO(atividade.data_prevista), "dd/MM/yyyy")}
👤 Responsável: ${atividade.responsavel || "Não definido"}
📌 Status: ${atividade.status}
${atividade.observacoes ? `📝 Observações: ${atividade.observacoes}` : ""}

Por favor, tome as providências necessárias.

Atenciosamente,
MySafra - Sistema de Gestão Agrícola
    `.trim();

    // Envia para o responsável e gerentes
    const destinatarios = [];

    // Tenta encontrar e-mail do responsável entre os usuários
    const meUser = await base44.auth.me();
    destinatarios.push(meUser.email);

    // Envia para todos os gerentes/admins passados
    (gerentes || []).forEach(g => {
      if (g.email && !destinatarios.includes(g.email)) destinatarios.push(g.email);
    });

    await Promise.all(
      destinatarios.map(email =>
        base44.integrations.Core.SendEmail({ to: email, subject: assunto, body: corpo })
      )
    );

    toast.success(`Notificação enviada para ${destinatarios.length} destinatário(s)!`);
    setEnviando(prev => ({ ...prev, [atividade.id]: false }));
  }

  if (alertas.length === 0) {
    return (
      <Card className="p-4 border-none shadow-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <CheckCircle className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Nenhuma atividade atrasada ou próxima do vencimento.</span>
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
          <div className="p-2 rounded-xl bg-destructive/10">
            <Bell className="w-5 h-5 text-destructive" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm">Alertas de Atividades</h3>
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
          {alertas.map((atividade) => {
            const { tipo, diasDiff } = atividade.alerta;
            const isAtrasada = tipo === "atrasada";
            const isUrgente = tipo === "urgente";

            return (
              <div key={atividade.id} className="flex items-start gap-4 p-4 hover:bg-accent/20 transition-colors">
                <div className={`mt-0.5 p-1.5 rounded-lg ${isAtrasada ? "bg-destructive/10" : isUrgente ? "bg-orange-500/10" : "bg-yellow-500/10"}`}>
                  {isAtrasada
                    ? <AlertTriangle className="w-4 h-4 text-destructive" />
                    : <Clock className={`w-4 h-4 ${isUrgente ? "text-orange-500" : "text-yellow-600"}`} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">{atividade.titulo}</span>
                    <Badge
                      className={`text-xs ${isAtrasada ? "bg-destructive/10 text-destructive" : isUrgente ? "bg-orange-500/10 text-orange-500" : "bg-yellow-500/10 text-yellow-600"}`}
                    >
                      {isAtrasada ? `${diasDiff}d atrasada` : isUrgente ? `vence em ${diasDiff}d` : `em ${diasDiff}d`}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    🌱 {lavouraNome(atividade.lavoura_id)}
                    {atividade.responsavel && <> · 👤 {atividade.responsavel}</>}
                    · 📅 {format(parseISO(atividade.data_prevista), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1.5 text-xs"
                  disabled={enviando[atividade.id]}
                  onClick={() => enviarNotificacao(atividade)}
                >
                  <Mail className="w-3 h-3" />
                  {enviando[atividade.id] ? "Enviando..." : "Notificar"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}