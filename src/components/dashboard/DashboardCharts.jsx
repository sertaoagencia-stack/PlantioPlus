import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "hsl(152, 55%, 28%)",
  "hsl(42, 80%, 52%)",
  "hsl(200, 60%, 45%)",
  "hsl(30, 70%, 50%)",
  "hsl(280, 50%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(170, 50%, 40%)",
  "hsl(320, 60%, 50%)",
  "hsl(60, 70%, 45%)",
  "hsl(240, 50%, 55%)",
];

export default function DashboardCharts({ despesas, lavouras }) {
  // Group by category
  const byCategory = {};
  despesas.forEach((d) => {
    byCategory[d.categoria] = (byCategory[d.categoria] || 0) + (d.valor || 0);
  });
  const pieData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Group by lavoura
  const lavMap = {};
  lavouras.forEach((l) => (lavMap[l.id] = l.nome));
  const byLavoura = {};
  despesas.forEach((d) => {
    const name = lavMap[d.lavoura_id] || "Sem lavoura";
    byLavoura[name] = (byLavoura[name] || 0) + (d.valor || 0);
  });
  const barData = Object.entries(byLavoura)
    .map(([name, valor]) => ({ name, valor }))
    .sort((a, b) => b.valor - a.valor);

  if (despesas.length === 0) {
    return (
      <Card className="p-8 text-center border-none shadow-sm">
        <p className="text-muted-foreground">Nenhuma despesa registrada ainda. Comece adicionando sua primeira despesa!</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pie Chart - By Category */}
      <Card className="p-5 border-none shadow-sm">
        <h3 className="font-semibold mb-4">Gastos por Categoria</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {pieData.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Bar Chart - By Lavoura */}
      <Card className="p-5 border-none shadow-sm">
        <h3 className="font-semibold mb-4">Gastos por Lavoura</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} fontSize={12} />
              <YAxis type="category" dataKey="name" width={100} fontSize={12} />
              <Tooltip
                formatter={(val) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              />
              <Bar dataKey="valor" fill="hsl(152, 55%, 28%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}