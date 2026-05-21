import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Camera, Trash2, Image } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function AcompanhamentoTab({ lavouraId }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ descricao: "", data: new Date().toISOString().split("T")[0] });
  const [fotoFile, setFotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  async function load() {
    const data = await base44.entities.AcompanhamentoLavoura.filter({ lavoura_id: lavouraId }, "-data");
    setRegistros(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [lavouraId]);

  async function handleSave() {
    setSaving(true);
    let foto_url = undefined;
    if (fotoFile) {
      setUploadingFoto(true);
      const res = await base44.integrations.Core.UploadFile({ file: fotoFile });
      foto_url = res.file_url;
      setUploadingFoto(false);
    }
    const user = await base44.auth.me();
    await base44.entities.AcompanhamentoLavoura.create({
      lavoura_id: lavouraId,
      descricao: form.descricao,
      data: form.data,
      foto_url,
      autor: user?.full_name || user?.email || "Funcionário",
    });
    setSaving(false);
    setAdding(false);
    setForm({ descricao: "", data: new Date().toISOString().split("T")[0] });
    setFotoFile(null);
    load();
  }

  async function handleDelete(id) {
    await base44.entities.AcompanhamentoLavoura.delete(id);
    load();
  }

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{registros.length} registro(s) de acompanhamento</p>
        <Button size="sm" className="gap-2" onClick={() => setAdding(!adding)}>
          <Plus className="w-4 h-4" /> Novo Registro
        </Button>
      </div>

      {adding && (
        <Card className="p-4 border-primary/20 border shadow-sm space-y-3">
          <h4 className="font-semibold text-sm">Adicionar Registro</h4>
          <div>
            <Label>Data</Label>
            <Input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
          </div>
          <div>
            <Label>Relatório / Observação *</Label>
            <Textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={3} placeholder="Descreva o estado da lavoura, atividades realizadas, observações..." />
          </div>
          <div>
            <Label>Foto (opcional)</Label>
            <div className="flex items-center gap-3 mt-1">
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-xl cursor-pointer hover:bg-accent text-sm text-muted-foreground">
                <Camera className="w-4 h-4" />
                {fotoFile ? fotoFile.name : "Selecionar foto"}
                <input type="file" accept="image/*" className="hidden" onChange={e => setFotoFile(e.target.files?.[0] || null)} />
              </label>
              {fotoFile && <button onClick={() => setFotoFile(null)} className="text-xs text-destructive hover:underline">Remover</button>}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => { setAdding(false); setFotoFile(null); }}>Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !form.descricao}>
              {uploadingFoto ? "Enviando foto..." : saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </Card>
      )}

      {registros.length === 0 && !adding ? (
        <Card className="p-10 text-center border-none shadow-sm">
          <Image className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum registro de acompanhamento ainda</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {registros.map(reg => (
            <Card key={reg.id} className="p-4 border-none shadow-sm">
              <div className="flex items-start gap-3">
                {reg.foto_url ? (
                  <img src={reg.foto_url} alt="Foto lavoura" className="w-20 h-20 object-cover rounded-xl shrink-0 cursor-pointer" onClick={() => window.open(reg.foto_url, "_blank")} />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center shrink-0">
                    <Image className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        📅 {reg.data ? new Date(reg.data + "T12:00:00").toLocaleDateString("pt-BR") : "—"}
                        {reg.autor && ` • 👤 ${reg.autor}`}
                      </p>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{reg.descricao}</p>
                    </div>
                    <button onClick={() => handleDelete(reg.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 shrink-0">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}