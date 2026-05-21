import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import useRole from "../hooks/useRole";
import useTheme from "../hooks/useTheme";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sprout, Receipt, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import RecentExpenses from "../components/dashboard/RecentExpenses";
import AlertasAtividades from "../components/dashboard/AlertasAtividades";
import AlertasManutencao from "../components/dashboard/AlertasManutencao";
import PrevisaoTempo from "../components/dashboard/PrevisaoTempo";

export default function Dashboard() {
  const [lavouras, setLavouras] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [maquinarios, setMaquinarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { canViewFinanceiro } = useRole();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    async function load() {
      const [lavs, desps, ativs, users, maqs, maints] = await Promise.all([
        base44.entities.Lavoura.list(),
        base44.entities.Despesa.list("-data", 100),
        base44.entities.Atividade.filter({ status: ["Pendente", "Em Andamento"] }),
        base44.entities.User.list(),
        base44.entities.Maquinario.list(),
        base44.entities.ManutencaoMaquinario.list(),
      ]);
      setLavouras(lavs);
      setDespesas(desps);
      setAtividades(ativs);
      setGerentes(users.filter(u => ["admin", "proprietario", "gerente"].includes(u.role)));
      setMaquinarios(maqs);
      setManutencoes(maints);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const totalGasto = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
  const totalArea = lavouras.reduce((sum, l) => sum + (l.area_hectares || 0), 0);
  const custoHa = totalArea > 0 ? totalGasto / totalArea : 0;

  const statsAll = [
    { label: "Total de Lavouras", value: lavouras.length, icon: Sprout, color: "text-primary", bg: "bg-primary/10", link: "/lavouras" },
    { label: "Total Gasto", value: `R$ ${totalGasto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: Receipt, color: "text-secondary", bg: "bg-secondary/10", financeOnly: true, link: "/despesas" },
    { label: "Custo por Hectare", value: `R$ ${custoHa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-chart-3", bg: "bg-blue-50", financeOnly: true },
  ];
  const stats = statsAll.filter(s => !s.financeOnly || canViewFinanceiro);

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral dos seus gastos de lavoura</p>
        </div>
        <div className="flex gap-3 items-center">
          <Button variant="outline" size="icon" onClick={toggle} title={theme === "dark" ? "Tema claro" : "Tema escuro"}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Link to="/lavouras">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Nova Lavoura
            </Button>
          </Link>
          <Link to="/despesas">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Nova Despesa
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const content = (
            <Card key={stat.label} className={`p-5 border-none shadow-sm transition-shadow ${stat.link ? "hover:shadow-md hover:ring-1 hover:ring-primary/30 cursor-pointer" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2 tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              {stat.link && <p className="text-xs text-primary mt-2 font-medium flex items-center gap-1">Ver detalhes <ArrowRight className="w-3 h-3" /></p>}
            </Card>
          );
          return stat.link ? <Link key={stat.label} to={stat.link}>{content}</Link> : content;
        })}
      </div>

      {/* Previsão do Tempo */}
      <PrevisaoTempo lavouras={lavouras} />

      {/* Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h2 className="text-base font-semibold mb-3">Alertas de Atividades</h2>
          <AlertasAtividades atividades={atividades} lavouras={lavouras} gerentes={gerentes} />
        </div>
        <div>
          <h2 className="text-base font-semibold mb-3">Alertas de Manutenção</h2>
          <AlertasManutencao manutencoes={manutencoes} maquinarios={maquinarios} />
        </div>
      </div>

      {/* Charts */}
      {canViewFinanceiro && <DashboardCharts despesas={despesas} lavouras={lavouras} />}

      {/* Recent Expenses */}
      {canViewFinanceiro && (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Despesas Recentes</h2>
          <Link to="/despesas" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <RecentExpenses despesas={despesas.slice(0, 5)} lavouras={lavouras} />
      </div>
      )}
    </div>
  );
}