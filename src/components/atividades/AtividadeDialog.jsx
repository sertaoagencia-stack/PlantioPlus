import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isBefore, isToday, parseISO, startOfDay } from "date-fns";

const tipos = ["Plantio", "Adubação", "Aplicação de Defensivo", "Irrigação", "Colheita", "Manutenção", "Monitoramento", "Outro"];
const statusOptions = ["Pendente", "Em Andamento", "Concluída", "Cancelada"];

// isFutureDate: data é ESTRITAMENTE futura (depois de hoje)
function isFutureDate(dateStr) {
  if (!dateStr) return false;
  const d = parseISO(dateStr);
  return !isToday(d) && !isBefore(d, startOfDay(new Date()));
}

export default function AtividadeDialog({ open, onOpenChange, atividade, lavouraId, lavouras, onSaved, preselectedDate }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [form, setForm] = useState({
    lavoura_id: lavouraId || "", titulo: "", tipo: "Plantio",
    data_prevista: "", data_realizada: "", status: "Pendente", responsavel: "", observacoes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Funcionario.filter({ status: "Ativo" }).then(setFuncionarios);
  }, []);

  useEffect(() => {
    if (atividade) {
      setForm({
        lavoura_id: atividade.lavoura_id || lavouraId || "",
        titulo: atividade.titulo || "",
        tipo: atividade.tipo || "Plantio",
        data_prevista: atividade.data_prevista || "",
        data_realizada: atividade.data_realizada || "",
        status: atividade.status || "Pendente",
        responsavel: atividade.responsavel || "",
        observacoes: atividade.observacoes || "",
      });
    } else {
      const dateStr = preselectedDate || "";
      setForm({
        lavoura_id: lavouraId || lavouras?.[0]?.id || "",
        titulo: "", tipo: "Plantio",
        data_prevista: dateStr,
        data_realizada: "",
        status: "Pendente",
        responsavel: "", observacoes: "",
      });
    }
  }, [atividade, open, lavouraId, preselectedDate]);

  async function handleSave() {
    setSaving(true);
    const data = { ...form };
    if (!data.data_realizada) delete data.data_realizada;
    // Se data futura, sempre Pendente, sem data_realizada
    if (isFutureDate(data.data_prevista)) {
      data.status = "Pendente";
      delete data.data_realizada;
    }
    if (atividade) {
      await base44.entities.Atividade.update(atividade.id, data);
    } else {
      await base44.entities.Atividade.create(data);
    }
    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  // Para criação: determinar se a data selecionada é futura
  const isFuture = !atividade && isFutureDate(form.data_prevista);
  // Data passada/hoje: esconde campos de data mas mantém status
  const isPastOrToday = !atividade && form.data_prevista && !isFutureDate(form.data_prevista);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{atividade ? "Editar Atividade" : "Nova Atividade"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Lavoura *</Label>
            <Select value={form.lavoura_id} onValueChange={v => setForm(f => ({ ...f, lavoura_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione a lavoura" /></SelectTrigger>
              <SelectContent>{lavouras.map(l => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Título *</Label>
            <Input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Aplicação de herbicida pré-emergente" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {/* Status: oculto para datas futuras (sempre Pendente), visível para passadas/hoje e edição */}
            {(!isFuture) && (
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Datas: apenas na edição */}
          {atividade && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Prevista *</Label>
                <Input type="date" value={form.data_prevista} onChange={e => setForm(f => ({ ...f, data_prevista: e.target.value }))} />
              </div>
              <div>
                <Label>Data Realizada</Label>
                <Input type="date" value={form.data_realizada} onChange={e => setForm(f => ({ ...f, data_realizada: e.target.value }))} />
              </div>
            </div>
          )}

          <div>
            <Label>Responsável</Label>
            <Select value={form.responsavel} onValueChange={v => setForm(f => ({ ...f, responsavel: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione um funcionário" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Nenhum</SelectItem>
                {funcionarios.map(f => <SelectItem key={f.id} value={f.nome}>{f.nome} {f.cargo ? `— ${f.cargo}` : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={2} placeholder="Opcional" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.titulo}>
              {saving ? "Salvando..." : atividade ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}