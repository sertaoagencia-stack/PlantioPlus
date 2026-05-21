import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, UserPlus } from "lucide-react";

export default function ConvidarUsuarioDialog({ open, onOpenChange, cliente }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  async function handleConvidar() {
    setLoading(true);
    setErro("");
    try {
      await base44.users.inviteUser(email, role);
      setSucesso(true);
      setEmail("");
    } catch (e) {
      setErro(e?.message || "Erro ao convidar usuário.");
    }
    setLoading(false);
  }

  function handleClose() {
    setSucesso(false);
    setErro("");
    setEmail("");
    setRole("user");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Convidar Usuário
          </DialogTitle>
        </DialogHeader>

        {sucesso ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-semibold">Convite enviado com sucesso!</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">O usuário receberá um e-mail com as instruções de acesso.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setSucesso(false)}>Convidar outro</Button>
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {cliente && (
              <div className="rounded-lg bg-accent/40 px-4 py-3 text-sm">
                <p className="text-muted-foreground text-xs mb-0.5">Cliente</p>
                <p className="font-semibold">{cliente.nome_empresa}</p>
              </div>
            )}

            <div>
              <Label>E-mail do usuário *</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
              />
            </div>

            <div>
              <Label>Perfil de acesso</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário — acesso padrão ao sistema</SelectItem>
                  <SelectItem value="admin">Admin — acesso completo e administrativo</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Usuários convidados terão acesso vinculado a este cliente.
              </p>
            </div>

            {erro && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{erro}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleConvidar} disabled={loading || !email} className="gap-2">
                <UserPlus className="w-4 h-4" />
                {loading ? "Enviando..." : "Enviar Convite"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}