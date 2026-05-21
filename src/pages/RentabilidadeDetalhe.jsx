import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Receipt, Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(152,55%,38%)", "hsl(0,72%,51%)", "hsl(42,80%,52%)", "hsl(200,60%,50%)", "hsl(280,50%,55%)", "hsl(30,70%,55%)"];

export default function RentabilidadeDetalhe() {
  const { id } = useParams();
  const [lavoura, setLavoura] = useState(null);
  const [despesas, setDespesas] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [lavs, desps, recs] = await Promise.all([
        base44.entities.Lavoura.list(),
        base44.entities.Despesa.filter({ lavoura_id: id }),
        base44.entities.Receita.filter({ lavoura_id: id }),
      ]);
      setLavoura(lavs.find(l => l.id === id));
      setDespesas(desps);
      setReceitas(recs);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  if (!lavoura) return <div className="p-8 text-center text-muted-foreground">Lavoura não encontrada</div>;

  const totalDespesas = despesas.reduce((s, d) => s + (d.valor || 0), 0);
  const totalReceitas = receitas.reduce((s, r) => s + (r.valor || 0), 0);
  const lucro = totalReceitas - totalDespesas;
  const margem = totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0;
  const tarefas = lavoura.area_hectares || 0;
  const custoPorTarefa = tarefas > 0 ? totalDespesas / tarefas : 0;
  const lucroPorTarefa = tarefas > 0 ? lucro / tarefas : 0;

  // Despesas por categoria
  const despCat = {};
  despesas.forEach(d => { despCat[d.categoria] = (despCat[d.categoria] || 0) + (d.valor || 0); });
  const pieData = Object.entries(despCat).map(([name, value]) => ({ name, value }));

  // Timeline mensal
  const byMonth = {};
  despesas.forEach(d => {
    const m = d.data?.slice(0, 7);
    if (m) byMonth[m] = (byMonth[m] || { despesas: 0, receitas: 0, mes: m });
    if (m) byMonth[m].despesas += d.valor || 0;
  });
  receitas.forEach(r => {
    const m = r.data?.slice(0, 7);
    if (m) { if (!byMonth[m]) byMonth[m] = { despesas: 0, receitas: 0, mes: m }; byMonth[m].receitas += r.valor || 0; }
  });
  const barData = Object.values(byMonth).sort((a, b) => a.mes.localeCompare(b.mes)).map(m => ({
    name: m.mes.split("-").reverse().slice(0, 2).join("/"),
    Despesas: m.despesas,
    Receitas: m.receitas,
  }));

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/relatorio"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold">{lavoura.nome}</h1>
            <Badge className="bg-primary/10 text-primary">{lavoura.status}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {lavoura.cultura} • {tarefas} tarefas • Safra {lavoura.safra}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-none shadow-sm">
          <p className="text-xs text-muted-foreground">Total Receitas</p>
          <p className="text-xl font-bold text-primary mt-1">R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card className="p-5 border-none shadow-sm">
          <p className="text-xs text-muted-foreground">Total Despesas</p>
          <p className="text-xl font-bold text-destructive mt-1">R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card className={`p-5 border-none shadow-sm ${lucro >= 0 ? "bg-primary/5" : "bg-destructive/5"}`}>
          <div className="flex items-center gap-2">
            {lucro >= 0 ? <TrendingUp className="w-4 h-4 text-primary" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
            <p className="text-xs text-muted-foreground">Lucro Líquido</p>
          </div>
          <p className={`text-xl font-bold mt-1 ${lucro >= 0 ? "text-primary" : "text-destructive"}`}>
            R$ {lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-5 border-none shadow-sm">
          <p className="text-xs text-muted-foreground">Margem Líquida</p>
          <p className={`text-xl font-bold mt-1 ${margem >= 0 ? "text-primary" : "text-destructive"}`}>{margem.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Por tarefa */}
      <Card className="p-5 border-none shadow-sm">
        <h3 className="font-semibold mb-4">Análise por Tarefa</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-accent rounded-xl">
            <p className="text-xs text-muted-foreground">Área</p>
            <p className="text-lg font-bold mt-1">{tarefas} tarefas</p>
            <p className="text-xs text-muted-foreground">{(tarefas / 2.3).toFixed(2)} ha</p>
          </div>
          <div className="p-4 bg-accent rounded-xl">
            <p className="text-xs text-muted-foreground">Custo / Tarefa</p>
            <p className="text-lg font-bold mt-1 text-destructive">R$ {custoPorTarefa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 bg-accent rounded-xl">
            <p className="text-xs text-muted-foreground">Lucro / Tarefa</p>
            <p className={`text-lg font-bold mt-1 ${lucroPorTarefa >= 0 ? "text-primary" : "text-destructive"}`}>
              R$ {lucroPorTarefa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-4 bg-accent rounded-xl">
            <p className="text-xs text-muted-foreground">Margem</p>
            <p className={`text-lg font-bold mt-1 ${margem >= 0 ? "text-primary" : "text-destructive"}`}>{margem.toFixed(1)}%</p>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {barData.length > 0 && (
          <Card className="p-5 border-none shadow-sm">
            <h3 className="font-semibold mb-4">Evolução Mensal</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} fontSize={11} />
                  <Tooltip formatter={(val) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                  <Legend />
                  <Bar dataKey="Receitas" fill="hsl(152,55%,38%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesas" fill="hsl(0,72%,51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        {pieData.length > 0 && (
          <Card className="p-5 border-none shadow-sm">
            <h3 className="font-semibold mb-4">Despesas por Categoria</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* Despesas list */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Receipt className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Despesas ({despesas.length})</h3>
        </div>
        {despesas.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma despesa registrada</div>
        ) : (
          <div className="divide-y divide-border">
            {despesas.map(d => (
              <div key={d.id} className="flex items-center gap-4 p-4 hover:bg-accent/20">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{d.descricao}</p>
                  <p className="text-xs text-muted-foreground">{d.categoria} • {d.data ? new Date(d.data).toLocaleDateString("pt-BR") : "—"}</p>
                </div>
                <p className="text-sm font-semibold text-destructive">R$ {(d.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}