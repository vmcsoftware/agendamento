import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Eventos from "./pages/Eventos";
import Pessoas from "./pages/Pessoas";
import Cargos from "./pages/Cargos";
import Congregacoes from "./pages/Congregacoes";
import Cidades from "./pages/Cidades";
import Usuarios from "./pages/Usuarios";
import Relatorios from "./pages/Relatorios";
import Contato from "./pages/Contato";
import NotFound from "./pages/NotFound";
import MarcacaoColetas from "./pages/MarcacaoColetas";
import MarcacaoServicos from "./pages/MarcacaoServicos";
import MarcacaoRJM from "./pages/MarcacaoRJM";
import Marcacoes from "./pages/Marcacoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/eventos" element={<AppLayout><Eventos /></AppLayout>} />
          <Route path="/pessoas" element={<AppLayout><Pessoas /></AppLayout>} />
          <Route path="/cargos" element={<AppLayout><Cargos /></AppLayout>} />
          <Route path="/congregacoes" element={<AppLayout><Congregacoes /></AppLayout>} />
          <Route path="/cidades" element={<AppLayout><Cidades /></AppLayout>} />
          <Route path="/usuarios" element={<AppLayout><Usuarios /></AppLayout>} />
          <Route path="/relatorios" element={<AppLayout><Relatorios /></AppLayout>} />
          <Route path="/contato" element={<AppLayout><Contato /></AppLayout>} />
          <Route path="/marcacao-coletas" element={<AppLayout><MarcacaoColetas /></AppLayout>} />
          <Route path="/marcacao-servicos" element={<AppLayout><MarcacaoServicos /></AppLayout>} />
          <Route path="/marcacao-rjm" element={<AppLayout><MarcacaoRJM /></AppLayout>} />
          <Route path="/marcacoes" element={<AppLayout><Marcacoes /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
