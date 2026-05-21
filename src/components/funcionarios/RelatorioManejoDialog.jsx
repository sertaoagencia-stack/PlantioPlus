import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Wand2 } from "lucide-react";

export default function RelatorioManejoDialog({ open, onOpenChange, funcionario }) {
  const [lavouras, setLavouras] = useState([]);
  const [form, setForm] = useState({ lavoura_id: "", data: new Date().toISOString().split("T")[0], atividades: "", observacoes: "" });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (open) {
      base44.entities.Lavoura.list().then(setLavouras);
      setForm({ lavoura_id: "", data: new Date().toISOString().split("T")[0], atividades: "", observacoes: "" });
    }
  }, [open]);

  async function handleGenerate() {
    if (!form.lavoura_id || !form.atividades) return;
    setGenerating(true);
    const lavoura = lavouras.find(l => l.id === form.lavoura_id);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Crie um relatório de manejo agrícola para WhatsApp. Seja objetivo e profissional.
Dados:
- Funcionário: ${funcionario?.nome}
- Lavoura: ${lavoura?.nome} (${lavoura?.cultura})
- Data: ${form.data}
- Atividades realizadas: ${form.atividades}
- Observações: ${form.observacoes || "Nenhuma"}

Formate como mensagem de WhatsApp com emojis, máximo 300 palavras.`,
    });
    setForm(f => ({ ...f, atividades: result }));
    setGenerating(false);
  }

  function handleSendWhatsApp() {
    if (!funcionario?.telefone) return;
    const lavoura = lavouras.find(l => l.id === form.lavoura_id);
    const dataFormatada = form.data ? new Date(form.data + "T12:00:00").toLocaleDateString("pt-BR") : "";

    const mensagem =
      `📋 *RELATÓRIO DE MANEJO*\n` +
      `👷 Funcionário: ${funcionario.nome}\n` +
      `🌱 Lavoura: ${lavoura?.nome || "—"}\n` +
      `📅 Data: ${dataFormatada}\n\n` +
      `*Atividades Realizadas:*\n${form.atividades}\n` +
      (form.observacoes ? `\n*Observações:*\n${form.observacoes}` : "");

    const telefone = funcionario.telefone.replace(/\D/g, "");
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  }

  const canSend = funcionario?.telefone && form.lavoura_id && form.atividades;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Relatório de Manejo — {funcionario?.nome}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Lavoura *</Label>
              <Select value={form.lavoura_id} onValueChange={v => setForm(f => ({ ...f, lavoura_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {lavouras.map(l => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data</Label>
              <Input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Atividades Realizadas *</Label>
              <button
                onClick={handleGenerate}
                disabled={generating || !form.lavoura_id || !form.atividades}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline disabled:opacity-40"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {generating ? "Gerando..." : "Melhorar com IA"}
              </button>
            </div>
            <Textarea
              value={form.atividades}
              onChange={e => setForm(f => ({ ...f, atividades: e.target.value }))}
              rows={5}
              placeholder="Descreva as atividades do dia: capina, plantio, aplicação de defensivo, irrigação..."
            />
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={form.observacoes}
              onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
              rows={2}
              placeholder="Problemas encontrados, condições climáticas, etc."
            />
          </div>

          {!funcionario?.telefone && (
            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl">⚠️ Este funcionário não tem WhatsApp cadastrado.</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
            <Button
              onClick={handleSendWhatsApp}
              disabled={!canSend}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4" /> Enviar no WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}