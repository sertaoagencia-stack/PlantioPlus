import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function InsumoLavouraDialog({ open, onOpenChange, lavouraId, produtos, onSaved }) {
  const [form, setForm] = useState({ produto_id: "", quantidade: "", data_uso: new Date().toISOString().split("T")[0], observacao: "" });
  const [saving, setSaving] = useState(false);

  const selectedProduto = produtos.find(p => p.id === form.produto_id);

  function handleProdutoChange(id) {
    setForm(f => ({ ...f, produto_id: id }));
  }

  function handleQtyChange(qty) {
    setForm(f => ({ ...f, quantidade: qty }));
  }

  async function handleSave() {
    setSaving(true);
    await base44.entities.LavouraInsumo.create({
      lavoura_id: lavouraId,
      produto_id: form.produto_id,
      quantidade: Number(form.quantidade),
      data_uso: form.data_uso,
      observacao: form.observacao || undefined,
    });
    // Deduct from stock
    if (selectedProduto) {
      await base44.entities.Produto.update(form.produto_id, {
        estoque_atual: Math.max(0, (selectedProduto.estoque_atual || 0) - Number(form.quantidade)),
      });
    }
    setSaving(false);
    onOpenChange(false);
    setForm({ produto_id: "", quantidade: "", data_uso: new Date().toISOString().split("T")[0], observacao: "" });
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Insumo à Lavoura</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Produto *</Label>
            <Select value={form.produto_id} onValueChange={handleProdutoChange}>
              <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
              <SelectContent>
                {produtos.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome} — estoque: {p.estoque_atual} {p.unidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantidade ({selectedProduto?.unidade || "unid."}) *</Label>
              <Input type="number" value={form.quantidade} onChange={e => handleQtyChange(e.target.value)} placeholder="0" />
              {selectedProduto && form.quantidade && (
                <p className="text-xs text-muted-foreground mt-1">
                  Estoque após: {Math.max(0, selectedProduto.estoque_atual - Number(form.quantidade))} {selectedProduto.unidade}
                </p>
              )}
            </div>
            <div>
              <Label>Data de Uso *</Label>
              <Input type="date" value={form.data_uso} onChange={e => setForm(f => ({ ...f, data_uso: e.target.value }))} />
            </div>
          </div>
          {selectedProduto && (
            <div className="text-sm p-3 bg-primary/5 rounded-xl">
              <p className="font-medium">{selectedProduto.nome}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Preço: R$ {selectedProduto.preco_unitario?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / {selectedProduto.unidade}
                {form.quantidade && ` • Total: R$ ${(Number(form.quantidade) * selectedProduto.preco_unitario).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              </p>
            </div>
          )}
          <div>
            <Label>Observação</Label>
            <Textarea value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))} rows={2} placeholder="Opcional" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.produto_id || !form.quantidade}>
              {saving ? "Salvando..." : "Adicionar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}