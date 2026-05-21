import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const culturas = ["Cebola", "Cenoura", "Beterraba", "Abóbora Maranhão", "Abóbora Cabotiá", "Melancia", "Tomate", "Pimentão", "Outro"];
const statusOptions = ["Planejamento", "Plantio", "Desenvolvimento", "Colheita", "Finalizada"];

export default function LavouraDialog({ open, onOpenChange, lavoura, onSaved }) {
  const [form, setForm] = useState({
    nome: "", cultura: "Cebola", area_hectares: "", safra: "", status: "Planejamento", localizacao: "", observacoes: "",
  });
  const [culturaCustom, setCulturaCustom] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lavoura) {
      const isCustom = lavoura.cultura && !culturas.includes(lavoura.cultura);
      setCulturaCustom(isCustom ? lavoura.cultura : "");
      setForm({
        nome: lavoura.nome || "",
        cultura: isCustom ? "Outro" : (lavoura.cultura || "Cebola"),
        area_hectares: lavoura.area_hectares || "",
        safra: lavoura.safra || "",
        status: lavoura.status || "Planejamento",
        localizacao: lavoura.localizacao || "",
        observacoes: lavoura.observacoes || "",
      });
    } else {
      setCulturaCustom("");
      setForm({ nome: "", cultura: "Cebola", area_hectares: "", safra: "", status: "Planejamento", localizacao: "", observacoes: "" });
    }
  }, [lavoura, open]);

  async function handleSave() {
    setSaving(true);
    const culturaFinal = form.cultura === "Outro" ? culturaCustom : form.cultura;
    const data = { ...form, cultura: culturaFinal, area_hectares: Number(form.area_hectares) };
    if (lavoura) {
      await base44.entities.Lavoura.update(lavoura.id, data);
    } else {
      await base44.entities.Lavoura.create(data);
    }
    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{lavoura ? "Editar Lavoura" : "Nova Lavoura"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Nome da Lavoura *</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Talhão Norte" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cultura *</Label>
              <Select value={form.cultura} onValueChange={(v) => setForm({ ...form, cultura: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {culturas.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {form.cultura === "Outro" && (
                <Input className="mt-2" value={culturaCustom} onChange={e => setCulturaCustom(e.target.value)} placeholder="Digite a cultura" />
              )}
            </div>
            <div>
              <Label>Área (tarefas) *</Label>
              <Input type="number" value={form.area_hectares} onChange={(e) => setForm({ ...form, area_hectares: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Safra *</Label>
              <Input value={form.safra} onChange={(e) => setForm({ ...form, safra: e.target.value })} placeholder="Ex: 2025/2026" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Localização</Label>
            <Input value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} placeholder="Ex: Fazenda São João" />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.nome || !form.area_hectares || !form.safra}>
              {saving ? "Salvando..." : lavoura ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}