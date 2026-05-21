import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tipos = ["Venda de Produção", "Subsídio", "Seguro", "Outros"];

export default function ReceitaDialog({ open, onOpenChange, receita, lavouras, onSaved }) {
  const [form, setForm] = useState({ lavoura_id: "", descricao: "", valor: "", data: "", tipo: "Venda de Produção" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (receita) {
      setForm({ lavoura_id: receita.lavoura_id || "", descricao: receita.descricao || "", valor: receita.valor || "", data: receita.data || "", tipo: receita.tipo || "Venda de Produção" });
    } else {
      setForm({ lavoura_id: lavouras?.[0]?.id || "", descricao: "", valor: "", data: new Date().toISOString().split("T")[0], tipo: "Venda de Produção" });
    }
  }, [receita, open, lavouras]);

  async function handleSave() {
    setSaving(true);
    const data = { ...form, valor: Number(form.valor) };
    if (receita) {
      await base44.entities.Receita.update(receita.id, data);
    } else {
      await base44.entities.Receita.create(data);
    }
    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{receita ? "Editar Receita" : "Nova Receita"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Lavoura *</Label>
            <Select value={form.lavoura_id} onValueChange={(v) => setForm({ ...form, lavoura_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{lavouras.map(l => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Descrição *</Label>
            <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Venda de soja safra 2025" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data *</Label>
              <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Valor (R$) *</Label>
            <Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.descricao || !form.valor || !form.lavoura_id}>
              {saving ? "Salvando..." : receita ? "Salvar" : "Registrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}