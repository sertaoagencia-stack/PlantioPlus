import { Card } from "@/components/ui/card";

const categoryIcons = {
  Sementes: "🌱",
  Fertilizantes: "🧪",
  Defensivos: "🛡️",
  "Mão de Obra": "👷",
  Maquinário: "🚜",
  Combustível: "⛽",
  Irrigação: "💧",
  Frete: "🚚",
  Manutenção: "🔧",
  Outros: "📦",
};

export default function RecentExpenses({ despesas, lavouras }) {
  const lavMap = {};
  lavouras.forEach((l) => (lavMap[l.id] = l.nome));

  if (despesas.length === 0) {
    return (
      <Card className="p-6 text-center border-none shadow-sm">
        <p className="text-muted-foreground text-sm">Nenhuma despesa recente</p>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm divide-y divide-border">
      {despesas.map((d) => (
        <div key={d.id} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-lg shrink-0">
            {categoryIcons[d.categoria] || "📦"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{d.descricao}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {d.categoria} • {lavMap[d.lavoura_id] || "—"}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold text-sm">
              R$ {(d.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {d.data ? new Date(d.data).toLocaleDateString("pt-BR") : "—"}
            </p>
          </div>
        </div>
      ))}
    </Card>
  );
}