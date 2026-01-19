import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import FormularioPedido from "./pages/FormularioPedido";
import AcessoLoja from "./pages/AcessoLoja";
import Dashboard from "./pages/admin/Dashboard";
import Pedidos from "./pages/admin/Pedidos";
import Lojas from "./pages/admin/Lojas";
import Produtos from "./pages/admin/Produtos";
import Entidades from "./pages/admin/Entidades";
import Inventario from "./pages/admin/Inventario";
import { useAcesso } from "./store/useLojaAuth";

const queryClient = new QueryClient();

// Componente para proteger rotas públicas (exige acesso liberado)
const RequireAcesso = ({ children }: { children: React.ReactNode }) => {
  const { acessoLiberado } = useAcesso();
  
  if (!acessoLiberado) {
    return <Navigate to="/acesso" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rota de acesso por código */}
          <Route path="/acesso" element={<AcessoLoja />} />
          
          {/* Rotas públicas que exigem acesso liberado */}
          <Route path="/" element={<RequireAcesso><Index /></RequireAcesso>} />
          <Route path="/pedido" element={<RequireAcesso><Index /></RequireAcesso>} />
          <Route path="/pedido/:entidadeId" element={<RequireAcesso><FormularioPedido /></RequireAcesso>} />
          
          {/* Rotas admin (não exigem código) */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/pedidos" element={<Pedidos />} />
          <Route path="/admin/inventario" element={<Inventario />} />
          <Route path="/admin/lojas" element={<Lojas />} />
          <Route path="/admin/produtos" element={<Produtos />} />
          <Route path="/admin/entidades" element={<Entidades />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
