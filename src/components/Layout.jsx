import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Sprout, Receipt, Package, BarChart2, CalendarDays, Users, Menu, X, Truck, LogOut, ShieldCheck } from "lucide-react";
import useRole from "../hooks/useRole";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const allNavItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, modulo: null, roles: ["all"] },
  { path: "/lavouras", label: "Lavouras", icon: Sprout, modulo: "lavouras", roles: ["all"] },
  { path: "/atividades", label: "Atividades", icon: CalendarDays, modulo: "atividades", roles: ["all"] },
  { path: "/despesas", label: "Despesas", icon: Receipt, modulo: "despesas", roles: ["admin", "proprietario", "gerente"] },
  { path: "/produtos", label: "Estoque", icon: Package, modulo: "produtos", roles: ["admin", "proprietario", "gerente"] },
  { path: "/funcionarios", label: "Funcionários", icon: Users, modulo: "funcionarios", roles: ["admin", "proprietario", "gerente"] },
  { path: "/frota", label: "Frota", icon: Truck, modulo: "frota", roles: ["admin", "proprietario", "gerente"] },
  { path: "/relatorio", label: "Rentabilidade", icon: BarChart2, modulo: "relatorio", roles: ["admin", "proprietario", "gerente"] },
  { path: "/admin", label: "Central Admin", icon: ShieldCheck, modulo: null, roles: ["admin"] },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { role, podeAcessarModulo } = useRole();

  const navItems = allNavItems.filter(item => {
    // Admin vê tudo
    if (role === "admin") return true;
    // Itens "all" mas com módulo: verifica permissão
    if (item.roles.includes("all")) {
      return item.modulo ? podeAcessarModulo(item.modulo) : true;
    }
    // Itens restritos por role: verifica role E módulo
    if (!item.roles.includes(role || "funcionario")) return false;
    return item.modulo ? podeAcessarModulo(item.modulo) : true;
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const UserFooter = () => (
    <div className="p-4 border-t border-sidebar-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-sidebar-primary">
            {user?.full_name?.charAt(0)?.toUpperCase() || "?"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.full_name || "Usuário"}</p>
          <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email || ""}</p>
        </div>
        <button
          onClick={() => base44.auth.logout()}
          title="Sair"
          className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors flex-shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar - FIXA */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border fixed top-0 left-0 h-screen z-30">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Sprout className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Plantio Plus</h1>
              <p className="text-xs text-sidebar-foreground/60">Gestão de Lavouras</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <UserFooter />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="relative w-72 h-full bg-sidebar text-sidebar-foreground flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-sidebar-primary-foreground" />
                </div>
                <h1 className="font-bold text-lg">Plantio Plus</h1>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <UserFooter />
          </aside>
        </div>
      )}

      {/* Main content - offset pela sidebar fixa */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 p-4 border-b border-border bg-card">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-accent">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" />
            <span className="font-bold">Plantio Plus</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}