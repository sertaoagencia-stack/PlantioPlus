import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Truck, Pencil, Trash2, Wrench, Clock, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MaquinarioDialog from "../components/frota/MaquinarioDialog";
import ManutencaoDialog from "../components/frota/ManutencaoDialog";
import ManutencaoList from "../components/frota/ManutencaoList";

const statusColors = {
  "Ativo": "bg-primary/10 text-primary",
  "Em Manutenção": "bg-orange-500/10 text-orange-500",
  "Inativo": "bg-muted text-muted-foreground",
};

const tipoEmojis = {
  Trator: "🚜", Colheitadeira: "🌾", Pulverizador: "💧", Plantadeira: "🌱",
  Caminhão: "🚚", Moto: "🏍️", Implemento: "⚙️", Outro: "🔧",
};

export default function Frota() {
  const [maquinarios, setMaquinarios] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maqDialog, setMaqDialog] = useState(false);
  const [editingMaq, setEditingMaq] = useState(null);
  const [manutDialog, setManutDialog] = useState(false);
  const [editingManut, setEditingManut] = useState(null);
  const [selectedMaq, setSelectedMaq] = useState(null);

  async function load() {
    const [maqs, maints] = await Promise.all([
      base44.entities.Maquinario.list(),
      base44.entities.ManutencaoMaquinario.list("-data_prevista"),
    ]);
    setMaquinarios(maqs);
    setManutencoes(maints);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDeleteMaq(id) {
    if (!confirm("Excluir este equipamento e todas as suas manutenções?")) return;
    await base44.entities.Maquinario.delete(id);
    load();
  }

  function openNovaManutencao(maqId) {
    setEditingManut(null);
    setSelectedMaq(maqId);
    setManutDialog(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const totalAtivos = maquinarios.filter(m => m.status === "Ativo").length;
  const totalManutencao = maquinarios.filter(m => m.status === "Em Manutenção").length;
  const totalAgendadas = manutencoes.filter(m => m.status === "Agendada").length;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Gestão de Frota</h1>
          <p className="text-muted-foreground mt-1">Cadastro e manutenção de maquinários</p>
        </div>
        <Button onClick={() => { setEditingMaq(null); setMaqDialog(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Equipamento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border-none shadow-sm text-center">
          <p className="text-2xl font-bold text-primary">{totalAtivos}</p>
          <p className="text-xs text-muted-foreground mt-1">Ativos</p>
        </Card>
        <Card className="p-4 border-none shadow-sm text-center">
          <p className="text-2xl font-bold text-orange-500">{totalManutencao}</p>
          <p className="text-xs text-muted-foreground mt-1">Em Manutenção</p>
        </Card>
        <Card className="p-4 border-none shadow-sm text-center">
          <p className="text-2xl font-bold text-secondary">{totalAgendadas}</p>
          <p className="text-xs text-muted-foreground mt-1">Revisões Agendadas</p>
        </Card>
      </div>

      {/* Frota Grid */}
      {maquinarios.length === 0 ? (
        <Card className="p-12 text-center border-none shadow-sm">
          <Truck className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhum equipamento cadastrado</h3>
          <p className="text-muted-foreground text-sm mb-6">Cadastre os equipamentos da sua frota</p>
          <Button onClick={() => { setEditingMaq(null); setMaqDialog(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Cadastrar Equipamento
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {maquinarios.map((maq) => {
            const maqManuts = manutencoes.filter(m => m.maquinario_id === maq.id);
            const agendadas = maqManuts.filter(m => m.status === "Agendada").length;
            return (
              <Card key={maq.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-xl">
                        {tipoEmojis[maq.tipo] || "🔧"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm leading-tight">{maq.nome}</h3>
                        <p className="text-xs text-muted-foreground">{maq.tipo}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${statusColors[maq.status]}`}>{maq.status}</Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                    {(maq.marca || maq.modelo) && (
                      <p>🏷️ {[maq.marca, maq.modelo].filter(Boolean).join(" ")} {maq.ano ? `(${maq.ano})` : ""}</p>
                    )}
                    {maq.placa && <p>📋 {maq.placa}</p>}
                    {maq.horas_uso_atual != null && <p>⏱️ {maq.horas_uso_atual}h de uso</p>}
                    {maq.quilometragem_atual != null && <p>📍 {maq.quilometragem_atual.toLocaleString("pt-BR")} km</p>}
                    {agendadas > 0 && (
                      <p className="text-orange-500 font-medium">🔔 {agendadas} revisão(ões) agendada(s)</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" onClick={() => openNovaManutencao(maq.id)}>
                      <Wrench className="w-3 h-3" /> Agendar Revisão
                    </Button>
                    <button onClick={() => { setEditingMaq(maq); setMaqDialog(true); }} className="p-2 rounded-lg hover:bg-accent">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDeleteMaq(maq.id)} className="p-2 rounded-lg hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>

                {/* Próxima manutenção */}
                {maqManuts.filter(m => m.status === "Agendada").length > 0 && (
                  <div className="border-t border-border px-5 py-3 bg-accent/20">
                    <ManutencaoList
                      manutencoes={maqManuts.filter(m => m.status === "Agendada").slice(0, 2)}
                      onEdit={(m) => { setEditingManut(m); setSelectedMaq(m.maquinario_id); setManutDialog(true); }}
                      onReload={load}
                      compact
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* All manutencoes section */}
      {manutencoes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Histórico de Manutenções</h2>
          <Card className="border-none shadow-sm overflow-hidden">
            <ManutencaoList
              manutencoes={manutencoes}
              maquinarios={maquinarios}
              onEdit={(m) => { setEditingManut(m); setSelectedMaq(m.maquinario_id); setManutDialog(true); }}
              onReload={load}
            />
          </Card>
        </div>
      )}

      <MaquinarioDialog
        open={maqDialog}
        onOpenChange={setMaqDialog}
        maquinario={editingMaq}
        onSaved={load}
      />
      <ManutencaoDialog
        open={manutDialog}
        onOpenChange={setManutDialog}
        manutencao={editingManut}
        maquinarios={maquinarios}
        defaultMaquinarioId={selectedMaq}
        onSaved={load}
      />
    </div>
  );
}