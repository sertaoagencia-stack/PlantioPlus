import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const tipos = ["Trator", "Colheitadeira", "Pulverizador", "Plantadeira", "Caminhão", "Moto", "Implemento", "Outro"];
const statusOpts = ["Ativo", "Em Manutenção", "Inativo"];

const empty = { nome: "", tipo: "Trator", marca: "", modelo: "", ano: "", placa: "", horas_uso_atual: "", quilometragem_atual: "", status: "Ativo", observacoes: "" };

export default function MaquinarioDialog({ open, onOpenChange, maquinario, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (maquinario) {
      setForm({ ...empty, ...maquinario });
    } else {
      setForm(empty);
    }
  }, [maquinario, open]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const data = {
      ...form,
      ano: form.ano ? Number(form.ano) : undefined,
      horas_uso_atual: form.horas_uso_atual !== "" ? Number(form.horas_uso_atual) : undefined,
      quilometragem_atual: form.quilometragem_atual !== "" ? Number(form.quilometragem_atual) : undefined,
    };
    if (maquinario) {
      await base44.entities.Maquinario.update(maquinario.id, data);
    } else {
      await base44.entities.Maquinario.create(data);
    }
    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{maquinario ? "Editar Equipamento" : "Novo Equipamento"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Ex: Trator John Deere 5075" />
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={v => set("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statusOpts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Marca</Label>
              <Input value={form.marca} onChange={e => set("marca", e.target.value)} placeholder="Ex: John Deere" />
            </div>
            <div>
              <Label>Modelo</Label>
              <Input value={form.modelo} onChange={e => set("modelo", e.target.value)} placeholder="Ex: 5075E" />
            </div>
            <div>
              <Label>Ano</Label>
              <Input type="number" value={form.ano} onChange={e => set("ano", e.target.value)} placeholder="Ex: 2020" />
            </div>
            <div>
              <Label>Placa / Nº de Série</Label>
              <Input value={form.placa} onChange={e => set("placa", e.target.value)} placeholder="Ex: ABC-1234" />
            </div>
            <div>
              <Label>Horas de Uso Atual</Label>
              <Input type="number" value={form.horas_uso_atual} onChange={e => set("horas_uso_atual", e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label>Quilometragem (km)</Label>
              <Input type="number" value={form.quilometragem_atual} onChange={e => set("quilometragem_atual", e.target.value)} placeholder="0" />
            </div>
            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)} placeholder="Informações adicionais..." rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.nome}>
              {saving ? "Salvando..." : maquinario ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}