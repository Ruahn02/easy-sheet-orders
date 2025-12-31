import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import FormularioPedido from "./pages/FormularioPedido";
import Dashboard from "./pages/admin/Dashboard";
import Pedidos from "./pages/admin/Pedidos";
import Lojas from "./pages/admin/Lojas";
import Produtos from "./pages/admin/Produtos";
import Entidades from "./pages/admin/Entidades";
import Links from "./pages/admin/Links";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pedido/:entidadeId" element={<FormularioPedido />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/pedidos" element={<Pedidos />} />
          <Route path="/admin/lojas" element={<Lojas />} />
          <Route path="/admin/produtos" element={<Produtos />} />
          <Route path="/admin/entidades" element={<Entidades />} />
          <Route path="/admin/links" element={<Links />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
