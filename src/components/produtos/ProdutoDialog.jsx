import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, format } from "date-fns";

const categorias = ["Sementes", "Fertilizantes", "Defensivos", "Combustível", "Outros"];
const unidades = ["kg", "L", "un", "sc", "t", "m³"];
const formasPagamento = ["À Vista", "A Prazo 30 dias", "A Prazo 30/60 dias", "A Prazo 30/60/90 dias"];

function calcularVencimentos(dataCompra, forma) {
  if (!dataCompra || forma === "À Vista") return {};
  const base = new Date(dataCompra + "T00:00:00");
  const v1 = format(addDays(base, 30), "yyyy-MM-dd");
  if (forma === "A Prazo 30 dias") return { data_vencimento_1: v1 };
  const v2 = format(addDays(base, 60), "yyyy-MM-dd");
  if (forma === "A Prazo 30/60 dias") return { data_vencimento_1: v1, data_vencimento_2: v2 };
  const v3 = format(addDays(base, 90), "yyyy-MM-dd");
  return { data_vencimento_1: v1, data_vencimento_2: v2, data_vencimento_3: v3 };
}

export default function ProdutoDialog({ open, onOpenChange, produto, onSaved }) {
  const [form, setForm] = useState({
    nome: "", categoria: "Sementes", unidade: "kg",
    estoque_atual: "", estoque_minimo: "", preco_unitario: "", fornecedor: "", data_validade: "",
    forma_pagamento: "À Vista", data_compra: "",
    data_vencimento_1: "", data_vencimento_2: "", data_vencimento_3: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (produto) {
      setForm({
        nome: produto.nome || "",
        categoria: produto.categoria || "Sementes",
        unidade: produto.unidade || "kg",
        estoque_atual: produto.estoque_atual ?? "",
        estoque_minimo: produto.estoque_minimo ?? "",
        preco_unitario: produto.preco_unitario ?? "",
        fornecedor: produto.fornecedor || "",
        data_validade: produto.data_validade || "",
        forma_pagamento: produto.forma_pagamento || "À Vista",
        data_compra: produto.data_compra || "",
        data_vencimento_1: produto.data_vencimento_1 || "",
        data_vencimento_2: produto.data_vencimento_2 || "",
        data_vencimento_3: produto.data_vencimento_3 || "",
      });
    } else {
      setForm({
        nome: "", categoria: "Sementes", unidade: "kg",
        estoque_atual: "", estoque_minimo: "", preco_unitario: "", fornecedor: "", data_validade: "",
        forma_pagamento: "À Vista", data_compra: "",
        data_vencimento_1: "", data_vencimento_2: "", data_vencimento_3: "",
      });
    }
  }, [produto, open]);

  function handleFormaChange(forma) {
    const venc = calcularVencimentos(form.data_compra, forma);
    setForm(f => ({
      ...f, forma_pagamento: forma,
      data_vencimento_1: venc.data_vencimento_1 || "",
      data_vencimento_2: venc.data_vencimento_2 || "",
      data_vencimento_3: venc.data_vencimento_3 || "",
    }));
  }

  function handleDataCompraChange(data) {
    const venc = calcularVencimentos(data, form.forma_pagamento);
    setForm(f => ({
      ...f, data_compra: data,
      data_vencimento_1: venc.data_vencimento_1 || "",
      data_vencimento_2: venc.data_vencimento_2 || "",
      data_vencimento_3: venc.data_vencimento_3 || "",
    }));
  }

  async function handleSave() {
    setSaving(true);
    const data = {
      ...form,
      estoque_atual: Number(form.estoque_atual),
      estoque_minimo: form.estoque_minimo !== "" ? Number(form.estoque_minimo) : undefined,
      preco_unitario: Number(form.preco_unitario),
    };
    // Limpar campos de vencimento se for à vista
    if (data.forma_pagamento === "À Vista") {
      delete data.data_vencimento_1;
      delete data.data_vencimento_2;
      delete data.data_vencimento_3;
    }
    if (data.forma_pagamento !== "A Prazo 30/60 dias" && data.forma_pagamento !== "A Prazo 30/60/90 dias") {
      delete data.data_vencimento_2;
    }
    if (data.forma_pagamento !== "A Prazo 30/60/90 dias") {
      delete data.data_vencimento_3;
    }

    if (produto) {
      await base44.entities.Produto.update(produto.id, data);
    } else {
      await base44.entities.Produto.create(data);
    }
    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  const prazo = form.forma_pagamento !== "À Vista";
  const numParcelas = form.forma_pagamento === "A Prazo 30/60/90 dias" ? 3 : form.forma_pagamento === "A Prazo 30/60 dias" ? 2 : form.forma_pagamento === "A Prazo 30 dias" ? 1 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{produto ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Nome do Produto *</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Glifosato 480" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Categoria *</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unidade *</Label>
              <Select value={form.unidade} onValueChange={(v) => setForm({ ...form, unidade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{unidades.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Estoque Atual *</Label>
              <Input type="number" value={form.estoque_atual} onChange={(e) => setForm({ ...form, estoque_atual: e.target.value })} placeholder="0" />
            </div>
            <div>
              <Label>Estoque Mínimo</Label>
              <Input type="number" value={form.estoque_minimo} onChange={(e) => setForm({ ...form, estoque_minimo: e.target.value })} placeholder="Opcional" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Preço Unitário (R$) *</Label>
              <Input type="number" step="0.01" value={form.preco_unitario} onChange={(e) => setForm({ ...form, preco_unitario: e.target.value })} placeholder="0,00" />
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Input value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} placeholder="Opcional" />
            </div>
          </div>
          <div>
            <Label>Data de Validade</Label>
            <Input type="date" value={form.data_validade} onChange={(e) => setForm({ ...form, data_validade: e.target.value })} />
          </div>

          {/* Pagamento */}
          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold mb-3 text-foreground">Forma de Pagamento</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Forma de Pagamento</Label>
                <Select value={form.forma_pagamento} onValueChange={handleFormaChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {formasPagamento.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data da Compra</Label>
                <Input type="date" value={form.data_compra} onChange={(e) => handleDataCompraChange(e.target.value)} />
              </div>
            </div>

            {prazo && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">Datas de vencimento (calculadas automaticamente):</p>
                <div className={`grid gap-3 ${numParcelas === 3 ? "grid-cols-3" : numParcelas === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                  {numParcelas >= 1 && (
                    <div>
                      <Label className="text-xs">1ª Parcela (30 dias)</Label>
                      <Input type="date" value={form.data_vencimento_1} onChange={(e) => setForm({ ...form, data_vencimento_1: e.target.value })} />
                    </div>
                  )}
                  {numParcelas >= 2 && (
                    <div>
                      <Label className="text-xs">2ª Parcela (60 dias)</Label>
                      <Input type="date" value={form.data_vencimento_2} onChange={(e) => setForm({ ...form, data_vencimento_2: e.target.value })} />
                    </div>
                  )}
                  {numParcelas === 3 && (
                    <div>
                      <Label className="text-xs">3ª Parcela (90 dias)</Label>
                      <Input type="date" value={form.data_vencimento_3} onChange={(e) => setForm({ ...form, data_vencimento_3: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.nome || form.estoque_atual === "" || !form.preco_unitario}>
              {saving ? "Salvando..." : produto ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}