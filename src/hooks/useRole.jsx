import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function useRole() {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [modulosAcesso, setModulosAcesso] = useState(null); // null = sem restrição
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(async u => {
        setUser(u);
        setRole(u?.role || "funcionario");

        // Se não é admin, busca o registro de Funcionario pelo email para pegar módulos
        if (u?.role !== "admin" && u?.email) {
          try {
            const funcs = await base44.entities.Funcionario.filter({ email: u.email });
            if (funcs && funcs.length > 0 && funcs[0].modulos_acesso) {
              setModulosAcesso(funcs[0].modulos_acesso);
            }
          } catch {}
        }
        setLoading(false);
      })
      .catch(() => { setRole("funcionario"); setLoading(false); });
  }, []);

  const canViewFinanceiro = role === "admin" || role === "proprietario" || role === "gerente";
  const isAdmin = role === "admin" || role === "proprietario";

  function podeAcessarModulo(modulo) {
    if (role === "admin") return true;
    if (!modulosAcesso) return true; // sem restrição cadastrada
    return modulosAcesso.includes(modulo);
  }

  return { role, user, loading, canViewFinanceiro, isAdmin, modulosAcesso, podeAcessarModulo };
}