import { ArrowLeft, Leaf, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermosUso() {
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Termos de Uso</h1>
            <p className="text-sm text-muted-foreground">Última atualização: maio de 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Aceitação dos termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar ou utilizar a plataforma MySafra, você concorda com estes Termos de Uso. Caso não concorde com alguma condição, recomendamos que não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Descrição do serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              O MySafra é uma plataforma SaaS de gestão agrícola voltada para empresas do agronegócio. Oferece funcionalidades de controle de lavouras, estoque, frota, despesas, receitas e equipes, acessível via navegador e dispositivos móveis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Cadastro e acesso</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-secondary mt-1">•</span><span>O acesso à plataforma é feito mediante convite ou cadastro autorizado pela empresa contratante.</span></li>
              <li className="flex gap-2"><span className="text-secondary mt-1">•</span><span>O usuário é responsável pela confidencialidade de suas credenciais de acesso.</span></li>
              <li className="flex gap-2"><span className="text-secondary mt-1">•</span><span>É vedado o compartilhamento de contas entre diferentes usuários.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Uso permitido</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Ao utilizar o MySafra, você concorda em:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-secondary mt-1">•</span><span>Utilizar a plataforma apenas para fins legítimos relacionados à gestão agrícola.</span></li>
              <li className="flex gap-2"><span className="text-secondary mt-1">•</span><span>Não realizar engenharia reversa, copiar ou redistribuir o sistema.</span></li>
              <li className="flex gap-2"><span className="text-secondary mt-1">•</span><span>Não inserir dados falsos, maliciosos ou que violem direitos de terceiros.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Propriedade dos dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os dados inseridos na plataforma pertencem à empresa contratante. O MySafra não reivindica propriedade sobre esses dados e compromete-se a não utilizá-los para outros fins além da operação do serviço contratado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Disponibilidade e suporte</h2>
            <p className="text-muted-foreground leading-relaxed">
              O MySafra envidar esforços razoáveis para manter o serviço disponível, mas não garante disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência sempre que possível.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Limitação de responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O MySafra não se responsabiliza por decisões tomadas com base nas informações geradas pela plataforma. O usuário é responsável pela veracidade e atualização dos dados inseridos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Alterações nos termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes termos podem ser atualizados a qualquer momento. O uso continuado da plataforma após a publicação das alterações implica aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dúvidas sobre estes termos podem ser enviadas para <span className="text-secondary font-medium">juridico@mysafra.app</span>.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
        © 2026 MySafra. Todos os direitos reservados.
      </footer>
    </div>
  );
}