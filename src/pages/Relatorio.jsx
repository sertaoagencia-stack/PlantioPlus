import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, TrendingUp, TrendingDown, DollarSign, Pencil, Trash2, ChevronRight, Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import ReceitaDialog from "../components/relatorio/ReceitaDialog";
import { Link } from "react-router-dom";

export default function Relatorio() {
  const [lavouras, setLavouras] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLavoura, setFilterLavoura] = useState("Todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState(null);

  async function load() {
    const [lavs, desps, recs] = await Promise.all([
      base44.entities.Lavoura.list(),
      base44.entities.Despesa.list(),
      base44.entities.Receita.list(),
    ]);
    setLavouras(lavs);
    setDespesas(desps);
    setReceitas(recs);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const lavMap = {};
  lavouras.forEach(l => (lavMap[l.id] = l));

  const filteredDespesas = filterLavoura === "Todas" ? despesas : despesas.filter(d => d.lavoura_id === filterLavoura);
  const filteredReceitas = filterLavoura === "Todas" ? receitas : receitas.filter(r => r.lavoura_id === filterLavoura);

  const totalDespesas = filteredDespesas.reduce((s, d) => s + (d.valor || 0), 0);
  const totalReceitas = filteredReceitas.reduce((s, r) => s + (r.valor || 0), 0);
  const lucro = totalReceitas - totalDespesas;
  const totalTarefas = filterLavoura === "Todas"
    ? lavouras.reduce((s, l) => s + (l.area_hectares || 0), 0)
    : (lavMap[filterLavoura]?.area_hectares || 0);
  const totalArea = totalTarefas / 2.3;
  const lucroHa = totalArea > 0 ? lucro / totalArea : 0;
  const lucroPorTarefa = totalTarefas > 0 ? lucro / totalTarefas : 0;
  const despesasPorTarefa = totalTarefas > 0 ? totalDespesas / totalTarefas : 0;

  // Chart data per lavoura
  const chartData = lavouras.map(l => {
    const desp = despesas.filter(d => d.lavoura_id === l.id).reduce((s, d) => s + (d.valor || 0), 0);
    const rec = receitas.filter(r => r.lavoura_id === l.id).reduce((s, r) => s + (r.valor || 0), 0);
    return { name: l.nome, Despesas: desp, Receitas: rec, Lucro: rec - desp };
  }).filter(d => d.Despesas > 0 || d.Receitas > 0);

  async function handleDeleteReceita(id) {
    await base44.entities.Receita.delete(id);
    load();
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Relatório de Rentabilidade</h1>
          <p className="text-muted-foreground mt-1">Análise financeira das suas lavouras</p>
        </div>
        <Button onClick={() => { setEditingReceita(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Registrar Receita
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filtrar por lavoura:</span>
        <Select value={filterLavoura} onValueChange={setFilterLavoura}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas as Lavouras</SelectItem>
            {lavouras.map(l => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-none shadow-sm">
          <p className="text-sm text-muted-foreground">Total Receitas</p>
          <p className="text-2xl font-bold mt-1 text-green-600">R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card className="p-5 border-none shadow-sm">
          <p className="text-sm text-muted-foreground">Total Despesas</p>
          <p className="text-2xl font-bold mt-1 text-red-500">R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card className={`p-5 border-none shadow-sm ${lucro >= 0 ? "bg-green-50" : "bg-red-50"}`}>
          <div className="flex items-center gap-2">
            {lucro >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
            <p className="text-sm text-muted-foreground">Lucro / Prejuízo</p>
          </div>
          <p className={`text-2xl font-bold mt-1 ${lucro >= 0 ? "text-green-600" : "text-red-500"}`}>
            R$ {lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-5 border-none shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <p className="text-sm text-muted-foreground">Lucro/ha</p>
          </div>
          <p className={`text-2xl font-bold mt-1 ${lucroHa >= 0 ? "text-primary" : "text-red-500"}`}>
            R$ {lucroHa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </Card>
      </div>

      {/* Produtividade por Tarefa */}
      <Card className="p-5 border-none shadow-sm">
        <h3 className="font-semibold mb-4">Análise por Tarefa <span className="text-xs text-muted-foreground font-normal">(1 ha = 2,3 tarefas)</span></h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-accent rounded-xl">
            <p className="text-xs text-muted-foreground">Área Total</p>
            <p className="text-lg font-bold mt-1">{totalArea.toFixed(2)} ha</p>
            <p className="text-sm text-muted-foreground">{totalTarefas.toFixed(1)} tarefas</p>
          </div>
          <div className="p-4 bg-accent rounded-xl">
            <p className="text-xs text-muted-foreground">Custo / Tarefa</p>
            <p className="text-lg font-bold mt-1 text-red-500">R$ {despesasPorTarefa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 bg-accent rounded-xl">
            <p className="text-xs text-muted-foreground">Lucro / Tarefa</p>
            <p className={`text-lg font-bold mt-1 ${lucroPorTarefa >= 0 ? "text-green-600" : "text-red-500"}`}>R$ {lucroPorTarefa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 bg-accent rounded-xl">
            <p className="text-xs text-muted-foreground">Margem</p>
            <p className={`text-lg font-bold mt-1 ${lucro >= 0 ? "text-green-600" : "text-red-500"}`}>
              {totalReceitas > 0 ? ((lucro / totalReceitas) * 100).toFixed(1) : "0"}%
            </p>
          </div>
        </div>
      </Card>



      {/* Lavouras Finalizadas */}
      {lavouras.filter(l => l.status === "Finalizada").length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" /> Rentabilidade por Lavoura Finalizada
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lavouras.filter(l => l.status === "Finalizada").map(l => {
              const desp = despesas.filter(d => d.lavoura_id === l.id).reduce((s, d) => s + (d.valor || 0), 0);
              const rec = receitas.filter(r => r.lavoura_id === l.id).reduce((s, r) => s + (r.valor || 0), 0);
              const lucroL = rec - desp;
              const margemL = rec > 0 ? (lucroL / rec) * 100 : 0;
              return (
                <Link key={l.id} to={`/rentabilidade/${l.id}`}>
                  <Card className="p-5 border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm">{l.nome}</p>
                        <p className="text-xs text-muted-foreground">{l.cultura} • {l.safra}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Receitas</span>
                        <span className="text-primary font-medium">R$ {rec.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Despesas</span>
                        <span className="text-destructive font-medium">R$ {desp.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className={`flex justify-between text-sm font-bold mt-2 pt-2 border-t border-border ${lucroL >= 0 ? "text-primary" : "text-destructive"}`}>
                        <span>Lucro</span>
                        <span>R$ {lucroL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className={`text-right text-xs ${margemL >= 0 ? "text-primary" : "text-destructive"}`}>Margem: {margemL.toFixed(1)}%</div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="p-5 border-none shadow-sm">
          <h3 className="font-semibold mb-4">Receitas vs Despesas por Lavoura</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} fontSize={12} />
                <Tooltip formatter={(val) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="Receitas" fill="hsl(152, 55%, 28%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Receitas Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Receitas Registradas</h3>
        </div>
        {filteredReceitas.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma receita registrada</div>
        ) : (
          <div className="divide-y divide-border">
            {filteredReceitas.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{r.descricao}</p>
                  <p className="text-xs text-muted-foreground">{r.tipo} • {lavMap[r.lavoura_id]?.nome || "—"} • {r.data ? new Date(r.data).toLocaleDateString("pt-BR") : "—"}</p>
                </div>
                <p className="font-semibold text-green-600">R$ {(r.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingReceita(r); setDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-accent">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDeleteReceita(r.id)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ReceitaDialog open={dialogOpen} onOpenChange={setDialogOpen} receita={editingReceita} lavouras={lavouras} onSaved={load} />
    </div>
  );
}