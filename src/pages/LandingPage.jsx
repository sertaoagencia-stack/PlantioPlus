import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Sprout, BarChart2, Package, CalendarDays, Truck, Shield,
  ChevronDown, CheckCircle2, Star, ArrowRight, Leaf, Users,
  Instagram, HelpCircle, FileText, Lock, Building2, PhoneCall
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Sprout, title: "Gestão de Lavouras", desc: "Cadastre e acompanhe cada lavoura com status em tempo real, área, cultura e safra.", color: "text-primary", bg: "bg-primary/10" },
  { icon: BarChart2, title: "Rentabilidade", desc: "Dashboards completos com margem líquida, custo por tarefa e comparativos por safra.", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Package, title: "Controle de Estoque", desc: "Gerencie insumos, alertas de estoque mínimo, vencimentos e controle de compras.", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: CalendarDays, title: "Agenda de Atividades", desc: "Calendário integrado para planejar plantios, adubações, colheitas e muito mais.", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Truck, title: "Gestão de Frota", desc: "Cadastro completo da frota com alertas de revisão baseados em horas ou datas.", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: Shield, title: "Controle de Acesso", desc: "Perfis de admin, gerente e funcionário com permissões distintas por empresa.", color: "text-green-600", bg: "bg-green-600/10" },
];

const benefits = [
  { icon: Building2, title: "Solução Corporativa", desc: "Ideal para empresas rurais, cooperativas e grupos de fazendas que precisam de controle centralizado." },
  { icon: Users, title: "Múltiplos Usuários", desc: "Equipes completas com perfis e permissões personalizadas por setor ou unidade produtiva." },
  { icon: BarChart2, title: "Decisões Baseadas em Dados", desc: "Relatórios gerenciais com indicadores de desempenho para embasar cada decisão estratégica." },
];

const stats = [
  { value: "2.400+", label: "Produtores atendidos" },
  { value: "850k", label: "Tarefas gerenciadas" },
  { value: "R$ 12M+", label: "Em receitas monitoradas" },
  { value: "98%", label: "Satisfação dos clientes" },
];

const faqs = [
  { q: "O Plantio Plus é indicado para empresas rurais?", a: "Sim. O sistema foi desenvolvido para atender operações corporativas do agro, com múltiplos usuários, lavouras ilimitadas e gestão centralizada." },
  { q: "Preciso instalar algum programa?", a: "Não. O Plantio Plus é 100% online, funciona em qualquer navegador ou celular, sem instalação." },
  { q: "Meus dados ficam seguros?", a: "Sim. Todos os dados são criptografados e armazenados em servidores seguros na nuvem com backups automáticos." },
  { q: "Como é feita a implantação para minha empresa?", a: "Nossa equipe realiza o onboarding completo, com configuração inicial, treinamento e suporte dedicado." },
  { q: "Funciona no celular, direto do campo?", a: "Perfeitamente. O sistema é responsivo e foi pensado para uso em campo via smartphone." },
];

