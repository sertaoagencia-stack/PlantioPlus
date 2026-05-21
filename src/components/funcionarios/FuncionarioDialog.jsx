import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Mail, ShieldCheck } from "lucide-react";

const MODULOS = [
  { key: "lavouras", label: "Lavouras", desc: "Ver e gerenciar lavouras" },
  { key: "atividades", label: "Atividades", desc: "Ver e cadastrar atividades" },
  { key: "despesas", label: "Despesas", desc: "Ver e lançar despesas" },
  { key: "produtos", label: "Estoque", desc: "Gerenciar estoque de produtos" },
  { key: "funcionarios", label: "Funcionários", desc: "Ver equipe e enviar relatórios" },
  { key: "frota", label: "Frota", desc: "Gerenciar maquinário e manutenções" },
  { key: "relatorio", label: "Rentabilidade", desc: "Ver relatórios financeiros" },
];

const DEFAULT_MODULOS = ["lavouras", "atividades"];

export default function FuncionarioDialog({ open, onOpenChange, funcionario, onSaved }) {
  const [form, setForm] = useState({
    nome: "", email: "", telefone: "", cargo: "",
    status: "Ativo", modulos_acesso: DEFAULT_MODULOS, observacoes: "",
  });
  const [saving, setSaving] = useState(false);
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const [conviteEnviado, setConviteEnviado] = useState(false);

  useEffect(() => {
    if (funcionario) {
      setForm({
        nome: funcionario.nome || "",
        email: funcionario.email || "",
        telefone: funcionario.telefone || "",
        cargo: funcionario.cargo || "",
        status: funcionario.status || "Ativo",
        modulos_acesso: funcionario.modulos_acesso || DEFAULT_MODULOS,
        observacoes: funcionario.observacoes || "",
      });
      setConviteEnviado(funcionario.convite_enviado || false);
    } else {
      setForm({ nome: "", email: "", telefone: "", cargo: "", status: "Ativo", modulos_acesso: DEFAULT_MODULOS, observacoes: "" });
      setConviteEnviado(false);
    }
  }, [funcionario, open]);

  function toggleModulo(key) {
    setForm(f => {
      const atual = f.modulos_acesso || [];
      const novo = atual.includes(key) ? atual.filter(m => m !== key) : [...atual, key];
      return { ...f, modulos_acesso: novo };
    });
  }

  async function handleSave() {
    setSaving(true);
    if (funcionario) {
      await base44.entities.Funcionario.update(funcionario.id, form);
    } else {
      // Ao criar, envia convite automaticamente se tiver e-mail
      let convite_enviado = false;
      if (form.email) {
        try {
          await base44.users.inviteUser(form.email, "user");
          convite_enviado = true;
        } catch {}
      }
      await base44.entities.Funcionario.create({ ...form, convite_enviado });
    }
    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  async function handleEnviarConvite() {
    if (!form.email) return;
    setEnviandoConvite(true);
    try {
      await base44.users.inviteUser(form.email, "user");
      if (funcionario) {
        await base44.entities.Funcionario.update(funcionario.id, { ...form, convite_enviado: true });
      }
      setConviteEnviado(true);
      onSaved();
    } catch (e) {
      alert("Erro ao enviar convite: " + (e?.message || "tente novamente"));
    }
    setEnviandoConvite(false);
  }

  const modulosSelecionados = form.modulos_acesso || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{funcionario ? "Editar Funcionário" : "Cadastrar Funcionário"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Dados básicos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
            </div>
            <div>
              <Label>WhatsApp (com DDD) *</Label>
              <Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="Ex: 5511999999999" />
            </div>
            <div>
              <Label>Cargo</Label>
              <Input value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} placeholder="Ex: Tratorista" />
            </div>
          </div>

          {/* E-mail de acesso */}
          <div className="space-y-2">
            <Label>E-mail de Acesso à Plataforma</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@funcionario.com"
                className="flex-1"
              />
              {form.email && funcionario && (
                <Button
                  type="button"
                  size="sm"
                  variant={conviteEnviado ? "outline" : "default"}
                  onClick={handleEnviarConvite}
                  disabled={enviandoConvite || conviteEnviado}
                  className="gap-1.5 shrink-0"
                >
                  {conviteEnviado
                    ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Enviado</>
                    : <><Mail className="w-3.5 h-3.5" /> {enviandoConvite ? "Enviando..." : "Convidar"}</>
                  }
                </Button>
              )}
            </div>
            {!funcionario && form.email && (
              <p className="text-xs text-muted-foreground">💡 O convite será enviado automaticamente ao salvar.</p>
            )}
            {conviteEnviado && (
              <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Convite de acesso enviado para este e-mail.</p>
            )}
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Permissões de módulos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <Label className="text-sm font-semibold">Módulos com Acesso</Label>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {MODULOS.map(m => {
                const ativo = modulosSelecionados.includes(m.key);
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggleModulo(m.key)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                      ativo
                        ? "border-primary/40 bg-primary/8 text-foreground"
                        : "border-border bg-transparent text-muted-foreground"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${ativo ? "text-foreground" : "text-muted-foreground"}`}>{m.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 ${
                      ativo ? "border-primary bg-primary" : "border-muted-foreground/30"
                    }`}>
                      {ativo && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">{modulosSelecionados.length} de {MODULOS.length} módulos liberados</p>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows={2} placeholder="Opcional" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.nome || !form.telefone}>
              {saving ? "Salvando..." : funcionario ? "Salvar" : "Cadastrar e Convidar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}