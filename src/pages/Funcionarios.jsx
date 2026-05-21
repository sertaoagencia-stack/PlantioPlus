import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Users, Phone, Pencil, Trash2, MessageCircle, Mail, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FuncionarioDialog from "../components/funcionarios/FuncionarioDialog";
import RelatorioManejoDialog from "../components/funcionarios/RelatorioManejoDialog";

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [manejoOpen, setManejoOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedFunc, setSelectedFunc] = useState(null);

  async function load() {
    const data = await base44.entities.Funcionario.list("-created_date");
    setFuncionarios(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    await base44.entities.Funcionario.delete(id);
    load();
  }

  function openManejo(func) {
    setSelectedFunc(func);
    setManejoOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const ativos = funcionarios.filter(f => f.status !== "Inativo").length;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground mt-1">Gerencie sua equipe e envie relatórios de manejo</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Cadastrar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 border-none shadow-sm">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold mt-1">{funcionarios.length}</p>
        </Card>
        <Card className="p-5 border-none shadow-sm">
          <p className="text-sm text-muted-foreground">Ativos</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{ativos}</p>
        </Card>
      </div>

      {funcionarios.length === 0 ? (
        <Card className="p-12 text-center border-none shadow-sm">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Nenhum funcionário cadastrado</p>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2 mt-4">
            <Plus className="w-4 h-4" /> Cadastrar Funcionário
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {funcionarios.map(f => (
            <Card key={f.id} className="p-4 border-none shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary text-lg">{f.nome?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{f.nome}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${f.status === "Inativo" ? "bg-gray-500/10 text-gray-400" : "bg-green-500/10 text-green-600"}`}>
                      {f.status || "Ativo"}
                    </span>
                    {f.convite_enviado && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Acesso enviado
                      </span>
                    )}
                  </div>
                  {f.cargo && <p className="text-xs text-muted-foreground">{f.cargo}</p>}
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{f.telefone}</p>
                    </div>
                    {f.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{f.email}</p>
                      </div>
                    )}
                  </div>
                  {f.modulos_acesso?.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <ShieldCheck className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{f.modulos_acesso.length} módulos liberados</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50" onClick={() => openManejo(f)}>
                    <MessageCircle className="w-3.5 h-3.5" /> Manejo
                  </Button>
                  <button onClick={() => { setEditing(f); setDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-accent">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FuncionarioDialog open={dialogOpen} onOpenChange={setDialogOpen} funcionario={editing} onSaved={load} />
      <RelatorioManejoDialog open={manejoOpen} onOpenChange={setManejoOpen} funcionario={selectedFunc} />
    </div>
  );
}