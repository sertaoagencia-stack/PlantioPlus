import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, FileCheck } from "lucide-react";

const categorias = ["Sementes", "Fertilizantes", "Defensivos", "Mão de Obra", "Maquinário", "Combustível", "Irrigação", "Frete", "Manutenção", "Outros"];

export default function DespesaDialog({ open, onOpenChange, despesa, lavouras, onSaved }) {
  const [form, setForm] = useState({
    descricao: "", valor: "", categoria: "Sementes", data: "", lavoura_id: "", fornecedor: "", nota_fiscal: "",
    produto_id: "", quantidade_produto: "", comprovante_url: "",
  });
  const [usarProduto, setUsarProduto] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    base44.entities.Produto.list().then(setProdutos);
  }, [open]);

  useEffect(() => {
    if (despesa) {
      setUsarProduto(!!despesa.produto_id);
      setForm({
        descricao: despesa.descricao || "",
        valor: despesa.valor || "",
        categoria: despesa.categoria || "Sementes",
        data: despesa.data || "",
        lavoura_id: despesa.lavoura_id || "",
        fornecedor: despesa.fornecedor || "",
        nota_fiscal: despesa.nota_fiscal || "",
        produto_id: despesa.produto_id || "",
        quantidade_produto: despesa.quantidade_produto || "",
        comprovante_url: despesa.comprovante_url || "",
      });
    } else {
      setUsarProduto(false);
      setForm({
        descricao: "", valor: "", categoria: "Sementes",
        data: new Date().toISOString().split("T")[0],
        lavoura_id: lavouras?.length > 0 ? lavouras[0].id : "",
        fornecedor: "", nota_fiscal: "", produto_id: "", quantidade_produto: "", comprovante_url: "",
      });
    }
  }, [despesa, open, lavouras]);

  // Auto-fill valor when product and quantity selected
  function handleProdutoChange(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    setForm(f => ({
      ...f,
      produto_id: produtoId,
      categoria: produto?.categoria || f.categoria,
      valor: f.quantidade_produto && produto ? String(Number(f.quantidade_produto) * produto.preco_unitario) : f.valor,
    }));
  }

  function handleQuantidadeChange(qty) {
    const produto = produtos.find(p => p.id === form.produto_id);
    setForm(f => ({
      ...f,
      quantidade_produto: qty,
      valor: produto && qty ? String(Number(qty) * produto.preco_unitario) : f.valor,
    }));
  }

  async function handleSave() {
    setSaving(true);
    const data = {
      ...form,
      valor: Number(form.valor),
      produto_id: usarProduto ? form.produto_id : undefined,
      quantidade_produto: usarProduto && form.quantidade_produto ? Number(form.quantidade_produto) : undefined,
    };

    if (despesa) {
      await base44.entities.Despesa.update(despesa.id, data);
      // If product changed quantity, adjust stock
      if (usarProduto && form.produto_id && form.quantidade_produto) {
        const oldQty = despesa.produto_id === form.produto_id ? (despesa.quantidade_produto || 0) : 0;
        const newQty = Number(form.quantidade_produto);
        const diff = newQty - oldQty;
        if (diff !== 0) {
          const produto = produtos.find(p => p.id === form.produto_id);
          if (produto) {
            await base44.entities.Produto.update(form.produto_id, {
              estoque_atual: Math.max(0, (produto.estoque_atual || 0) - diff),
            });
          }
        }
      }
    } else {
      await base44.entities.Despesa.create(data);
      // Deduct from stock
      if (usarProduto && form.produto_id && form.quantidade_produto) {
        const produto = produtos.find(p => p.id === form.produto_id);
        if (produto) {
          await base44.entities.Produto.update(form.produto_id, {
            estoque_atual: Math.max(0, (produto.estoque_atual || 0) - Number(form.quantidade_produto)),
          });
        }
      }
    }

    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  const selectedProduto = produtos.find(p => p.id === form.produto_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{despesa ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Descrição *</Label>
            <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Aplicação de herbicida" />
          </div>

          {/* Toggle usar produto do estoque */}
          <div className="flex items-center justify-between p-3 bg-accent rounded-xl">
            <div>
              <p className="text-sm font-medium">Usar produto do estoque</p>
              <p className="text-xs text-muted-foreground">Desconta automaticamente do estoque</p>
            </div>
            <Switch checked={usarProduto} onCheckedChange={setUsarProduto} />
          </div>

          {usarProduto && (
            <div className="space-y-3 border border-primary/20 rounded-xl p-3 bg-primary/5">
              <div>
                <Label>Produto *</Label>
                <Select value={form.produto_id} onValueChange={handleProdutoChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                  <SelectContent>
                    {produtos.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome} (estoque: {p.estoque_atual} {p.unidade})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantidade utilizada ({selectedProduto?.unidade || "unid."}) *</Label>
                <Input type="number" value={form.quantidade_produto} onChange={(e) => handleQuantidadeChange(e.target.value)} placeholder="0" />
              </div>
              {selectedProduto && form.quantidade_produto && (
                <p className="text-xs text-muted-foreground">
                  Estoque após: {Math.max(0, selectedProduto.estoque_atual - Number(form.quantidade_produto))} {selectedProduto.unidade}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor (R$) *</Label>
              <Input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" step="0.01" />
            </div>
            <div>
              <Label>Data *</Label>
              <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
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
              <Label>Lavoura *</Label>
              <Select value={form.lavoura_id} onValueChange={(v) => setForm({ ...form, lavoura_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{lavouras.map(l => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fornecedor</Label>
              <Input value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} placeholder="Opcional" />
            </div>
            <div>
              <Label>Nota Fiscal</Label>
              <Input value={form.nota_fiscal} onChange={(e) => setForm({ ...form, nota_fiscal: e.target.value })} placeholder="Opcional" />
            </div>
          </div>
          {/* Comprovante */}
          <div className="space-y-2">
            <Label>Comprovante de Pagamento</Label>
            {form.comprovante_url ? (
              <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <FileCheck className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary">Comprovante anexado</p>
                  <a href={form.comprovante_url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline truncate block">Ver arquivo</a>
                </div>
                <button onClick={() => setForm(f => ({ ...f, comprovante_url: "" }))} className="text-xs text-destructive hover:underline shrink-0">Remover</button>
              </div>
            ) : (
              <label className={`flex items-center gap-3 p-3 rounded-xl border border-dashed border-border cursor-pointer hover:bg-accent/30 transition-colors ${uploadingFile ? "opacity-60 pointer-events-none" : ""}`}>
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{uploadingFile ? "Enviando..." : "Clique para anexar (imagem ou PDF)"}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingFile(true);
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    setForm(f => ({ ...f, comprovante_url: file_url }));
                    setUploadingFile(false);
                  }}
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || uploadingFile || !form.descricao || !form.valor || !form.data || !form.lavoura_id}>
              {saving ? "Salvando..." : despesa ? "Salvar" : "Registrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}