import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "lucide-react";

const categoriaCores = {
  Sementes: "bg-green-100 text-green-700",
  Fertilizantes: "bg-blue-100 text-blue-700",
  Defensivos: "bg-red-100 text-red-700",
  "Mão de Obra": "bg-purple-100 text-purple-700",
  Maquinário: "bg-orange-100 text-orange-700",
  Combustível: "bg-amber-100 text-amber-700",
  Irrigação: "bg-cyan-100 text-cyan-700",
  Frete: "bg-indigo-100 text-indigo-700",
  Manutenção: "bg-gray-100 text-gray-700",
  Outros: "bg-muted text-muted-foreground",
};

export default function DespesasLavouraTab({ lavouraId }) {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Despesa.filter({ lavoura_id: lavouraId }, "-data");
      setDespesas(data);
      setLoading(false);
    }
    load();
  }, [lavouraId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const total = despesas.reduce((s, d) => s + (d.valor || 0), 0);

  const porCategoria = despesas.reduce((acc, d) => {
    acc[d.categoria] = (acc[d.categoria] || 0) + (d.valor || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Totalizador */}
      <div className="flex items-center justify-between p-4 bg-accent/30 rounded-xl">
        <div>
          <p className="text-sm text-muted-foreground">Total de despesas nesta lavoura</p>
          <p className="text-2xl font-bold mt-0.5">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{despesas.length} lançamento(s)</p>
        </div>
      </div>

      {/* Resumo por categoria */}
      {Object.keys(porCategoria).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(porCategoria).map(([cat, valor]) => (
            <span key={cat} className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoriaCores[cat] || "bg-muted text-muted-foreground"}`}>
              {cat}: R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          ))}
        </div>
      )}

      {/* Lista */}
      {despesas.length === 0 ? (
        <Card className="p-10 text-center border-none shadow-sm">
          <Receipt className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">Nenhuma despesa registrada nesta lavoura</p>
          <p className="text-xs text-muted-foreground mt-1">Acesse o módulo de Despesas para lançar gastos vinculados a esta lavoura.</p>
        </Card>
      ) : (
        <Card className="border-none shadow-sm divide-y divide-border overflow-hidden">
          {despesas.map(d => (
            <div key={d.id} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{d.descricao}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${categoriaCores[d.categoria] || "bg-muted text-muted-foreground"}`}>
                    {d.categoria}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {d.data ? new Date(d.data).toLocaleDateString("pt-BR") : "—"}
                  </span>
                  {d.fornecedor && <span className="text-xs text-muted-foreground">• {d.fornecedor}</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm">R$ {(d.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}