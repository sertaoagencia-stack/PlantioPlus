import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const tipos = ["Preventiva", "Corretiva", "Revisão Geral", "Troca de Óleo", "Filtros", "Pneus", "Elétrica", "Outro"];
const statusOpts = ["Agendada", "Em Andamento", "Concluída", "Cancelada"];
const gatilhos = ["Data", "Horas de Uso", "Ambos"];

const empty = { maquinario_id: "", titulo: "", tipo: "Preventiva", status: "Agendada", gatilho: "Data", data_prevista: "", data_realizada: "", horas_previstas: "", custo: "", responsavel: "", observacoes: "" };

export default function ManutencaoDialog({ open, onOpenChange, manutencao, maquinarios, defaultMaquinarioId, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (manutencao) {
      setForm({ ...empty, ...manutencao });
    } else {
      setForm({ ...empty, maquinario_id: defaultMaquinarioId || "", data_prevista: new Date().toISOString().split("T")[0] });
    }
  }, [manutencao, open, defaultMaquinarioId]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const data = {
      ...form,
      horas_previstas: form.horas_previstas !== "" ? Number(form.horas_previstas) : undefined,
      custo: form.custo !== "" ? Number(form.custo) : undefined,
    };
    if (manutencao) {
      await base44.entities.ManutencaoMaquinario.update(manutencao.id, data);
    } else {
      await base44.entities.ManutencaoMaquinario.create(data);
    }
    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  const showData = form.gatilho === "Data" || form.gatilho === "Ambos";
  const showHoras = form.gatilho === "Horas de Uso" || form.gatilho === "Ambos";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{manutencao ? "Editar Manutenção" : "Agendar Manutenção"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Equipamento *</Label>
            <Select value={form.maquinario_id} onValueChange={v => set("maquinario_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o equipamento" /></SelectTrigger>
              <SelectContent>{maquinarios.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Título *</Label>
            <Input value={form.titulo} onChange={e => set("titulo", e.target.value)} placeholder="Ex: Troca de óleo 250h" />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div>
            <Label>Gatilho de Alerta</Label>
            <Select value={form.gatilho} onValueChange={v => set("gatilho", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{gatilhos.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {showData && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Prevista</Label>
                <Input type="date" value={form.data_prevista} onChange={e => set("data_prevista", e.target.value)} />
              </div>
              <div>
                <Label>Data Realizada</Label>
                <Input type="date" value={form.data_realizada} onChange={e => set("data_realizada", e.target.value)} />
              </div>
            </div>
          )}

          {showHoras && (
            <div>
              <Label>Horas Previstas para Revisão</Label>
              <Input type="number" value={form.horas_previstas} onChange={e => set("horas_previstas", e.target.value)} placeholder="Ex: 500" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Custo (R$)</Label>
              <Input type="number" value={form.custo} onChange={e => set("custo", e.target.value)} placeholder="0,00" />
            </div>
            <div>
              <Label>Responsável / Oficina</Label>
              <Input value={form.responsavel} onChange={e => set("responsavel", e.target.value)} placeholder="Ex: Oficina do João" />
            </div>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)} placeholder="Detalhes adicionais..." rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.maquinario_id || !form.titulo}>
              {saving ? "Salvando..." : manutencao ? "Salvar" : "Agendar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}