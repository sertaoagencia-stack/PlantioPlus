import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Plus, Sprout, MapPin, MoreVertical, Pencil, Trash2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import LavouraDialog from "../components/lavouras/LavouraDialog";

const statusColors = {
  Planejamento: "bg-blue-100 text-blue-700",
  Plantio: "bg-amber-100 text-amber-700",
  Desenvolvimento: "bg-green-100 text-green-700",
  Colheita: "bg-orange-100 text-orange-700",
  Finalizada: "bg-gray-100 text-gray-600",
};

export default function Lavouras() {
  const navigate = useNavigate();
  const [lavouras, setLavouras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    const data = await base44.entities.Lavoura.list("-created_date");
    setLavouras(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    await base44.entities.Lavoura.delete(id);
    load();
  }

  function handleEdit(lavoura) {
    setEditing(lavoura);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Lavouras</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas lavouras e culturas</p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Lavoura
        </Button>
      </div>

      {lavouras.length === 0 ? (
        <Card className="p-12 text-center border-none shadow-sm">
          <Sprout className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhuma lavoura cadastrada</h3>
          <p className="text-muted-foreground text-sm mb-6">Comece cadastrando sua primeira lavoura</p>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="w-4 h-4" /> Cadastrar Lavoura
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lavouras.map((lav) => (
            <Card key={lav.id} className="p-5 border-none shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sprout className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{lav.nome}</h3>
                    <p className="text-xs text-muted-foreground">{lav.cultura}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 rounded-lg hover:bg-accent">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(lav)}>
                      <Pencil className="w-4 h-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(lav.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Área</span>
                  <span className="font-medium">{lav.area_hectares} ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Safra</span>
                  <span className="font-medium">{lav.safra}</span>
                </div>
                {lav.localizacao && (
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mt-2">
                    <MapPin className="w-3 h-3" /> {lav.localizacao}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lav.status] || "bg-gray-100 text-gray-600"}`}>
                  {lav.status}
                </span>
                <button onClick={() => navigate(`/lavouras/${lav.id}`)} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                  Ver detalhes <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <LavouraDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lavoura={editing}
        onSaved={load}
      />
    </div>
  );
}