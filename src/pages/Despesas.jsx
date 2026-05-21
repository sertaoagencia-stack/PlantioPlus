import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Receipt, Search, Trash2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DespesaDialog from "../components/despesas/DespesaDialog";

const categorias = ["Todas", "Sementes", "Fertilizantes", "Defensivos", "Mão de Obra", "Maquinário", "Combustível", "Irrigação", "Frete", "Manutenção", "Outros"];

const categoryEmojis = {
  Sementes: "🌱", Fertilizantes: "🧪", Defensivos: "🛡️", "Mão de Obra": "👷",
  Maquinário: "🚜", Combustível: "⛽", Irrigação: "💧", Frete: "🚚", Manutenção: "🔧", Outros: "📦",
};

export default function Despesas() {
  const [despesas, setDespesas] = useState([]);
  const [lavouras, setLavouras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterLavoura, setFilterLavoura] = useState("Todas");

  async function load() {
    const [desps, lavs] = await Promise.all([
      base44.entities.Despesa.list("-data", 200),
      base44.entities.Lavoura.list(),
    ]);
    setDespesas(desps);
    setLavouras(lavs);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const lavMap = {};
  lavouras.forEach((l) => (lavMap[l.id] = l.nome));

  const filtered = despesas.filter((d) => {
    if (filterCategoria !== "Todas" && d.categoria !== filterCategoria) return false;
    if (filterLavoura !== "Todas" && d.lavoura_id !== filterLavoura) return false;
    if (search && !d.descricao?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalFiltered = filtered.reduce((sum, d) => sum + (d.valor || 0), 0);

  async function handleDelete(id) {
    const despesa = despesas.find(d => d.id === id);
    await base44.entities.Despesa.delete(id);
    // Devolve estoque se havia produto associado
    if (despesa?.produto_id && despesa?.quantidade_produto) {
      const produtos = await base44.entities.Produto.list();
      const produto = produtos.find(p => p.id === despesa.produto_id);
      if (produto) {
        await base44.entities.Produto.update(despesa.produto_id, {
          estoque_atual: (produto.estoque_atual || 0) + Number(despesa.quantidade_produto),
        });
      }
    }
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground mt-1">Controle todos os gastos das suas lavouras</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Despesa
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-none shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar despesa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategoria} onValueChange={setFilterCategoria}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterLavoura} onValueChange={setFilterLavoura}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Lavoura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas as Lavouras</SelectItem>
              {lavouras.map((l) => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 text-sm text-muted-foreground">
          {filtered.length} despesas • Total: <span className="font-semibold text-foreground">R$ {totalFiltered.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center border-none shadow-sm">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhuma despesa encontrada</h3>
          <p className="text-muted-foreground text-sm mb-6">
            {despesas.length === 0 ? "Comece registrando sua primeira despesa" : "Tente ajustar os filtros"}
          </p>
          {despesas.length === 0 && (
            <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2">
              <Plus className="w-4 h-4" /> Registrar Despesa
            </Button>
          )}
        </Card>
      ) : (
        <Card className="border-none shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">Descrição</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Categoria</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Lavoura</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Data</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Valor</th>
                  <th className="p-4 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{categoryEmojis[d.categoria] || "📦"}</span>
                        <div>
                          <p className="font-medium">{d.descricao}</p>
                          {d.fornecedor && <p className="text-xs text-muted-foreground">{d.fornecedor}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{d.categoria}</td>
                    <td className="p-4 text-muted-foreground">{lavMap[d.lavoura_id] || "—"}</td>
                    <td className="p-4 text-muted-foreground">{d.data ? new Date(d.data).toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="p-4 text-right font-semibold">R$ {(d.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(d); setDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-accent">
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="md:hidden divide-y divide-border">
            {filtered.map((d) => (
              <div key={d.id} className="p-4 flex items-center gap-3">
                <span className="text-xl">{categoryEmojis[d.categoria] || "📦"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{d.descricao}</p>
                  <p className="text-xs text-muted-foreground">{d.categoria} • {lavMap[d.lavoura_id] || "—"}</p>
                  <p className="text-xs text-muted-foreground">{d.data ? new Date(d.data).toLocaleDateString("pt-BR") : "—"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">R$ {(d.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <div className="flex gap-1 mt-1 justify-end">
                    <button onClick={() => { setEditing(d); setDialogOpen(true); }} className="p-1 rounded hover:bg-accent">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="p-1 rounded hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <DespesaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        despesa={editing}
        lavouras={lavouras}
        onSaved={load}
      />
    </div>
  );
}