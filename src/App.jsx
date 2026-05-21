import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Lavouras from './pages/Lavouras';
import Despesas from './pages/Despesas';
import Produtos from './pages/Produtos';
import Atividades from './pages/Atividades';
import Funcionarios from './pages/Funcionarios';
import Relatorio from './pages/Relatorio';
import LavouraDetalhe from './pages/LavouraDetalhe';
import Frota from './pages/Frota';
import LandingPage from './pages/LandingPage';
import Assinatura from './pages/Assinatura';
import RentabilidadeDetalhe from './pages/RentabilidadeDetalhe';
import AdminCentral from './pages/AdminCentral';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';
import TermosUso from './pages/TermosUso';
import CentralAjuda from './pages/CentralAjuda';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Show landing page before login
      if (window.location.pathname !== '/landing') {
        window.location.replace('/landing');
      }
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lavouras" element={<Lavouras />} />
        <Route path="/despesas" element={<Despesas />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/atividades" element={<Atividades />} />
        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/lavouras/:id" element={<LavouraDetalhe />} />
        <Route path="/relatorio" element={<Relatorio />} />
        <Route path="/frota" element={<Frota />} />
        <Route path="/assinatura" element={<Assinatura />} />
        <Route path="/rentabilidade/:id" element={<RentabilidadeDetalhe />} />
        <Route path="/admin" element={<AdminCentral />} />
      </Route>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/privacidade" element={<PoliticaPrivacidade />} />
      <Route path="/termos" element={<TermosUso />} />
      <Route path="/ajuda" element={<CentralAjuda />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App