import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Building2, Users, Search, MoreVertical, CheckCircle2, Clock, XCircle, Edit2, Trash2, ChevronDown, ChevronUp, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ClienteDialog from "../components/admin/ClienteDialog";
import ConvidarUsuarioDialog from "../components/admin/ConvidarUsuarioDialog";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  Ativo: { icon: CheckCircle2, color: "text-green-500", badge: "bg-green-500/10 text-green-500" },
  Inativo: { icon: XCircle, color: "text-gray-400", badge: "bg-gray-500/10 text-gray-400" },
  Trial: { icon: Clock, color: "text-amber-500", badge: "bg-amber-500/10 text-amber-600" },
};

const planoColor = {
  Básico: "bg-slate-500/10 text-slate-400",
  Profissional: "bg-primary/10 text-primary",
  Enterprise: "bg-secondary/10 text-secondary",
};

export default function AdminCentral() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [convidarOpen, setConvidarOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await base44.entities.Cliente.list("-created_date");
    setClientes(data);
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm("Remover este cliente?")) return;
    await base44.entities.Cliente.delete(id);
    load();
  }

  const filtrados = clientes.filter(c =>
    !busca ||
    c.nome_empresa?.toLowerCase().includes(busca.toLowerCase()) ||
    c.responsavel?.toLowerCase().includes(busca.toLowerCase()) ||
    c.email?.toLowerCase().includes(busca.toLowerCase())
  );

  const stats = {
    total: clientes.length,
    ativos: clientes.filter(c => c.status === "Ativo").length,
    trial: clientes.filter(c => c.status === "Trial").length,
    vencendo: clientes.filter(c => {
      if (!c.data_vencimento) return false;
      const diff = differenceInDays(parseISO(c.data_vencimento), new Date());
      return diff >= 0 && diff <= 30;
    }).length,
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-3 opacity-50" />
          <p className="font-semibold">Acesso restrito</p>
          <p className="text-sm text-muted-foreground">Apenas administradores podem acessar esta área.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Central de Administração</h1>
          <p className="text-muted-foreground mt-1">Gerencie clientes e usuários da plataforma</p>
        </div>
        <Button onClick={() => { setEditando(null); setDialogOpen(true); }} className="gap-2 w-fit">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total de Clientes", value: stats.total, color: "text-foreground" },
          { label: "Ativos", value: stats.ativos, color: "text-green-500" },
          { label: "Em Trial", value: stats.trial, color: "text-amber-500" },
          { label: "Vencendo em 30d", value: stats.vencendo, color: "text-destructive" },
        ].map(s => (
          <Card key={s.label} className="p-4 border-none shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Buscar por empresa, responsável ou e-mail..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      {/* Lista de clientes */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <Card className="p-12 text-center border-none shadow-sm">
          <Building2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">{busca ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}</p>
          {!busca && <Button onClick={() => { setEditando(null); setDialogOpen(true); }} className="mt-4 gap-2"><Plus className="w-4 h-4" /> Adicionar primeiro cliente</Button>}
        </Card>
      ) : (
        <div className="space-y-3">
          {filtrados.map(cliente => {
            const cfg = statusConfig[cliente.status] || statusConfig.Ativo;
            const StatusIcon = cfg.icon;
            const diasRestantes = cliente.data_vencimento
              ? differenceInDays(parseISO(cliente.data_vencimento), new Date())
              : null;
            const isExpanded = expandido === cliente.id;

            return (
              <Card key={cliente.id} className="border-none shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">{cliente.nome_empresa?.charAt(0)?.toUpperCase() || "?"}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm">{cliente.nome_empresa}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                        {cliente.status}
                      </span>
                      {cliente.plano && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planoColor[cliente.plano] || planoColor.Profissional}`}>
                          {cliente.plano}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {cliente.responsavel && `${cliente.responsavel} · `}{cliente.email}
                    </p>
                    {diasRestantes !== null && (
                      <p className={`text-xs mt-0.5 ${diasRestantes < 0 ? "text-destructive" : diasRestantes <= 30 ? "text-amber-500" : "text-muted-foreground"}`}>
                        {diasRestantes < 0 ? `Vencido há ${Math.abs(diasRestantes)} dias` : diasRestantes === 0 ? "Vence hoje" : `Vence em ${diasRestantes} dias`}
                        {cliente.data_vencimento && ` · ${format(parseISO(cliente.data_vencimento), "dd/MM/yyyy")}`}
                      </p>
                    )}
                    {cliente.tempo_uso_meses && (
                      <p className="text-xs text-muted-foreground mt-0.5">⏱ {cliente.tempo_uso_meses} meses de uso contratados</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setClienteSelecionado(cliente); setConvidarOpen(true); }}
                      title="Convidar usuário"
                      className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setEditando(cliente); setDialogOpen(true); }}
                      title="Editar"
                      className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id)}
                      title="Remover"
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandido(isExpanded ? null : cliente.id)}
                      className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandido: detalhes */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border mt-0 pt-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {cliente.telefone && (
                        <div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-medium">{cliente.telefone}</p></div>
                      )}
                      {cliente.data_inicio && (
                        <div><p className="text-xs text-muted-foreground">Início</p><p className="font-medium">{format(parseISO(cliente.data_inicio), "dd/MM/yyyy")}</p></div>
                      )}
                      {cliente.tempo_uso_meses && (
                        <div><p className="text-xs text-muted-foreground">Contrato</p><p className="font-medium">{cliente.tempo_uso_meses} meses</p></div>
                      )}
                      {cliente.data_vencimento && (
                        <div><p className="text-xs text-muted-foreground">Vencimento</p><p className="font-medium">{format(parseISO(cliente.data_vencimento), "dd/MM/yyyy")}</p></div>
                      )}
                    </div>
                    {cliente.observacoes && (
                      <p className="text-xs text-muted-foreground mt-3 bg-accent/30 rounded-lg p-3">{cliente.observacoes}</p>
                    )}
                    <div className="mt-3">
                      <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => { setClienteSelecionado(cliente); setConvidarOpen(true); }}>
                        <UserPlus className="w-3.5 h-3.5" /> Convidar usuário para este cliente
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ClienteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cliente={editando}
        onSaved={load}
      />

      <ConvidarUsuarioDialog
        open={convidarOpen}
        onOpenChange={setConvidarOpen}
        cliente={clienteSelecionado}
      />
    </div>
  );
}