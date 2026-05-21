import { useState } from "react";
import { ArrowLeft, Leaf, HelpCircle, Search, ChevronDown, Sprout, Package, CalendarDays, Truck, BarChart2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

const categorias = [
  {
    icon: Sprout, label: "Lavouras", color: "text-primary", bg: "bg-primary/10",
    faqs: [
      { q: "Como cadastrar uma nova lavoura?", a: "Acesse o menu 'Lavouras', clique em 'Nova Lavoura', preencha os dados como nome, cultura, área e safra, e salve." },
      { q: "Como acompanhar o status de uma lavoura?", a: "Na lista de lavouras, cada card exibe o status atual. Clique na lavoura para ver o histórico completo de atividades e despesas." },
      { q: "Posso ter várias safras por lavoura?", a: "Sim. Cada lavoura pode ter sua própria safra, e você pode criar novas lavouras para cada ciclo produtivo." },
    ],
  },
  {
    icon: Package, label: "Estoque", color: "text-amber-500", bg: "bg-amber-500/10",
    faqs: [
      { q: "Como adicionar um produto ao estoque?", a: "Vá em 'Estoque', clique em 'Novo Produto', preencha os dados do insumo incluindo quantidade, preço e forma de pagamento." },
      { q: "Como funcionam os alertas de estoque mínimo?", a: "Quando o estoque atual de um produto fica abaixo do estoque mínimo definido, o sistema exibe um alerta visual em vermelho." },
      { q: "Como registrar uma compra parcelada?", a: "No cadastro do produto, selecione a forma de pagamento (ex: 30/60/90 dias) e informe a data da compra. As datas de vencimento são calculadas automaticamente." },
    ],
  },
  {
    icon: CalendarDays, label: "Atividades", color: "text-purple-500", bg: "bg-purple-500/10",
    faqs: [
      { q: "Como registrar uma atividade no calendário?", a: "Acesse 'Atividades', clique em um dia no calendário e depois em 'Adicionar'. Preencha o título, tipo e responsável." },
      { q: "Como marcar uma atividade como concluída?", a: "No painel lateral do calendário, clique em 'Concluir' ao lado da atividade desejada." },
      { q: "Posso registrar mais de uma atividade no mesmo dia?", a: "Sim. Você pode adicionar quantas atividades quiser para o mesmo dia." },
    ],
  },
  {
    icon: Truck, label: "Frota", color: "text-orange-500", bg: "bg-orange-500/10",
    faqs: [
      { q: "Como cadastrar um equipamento?", a: "No menu 'Frota', clique em 'Novo Equipamento' e preencha os dados como nome, tipo, marca, modelo e horas de uso." },
      { q: "Como configurar alertas de manutenção?", a: "Na tela de detalhes do equipamento, acesse 'Manutenções' e cadastre uma revisão com gatilho por data ou por horas de uso." },
      { q: "Como atualizar as horas de uso de um trator?", a: "Edite o equipamento e atualize o campo 'Horas de Uso Atual'. O sistema recalcula automaticamente os alertas de revisão." },
    ],
  },
  {
    icon: BarChart2, label: "Relatórios", color: "text-blue-500", bg: "bg-blue-500/10",
    faqs: [
      { q: "Onde vejo o relatório financeiro?", a: "No menu 'Relatórios', você encontra o resumo de receitas, despesas, margem de lucro e custo por tarefa de todas as lavouras." },
      { q: "Posso exportar relatórios em PDF?", a: "Sim. Na tela de detalhes de cada lavoura, há um botão 'Exportar PDF' que gera um relatório completo." },
      { q: "Como filtrar o relatório por lavoura?", a: "Na página de Relatórios, use o seletor de lavoura no topo para filtrar os dados pela lavoura desejada." },
    ],
  },
  {
    icon: Users, label: "Equipe", color: "text-green-600", bg: "bg-green-600/10",
    faqs: [
      { q: "Como convidar um colaborador?", a: "No painel administrativo, acesse as configurações de usuários e envie um convite por e-mail com o perfil de acesso desejado." },
      { q: "Quais os tipos de perfil disponíveis?", a: "O sistema possui perfis de Admin e Usuário, com permissões distintas de visualização e edição de dados." },
      { q: "Como cadastrar um funcionário para atividades?", a: "Acesse 'Funcionários', cadastre o colaborador com nome e cargo. Ele ficará disponível para ser selecionado nas atividades." },
    ],
  },
];

export default function CentralAjuda() {
  const [busca, setBusca] = useState("");
  const [abertos, setAbertos] = useState({});

  function toggle(catIdx, faqIdx) {
    const key = `${catIdx}-${faqIdx}`;
    setAbertos(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const categoriasFiltradas = categorias.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(f =>
      !busca || f.q.toLowerCase().includes(busca.toLowerCase()) || f.a.toLowerCase().includes(busca.toLowerCase())
    ),
  })).filter(cat => cat.faqs.length > 0);

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">MySafra</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-card border-b border-border py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Central de Ajuda</h1>
          <p className="text-muted-foreground text-sm mb-6">Encontre respostas rápidas sobre como usar o MySafra</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Pesquisar dúvidas..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {categoriasFiltradas.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhuma dúvida encontrada para "<strong>{busca}</strong>"</p>
          </div>
        ) : (
          categoriasFiltradas.map((cat, catIdx) => (
            <div key={cat.label}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center`}>
                  <cat.icon className={`w-4 h-4 ${cat.color}`} />
                </div>
                <h2 className="font-bold">{cat.label}</h2>
              </div>
              <div className="space-y-2">
                {cat.faqs.map((faq, faqIdx) => {
                  const key = `${catIdx}-${faqIdx}`;
                  const open = !!abertos[key];
                  return (
                    <div key={faqIdx} className="rounded-xl border border-border bg-card overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition-colors"
                        onClick={() => toggle(catIdx, faqIdx)}
                      >
                        <span className="font-medium text-sm">{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-3 ${open ? "rotate-180" : ""}`} />
                      </button>
                      {open && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-muted-foreground">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Contato */}
        <div className="rounded-2xl border border-border bg-card p-8 text-center mt-8">
          <p className="font-bold mb-2">Não encontrou o que precisava?</p>
          <p className="text-sm text-muted-foreground mb-4">Nossa equipe de suporte está disponível para ajudar.</p>
          <a href="mailto:suporte@mysafra.app" className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline">
            suporte@mysafra.app
          </a>
        </div>
      </main>

      <footer className="border-t border-border mt-6 py-6 text-center text-sm text-muted-foreground">
        © 2026 MySafra. Todos os direitos reservados.
      </footer>
    </div>
  );
}