import { useState } from "react";
import { CheckCircle2, Star, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    id: "prata",
    name: "PRATA",
    price: "49,90",
    description: "Ideal para pequenos e médios produtores",
    color: "border-slate-400",
    badgeClass: "bg-slate-200 text-slate-700",
    btnVariant: "outline",
    icon: Shield,
    iconColor: "text-slate-500",
    iconBg: "bg-slate-100",
    features: [
      "Até 5 lavouras cadastradas",
      "Controle de despesas",
      "Gestão de estoque básica",
      "Agenda de atividades",
      "1 usuário",
      "Relatórios básicos",
      "Suporte por e-mail",
    ],
    notIncluded: [
      "Relatório de rentabilidade avançado",
      "Gestão de frota",
      "Múltiplos usuários",
      "Alertas de manutenção",
    ],
  },
  {
    id: "ouro",
    name: "OURO",
    price: "99,90",
    description: "Para produtores que querem controle total",
    color: "border-secondary",
    badgeClass: "bg-secondary/10 text-secondary",
    btnVariant: "default",
    highlight: true,
    icon: Star,
    iconColor: "text-secondary",
    iconBg: "bg-secondary/10",
    features: [
      "Lavouras ilimitadas",
      "Controle completo de despesas",
      "Gestão de estoque com validade",
      "Dashboard de rentabilidade",
      "Gestão de frota e manutenção",
      "Múltiplos usuários (até 10)",
      "Alertas de atividades e revisões",
      "Comprovantes de pagamento",
      "Suporte prioritário",
      "Exportação de relatórios",
    ],
    notIncluded: [],
  },
];

export default function Assinatura() {
  const [planoAtivo, setPlanoAtivo] = useState("ouro");

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Planos e Assinatura</h1>
        <p className="text-muted-foreground mt-2">Escolha o plano ideal para sua operação agrícola</p>
      </div>

      {/* Current Plan Banner */}
      <Card className="p-4 border-none shadow-sm bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Plano atual: <span className="text-primary">Gratuito (Demonstração)</span></p>
            <p className="text-xs text-muted-foreground">Assine um plano para desbloquear todos os recursos</p>
          </div>
        </div>
      </Card>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = planoAtivo === plan.id;
          return (
            <div
              key={plan.id}
              className={`rounded-2xl border-2 ${plan.color} bg-card p-7 relative cursor-pointer transition-all ${isSelected ? "shadow-xl" : "shadow-sm opacity-80 hover:opacity-100"} ${plan.highlight && isSelected ? "scale-[1.02]" : ""}`}
              onClick={() => setPlanoAtivo(plan.id)}
            >
              {plan.highlight && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                  ⭐ Mais Popular
                </span>
              )}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 ${plan.badgeClass}`}>
                    <Icon className={`w-3.5 h-3.5 ${plan.iconColor}`} /> Plano {plan.name}
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold">R$ {plan.price}</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.notIncluded.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground line-through">
                    <div className="w-4 h-4 rounded-full border border-muted-foreground/30 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.btnVariant}
                onClick={(e) => { e.stopPropagation(); setPlanoAtivo(plan.id); }}
              >
                {isSelected ? "✓ Plano selecionado" : `Selecionar ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Confirm button */}
      <div className="text-center">
        <Button size="lg" className="px-10 gap-2">
          <Zap className="w-4 h-4" />
          Assinar Plano {plans.find(p => p.id === planoAtivo)?.name} — R$ {plans.find(p => p.id === planoAtivo)?.price}/mês
        </Button>
        <p className="text-xs text-muted-foreground mt-3">Sem fidelidade • Cancele quando quiser • Pagamento seguro</p>
      </div>

      {/* FAQ */}
      <Card className="p-6 border-none shadow-sm">
        <h3 className="font-semibold mb-4">Dúvidas sobre os planos</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">Como funciona o pagamento?</span> — Cobrança mensal automática no cartão cadastrado.</p>
          <p><span className="font-medium text-foreground">Posso mudar de plano?</span> — Sim, o upgrade ou downgrade é instantâneo.</p>
          <p><span className="font-medium text-foreground">Tem período de teste?</span> — Sim, 14 dias grátis em qualquer plano.</p>
        </div>
      </Card>
    </div>
  );
}