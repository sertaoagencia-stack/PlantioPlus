import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Package, AlertTriangle, Pencil, Trash2, CalendarClock, CreditCard } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProdutoDialog from "../components/produtos/ProdutoDialog";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    const data = await base44.entities.Produto.list("-created_date");
    setProdutos(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    await base44.entities.Produto.delete(id);
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const totalValorEstoque = produtos.reduce((s, p) => s + (p.estoque_atual || 0) * (p.preco_unitario || 0), 0);
  const abaixoMinimo = produtos.filter(p => p.estoque_minimo && p.estoque_atual < p.estoque_minimo);
  const vencendoEm30 = produtos.filter(p => {
    if (!p.data_validade) return false;
    const diff = differenceInDays(parseISO(p.data_validade), new Date());
    return diff >= 0 && diff <= 30;
  });
  const vencidos = produtos.filter(p => {
    if (!p.data_validade) return false;
    return differenceInDays(parseISO(p.data_validade), new Date()) < 0;
  });

  // Alertas de parcelas a prazo
  const parcelasAlerta = [];
  produtos.forEach(p => {
    if (!p.forma_pagamento || p.forma_pagamento === "À Vista") return;
    ["data_vencimento_1", "data_vencimento_2", "data_vencimento_3"].forEach((campo, idx) => {
      if (!p[campo]) return;
      const diff = differenceInDays(parseISO(p[campo]), new Date());
      if (diff < 0) {
        parcelasAlerta.push({ produto: p.nome, parcela: idx + 1, diff, vencida: true, data: p[campo] });
      } else if (diff <= 5) {
        parcelasAlerta.push({ produto: p.nome, parcela: idx + 1, diff, vencida: false, data: p[campo] });
      }
    });
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Produtos / Estoque</h1>
          <p className="text-muted-foreground mt-1">Gerencie insumos e materiais em estoque</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-none shadow-sm">
          <p className="text-sm text-muted-foreground">Total de Produtos</p>
          <p className="text-2xl font-bold mt-1">{produtos.length}</p>
        </Card>
        <Card className="p-5 border-none shadow-sm">
          <p className="text-sm text-muted-foreground">Valor em Estoque</p>
          <p className="text-2xl font-bold mt-1">R$ {totalValorEstoque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card className={`p-5 border-none shadow-sm ${abaixoMinimo.length > 0 ? "bg-amber-50" : ""}`}>
          <p className="text-sm text-muted-foreground">Estoque Crítico</p>
          <div className="flex items-center gap-2 mt-1">
            {abaixoMinimo.length > 0 && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            <p className="text-2xl font-bold">{abaixoMinimo.length}</p>
          </div>
        </Card>
        <Card className={`p-5 border-none shadow-sm sm:col-span-3 ${(vencendoEm30.length + vencidos.length) > 0 ? "bg-orange-50" : ""}`}>
          <p className="text-sm text-muted-foreground">Validade Próxima / Vencidos</p>
          <div className="flex items-center gap-2 mt-1">
            {(vencendoEm30.length + vencidos.length) > 0 && <CalendarClock className="w-5 h-5 text-orange-500" />}
            <p className="text-2xl font-bold">{vencendoEm30.length + vencidos.length}</p>
          </div>
        </Card>
      </div>

      {/* Alerta parcelas a prazo */}
      {parcelasAlerta.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50 border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-red-600" />
            <p className="font-semibold text-red-800 text-sm">
              {parcelasAlerta.filter(a => a.vencida).length > 0 && `${parcelasAlerta.filter(a => a.vencida).length} parcela(s) VENCIDA(S)`}
              {parcelasAlerta.filter(a => a.vencida).length > 0 && parcelasAlerta.filter(a => !a.vencida).length > 0 && " • "}
              {parcelasAlerta.filter(a => !a.vencida).length > 0 && `${parcelasAlerta.filter(a => !a.vencida).length} parcela(s) vencendo em até 5 dias`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {parcelasAlerta.map((a, i) => (
              <span key={i} className={`text-xs px-2 py-1 rounded-full ${a.vencida ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                {a.vencida ? "⚠️" : "🕐"} {a.produto} — {a.parcela}ª parcela {a.vencida ? `VENCIDA (${new Date(a.data).toLocaleDateString("pt-BR")})` : `vence em ${a.diff} dia(s)`}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Alerta validade */}
      {(vencidos.length > 0 || vencendoEm30.length > 0) && (
        <Card className="p-4 border-orange-200 bg-orange-50 border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock className="w-4 h-4 text-orange-600" />
            <p className="font-semibold text-orange-800 text-sm">
              {vencidos.length > 0 ? `${vencidos.length} produto(s) VENCIDO(S)` : ""}
              {vencidos.length > 0 && vencendoEm30.length > 0 ? " • " : ""}
              {vencendoEm30.length > 0 ? `${vencendoEm30.length} produto(s) vencendo em até 30 dias` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {vencidos.map(p => (
              <span key={p.id} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                ⚠️ {p.nome} — VENCIDO ({new Date(p.data_validade).toLocaleDateString("pt-BR")})
              </span>
            ))}
            {vencendoEm30.map(p => {
              const diff = differenceInDays(parseISO(p.data_validade), new Date());
              return (
                <span key={p.id} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                  🕐 {p.nome} — vence em {diff} dia(s)
                </span>
              );
            })}
          </div>
        </Card>
      )}

      {/* Alerta estoque baixo */}
      {abaixoMinimo.length > 0 && (
        <Card className="p-4 border-amber-200 bg-amber-50 border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="font-semibold text-amber-800 text-sm">Produtos com estoque abaixo do mínimo</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {abaixoMinimo.map(p => (
              <span key={p.id} className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                {p.nome} ({p.estoque_atual} {p.unidade})
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Products Grid */}
      {produtos.length === 0 ? (
        <Card className="p-12 text-center border-none shadow-sm">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhum produto cadastrado</h3>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2 mt-4">
            <Plus className="w-4 h-4" /> Cadastrar Produto
          </Button>
        </Card>
      ) : (
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">Produto</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Categoria</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Estoque</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Mínimo</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Preço Unit.</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Valor Total</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Validade</th>
                  <th className="p-4 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => {
                  const baixo = p.estoque_minimo && p.estoque_atual < p.estoque_minimo;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{p.nome}</p>
                          {p.fornecedor && <p className="text-xs text-muted-foreground">{p.fornecedor}</p>}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{p.categoria}</td>
                      <td className="p-4 text-right">
                        <span className={`font-semibold ${baixo ? "text-amber-600" : ""}`}>
                          {p.estoque_atual} {p.unidade}
                        </span>
                        {baixo && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 inline ml-1" />}
                      </td>
                      <td className="p-4 text-right text-muted-foreground">{p.estoque_minimo ? `${p.estoque_minimo} ${p.unidade}` : "—"}</td>
                      <td className="p-4 text-right">R$ {(p.preco_unitario || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td className="p-4 text-right font-semibold">R$ {((p.estoque_atual || 0) * (p.preco_unitario || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td className="p-4 text-right text-xs">
                        {p.data_validade ? (() => {
                          const diff = differenceInDays(parseISO(p.data_validade), new Date());
                          return <span className={diff < 0 ? "text-red-600 font-medium" : diff <= 30 ? "text-orange-500 font-medium" : "text-muted-foreground"}>{diff < 0 ? "Vencido" : `${diff}d`}</span>;
                        })() : "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditing(p); setDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-accent">
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile */}
          <div className="md:hidden divide-y divide-border">
            {produtos.map((p) => {
              const baixo = p.estoque_minimo && p.estoque_atual < p.estoque_minimo;
              return (
                <div key={p.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{p.nome}</p>
                    <p className="text-xs text-muted-foreground">{p.categoria}</p>
                    <p className={`text-xs font-medium ${baixo ? "text-amber-600" : "text-muted-foreground"}`}>
                      Estoque: {p.estoque_atual} {p.unidade}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">R$ {((p.estoque_atual || 0) * (p.preco_unitario || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    <div className="flex gap-1 mt-1 justify-end">
                      <button onClick={() => { setEditing(p); setDialogOpen(true); }} className="p-1 rounded hover:bg-accent">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1 rounded hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <ProdutoDialog open={dialogOpen} onOpenChange={setDialogOpen} produto={editing} onSaved={load} />
    </div>
  );
}