function FadeIn({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-inter overflow-x-hidden">

      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Plantio Plus</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#para-empresas" className="hover:text-foreground transition-colors">Para Empresas</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <Button size="sm" className="gap-2" onClick={() => base44.auth.redirectToLogin()}>
            Entrar <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Building2 className="w-4 h-4" /> Solução para empresas do agronegócio
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Gestão agrícola <span className="text-primary">profissional</span><br />
              para sua <span className="text-secondary">empresa</span>.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              O Plantio Plus centraliza o controle de lavouras, estoque, frota e finanças da sua operação agrícola em uma plataforma completa para equipes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 px-8 text-base font-semibold" onClick={() => base44.auth.redirectToLogin()}>
                Acessar o sistema <ArrowRight className="w-4 h-4" />
              </Button>
              <a href="#features">
                <Button size="lg" variant="outline" className="gap-2 px-8 text-base">
                  Ver funcionalidades
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-accent border-b border-border">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-secondary/60" />
                <div className="w-3 h-3 rounded-full bg-primary/60" />
                <span className="ml-2 text-xs text-muted-foreground">plantioplus.app — Dashboard</span>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4">
                {[
                  { label: "Total de Lavouras", val: "12", color: "text-primary" },
                  { label: "Total Gasto", val: "R$ 84.500", color: "text-secondary" },
                  { label: "Custo/ha", val: "R$ 1.240", color: "text-blue-500" },
                ].map(s => (
                  <div key={s.label} className="bg-accent rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.val}</p>
                  </div>
                ))}
                <div className="col-span-3 bg-accent rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-3">Receitas vs Despesas por Lavoura</p>
                  <div className="flex items-end gap-2 h-16">
                    {[70, 45, 80, 55, 90, 40, 65].map((h, i) => (
                      <div key={i} className="flex-1 flex gap-0.5 items-end">
                        <div style={{ height: `${h}%` }} className="flex-1 rounded-t bg-primary/40" />
                        <div style={{ height: `${h * 0.7}%` }} className="flex-1 rounded-t bg-destructive/30" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-border bg-card">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.1} className="text-center">
              <p className="text-3xl font-extrabold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Tudo que sua empresa rural precisa</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Um sistema completo para gestão agrícola profissional, simples de usar e poderoso nos resultados.</p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow group h-full">
                  <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Para Empresas */}
      <section id="para-empresas" className="py-24 px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Feito para empresas do agronegócio</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Do produtor individual ao grande grupo rural — o Plantio Plus se adapta à escala da sua operação.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {benefits.map((b, i) => (
              <FadeIn key={b.title} delay={i * 0.1}>
                <div className="rounded-2xl border border-border bg-background p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <b.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-base mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* CTA card */}
          <FadeIn>
            <div className="rounded-2xl bg-primary/10 border border-primary/20 p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Quer saber mais para sua empresa?</h3>
                <p className="text-muted-foreground text-sm max-w-md">Nossa equipe está pronta para apresentar o sistema e discutir a melhor solução para sua operação.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Button size="lg" className="gap-2" onClick={() => base44.auth.redirectToLogin()}>
                  <PhoneCall className="w-4 h-4" /> Falar com a equipe
                </Button>
                <Button size="lg" variant="outline" onClick={() => base44.auth.redirectToLogin()}>
                  Acessar o sistema
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-4">O que dizem nossos clientes</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "João Pereira", role: "Produtor de soja – MT", text: "Finalmente consigo ver o lucro real de cada lavoura. Em 3 meses já recuperei o custo do sistema.", stars: 5 },
              { name: "Maria Oliveira", role: "Gerente de Fazenda – GO", text: "Os alertas de revisão de máquinas nos salvaram de uma parada inesperada na colheita.", stars: 5 },
              { name: "Carlos Silva", role: "Produtor de cana – SP", text: "A gestão de estoque integrada com as despesas é exatamente o que precisava para o controle de insumos.", stars: 5 },
            ].map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="rounded-2xl border border-border bg-card p-6 h-full">
                  <div className="flex gap-1 mb-4">
                    {Array(t.stars).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-card">
        <div className="max-w-2xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-4">Dúvidas frequentes</h2>
          </FadeIn>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="rounded-xl border border-border bg-background overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/30 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-medium text-sm">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-3 ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center rounded-3xl bg-primary/10 border border-primary/20 p-12">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Pronto para transformar sua gestão?</h2>
            <p className="text-muted-foreground text-lg mb-8">Acesse agora e veja como o Plantio Plus pode elevar o nível da sua operação agrícola.</p>
            <Button size="lg" className="gap-2 px-10 text-base font-semibold" onClick={() => base44.auth.redirectToLogin()}>
              Acessar o sistema <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-foreground">Plantio Plus</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacidade" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Política de Privacidade
              </Link>
              <Link to="/termos" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Termos de Uso
              </Link>
              <Link to="/ajuda" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Central de Ajuda
              </Link>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Instagram className="w-3.5 h-3.5" /> Instagram
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            © 2026 Plantio Plus. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}