import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addMonths, format } from "date-fns";

const PLANOS = ["Básico", "Profissional", "Enterprise"];
const STATUS = ["Ativo", "Inativo", "Trial"];

export default function ClienteDialog({ open, onOpenChange, cliente, onSaved }) {
  const [form, setForm] = useState({
    nome_empresa: "", responsavel: "", email: "", telefone: "",
    plano: "Profissional", status: "Ativo",
    data_inicio: "", tempo_uso_meses: "", data_vencimento: "", observacoes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cliente) {
      setForm({
        nome_empresa: cliente.nome_empresa || "",
        responsavel: cliente.responsavel || "",
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        plano: cliente.plano || "Profissional",
        status: cliente.status || "Ativo",
        data_inicio: cliente.data_inicio || "",
        tempo_uso_meses: cliente.tempo_uso_meses || "",
        data_vencimento: cliente.data_vencimento || "",
        observacoes: cliente.observacoes || "",
      });
    } else {
      setForm({
        nome_empresa: "", responsavel: "", email: "", telefone: "",
        plano: "Profissional", status: "Ativo",
        data_inicio: format(new Date(), "yyyy-MM-dd"),
        tempo_uso_meses: "", data_vencimento: "", observacoes: "",
      });
    }
  }, [cliente, open]);

  // Calcular data de vencimento automaticamente ao mudar inicio ou tempo_uso_meses
  function handleTempoUso(meses) {
    setForm(f => {
      const novoForm = { ...f, tempo_uso_meses: meses };
      if (f.data_inicio && meses) {
        try {
          const vencimento = addMonths(new Date(f.data_inicio), Number(meses));
          novoForm.data_vencimento = format(vencimento, "yyyy-MM-dd");
        } catch {}
      }
      return novoForm;
    });
  }

  function handleDataInicio(data) {
    setForm(f => {
      const novoForm = { ...f, data_inicio: data };
      if (data && f.tempo_uso_meses) {
        try {
          const vencimento = addMonths(new Date(data), Number(f.tempo_uso_meses));
          novoForm.data_vencimento = format(vencimento, "yyyy-MM-dd");
        } catch {}
      }
      return novoForm;
    });
  }

  async function handleSave() {
    setSaving(true);
    const data = { ...form };
    if (!data.tempo_uso_meses) delete data.tempo_uso_meses;
    if (!data.data_vencimento) delete data.data_vencimento;
    if (!data.data_inicio) delete data.data_inicio;
    if (cliente) {
      await base44.entities.Cliente.update(cliente.id, data);
    } else {
      await base44.entities.Cliente.create(data);
    }
    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome da Empresa *</Label>
              <Input value={form.nome_empresa} onChange={e => setForm(f => ({ ...f, nome_empresa: e.target.value }))} placeholder="Ex: Fazenda São João LTDA" />
            </div>
            <div>
              <Label>Responsável</Label>
              <Input value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} placeholder="Nome do contato" />
            </div>
            <div>
              <Label>Telefone / WhatsApp</Label>
              <Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
            </div>
            <div className="col-span-2">
              <Label>E-mail *</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contato@empresa.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Plano</Label>
              <Select value={form.plano} onValueChange={v => setForm(f => ({ ...f, plano: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLANOS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Data de Início</Label>
              <Input type="date" value={form.data_inicio} onChange={e => handleDataInicio(e.target.value)} />
            </div>
            <div>
              <Label>Tempo de Uso (meses)</Label>
              <Input
                type="number" min="1"
                value={form.tempo_uso_meses}
                onChange={e => handleTempoUso(e.target.value)}
                placeholder="Ex: 12"
              />
            </div>
            <div>
              <Label>Data de Vencimento</Label>
              <Input type="date" value={form.data_vencimento} onChange={e => setForm(f => ({ ...f, data_vencimento: e.target.value }))} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">💡 A data de vencimento é calculada automaticamente ao preencher o tempo de uso.</p>

          <div>
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={2} placeholder="Opcional" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.nome_empresa || !form.email}>
              {saving ? "Salvando..." : cliente ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}