import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Plus, Trash2, CheckCircle2, Clock, AlertCircle, XCircle, Image, Receipt } from "lucide-react";
import AcompanhamentoTab from "../components/lavouras/AcompanhamentoTab";
import DespesasLavouraTab from "../components/lavouras/DespesasLavouraTab";
import RelatorioPDFButton from "../components/lavouras/RelatorioPDFButton";
import useRole from "../hooks/useRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AtividadeDialog from "../components/atividades/AtividadeDialog";

const statusIcons = {
  Pendente: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
  "Em Andamento": { icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-50" },
  Concluída: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  Cancelada: { icon: XCircle, color: "text-gray-400", bg: "bg-gray-50" },
};

const statusLavoura = {
  Planejamento: "bg-blue-100 text-blue-700",
  Plantio: "bg-amber-100 text-amber-700",
  Desenvolvimento: "bg-green-100 text-green-700",
  Colheita: "bg-orange-100 text-orange-700",
  Finalizada: "bg-gray-100 text-gray-600",
};

export default function LavouraDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canViewFinanceiro } = useRole();
  const [lavoura, setLavoura] = useState(null);
  const [despesas, setDespesas] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atividadeDialogOpen, setAtividadeDialogOpen] = useState(false);
  const [editingAtividade, setEditingAtividade] = useState(null);

  async function load() {
    const [lavs, ativs, desps] = await Promise.all([
      base44.entities.Lavoura.list(),
      base44.entities.Atividade.filter({ lavoura_id: id }, "-data_prevista"),
      base44.entities.Despesa.filter({ lavoura_id: id }, "-data"),
    ]);
    setLavoura(lavs.find(l => l.id === id));
    setAtividades(ativs);
    setDespesas(desps);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function handleDeleteAtividade(atividadeId) {
    await base44.entities.Atividade.delete(atividadeId);
    load();
  }

  async function handleStatusChange(atividade, novoStatus) {
    await base44.entities.Atividade.update(atividade.id, {
      ...atividade,
      status: novoStatus,
      data_realizada: novoStatus === "Concluída" ? new Date().toISOString().split("T")[0] : atividade.data_realizada,
    });
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!lavoura) return <div className="p-8 text-muted-foreground">Lavoura não encontrada.</div>;

  const tarefas = lavoura.area_hectares || 0;
  const hectares = tarefas / 2.3;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate("/lavouras")} className="p-2 rounded-xl hover:bg-accent mt-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{lavoura.nome}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-sm text-muted-foreground">{lavoura.cultura} • {lavoura.safra}</span>
            <span className="text-sm text-muted-foreground">{tarefas.toFixed(1)} tarefas / {hectares.toFixed(2)} ha</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusLavoura[lavoura.status] || "bg-gray-100 text-gray-600"}`}>
              {lavoura.status}
            </span>
          </div>
        </div>
        <RelatorioPDFButton
          lavoura={lavoura}
          despesas={despesas}
          atividades={atividades}
          insumos={[]}
          produtos={[]}
        />
      </div>

      <Tabs defaultValue="acompanhamento">
        <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
          <TabsTrigger value="acompanhamento" className="gap-2"><Image className="w-4 h-4" /> Acompanhamento</TabsTrigger>
          <TabsTrigger value="atividades" className="gap-2"><CalendarDays className="w-4 h-4" /> Atividades ({atividades.length})</TabsTrigger>
          {canViewFinanceiro && <TabsTrigger value="despesas" className="gap-2"><Receipt className="w-4 h-4" /> Despesas ({despesas.length})</TabsTrigger>}
        </TabsList>

        {/* ACOMPANHAMENTO TAB */}
        <TabsContent value="acompanhamento" className="space-y-4 mt-4">
          <AcompanhamentoTab lavouraId={id} />
        </TabsContent>

        {/* DESPESAS TAB */}
        <TabsContent value="despesas" className="space-y-4 mt-4">
          <DespesasLavouraTab lavouraId={id} />
        </TabsContent>

        {/* ATIVIDADES TAB */}
        <TabsContent value="atividades" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{atividades.filter(a => a.status === "Concluída").length} de {atividades.length} concluídas</p>
            <Button onClick={() => { setEditingAtividade(null); setAtividadeDialogOpen(true); }} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Nova Atividade
            </Button>
          </div>

          {atividades.length === 0 ? (
            <Card className="p-10 text-center border-none shadow-sm">
              <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma atividade agendada</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {atividades.map(atv => {
                const st = statusIcons[atv.status] || statusIcons.Pendente;
                const Icon = st.icon;
                return (
                  <Card key={atv.id} className="p-4 border-none shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${st.bg} shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${st.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{atv.titulo}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{atv.tipo} • Previsto: {atv.data_prevista ? new Date(atv.data_prevista).toLocaleDateString("pt-BR") : "—"}</p>
                            {atv.responsavel && <p className="text-xs text-muted-foreground">👤 {atv.responsavel}</p>}
                            {atv.observacoes && <p className="text-xs text-muted-foreground italic mt-1">{atv.observacoes}</p>}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => { setEditingAtividade(atv); setAtividadeDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-accent text-xs text-muted-foreground">✏️</button>
                            <button onClick={() => handleDeleteAtividade(atv.id)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </button>
                          </div>
                        </div>
                        {atv.status !== "Concluída" && atv.status !== "Cancelada" && (
                          <div className="flex gap-2 mt-2">
                            {atv.status === "Pendente" && (
                              <button onClick={() => handleStatusChange(atv, "Em Andamento")} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                Iniciar
                              </button>
                            )}
                            <button onClick={() => handleStatusChange(atv, "Concluída")} className="text-xs px-2.5 py-1 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors">
                              Concluir
                            </button>
                            <button onClick={() => handleStatusChange(atv, "Cancelada")} className="text-xs px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AtividadeDialog
        open={atividadeDialogOpen}
        onOpenChange={setAtividadeDialogOpen}
        atividade={editingAtividade}
        lavouraId={id}
        lavouras={lavoura ? [lavoura] : []}
        onSaved={load}
      />
    </div>
  );
}