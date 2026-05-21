import { ArrowLeft, Leaf, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function PoliticaPrivacidade() {
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
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Política de Privacidade</h1>
            <p className="text-sm text-muted-foreground">Última atualização: maio de 2026</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Quem somos</h2>
            <p className="text-muted-foreground leading-relaxed">
              O MySafra é uma plataforma de gestão agrícola desenvolvida para empresas do agronegócio. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos as informações dos nossos usuários.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Dados que coletamos</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Dados de cadastro:</strong> nome, e-mail, empresa e informações de contato fornecidas no momento do registro.</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Dados operacionais:</strong> informações sobre lavouras, despesas, estoque, maquinário e atividades inseridas na plataforma.</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Dados de uso:</strong> logs de acesso, páginas visitadas e interações com o sistema para fins de melhoria do serviço.</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Cookies:</strong> utilizados para manter a sessão ativa e personalizar a experiência do usuário.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Como usamos seus dados</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Fornecer e operar os serviços da plataforma MySafra.</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Melhorar continuamente as funcionalidades e a experiência do usuário.</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Enviar comunicações relevantes sobre o serviço, quando autorizado.</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Cumprir obrigações legais e regulatórias aplicáveis.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Compartilhamento de dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais. Os dados podem ser compartilhados apenas com prestadores de serviço essenciais à operação da plataforma (como servidores em nuvem), sempre sob acordo de confidencialidade, ou quando exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Segurança dos dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou alteração. Todos os dados são armazenados em servidores seguros com criptografia e backups automáticos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Seus direitos</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Confirmar a existência de tratamento de seus dados.</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Acessar, corrigir ou excluir seus dados.</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Revogar o consentimento a qualquer momento.</span></li>
              <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Solicitar a portabilidade dos seus dados.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato pelo e-mail <span className="text-primary font-medium">privacidade@mysafra.app</span>.
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