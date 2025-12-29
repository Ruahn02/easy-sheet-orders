import { useMemo } from 'react';
import { ClipboardList, Store, Package, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { pedidos, lojas, produtos } = useAppStore();

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pedidosHoje = pedidos.filter((p) => {
      const pedidoDate = new Date(p.data);
      pedidoDate.setHours(0, 0, 0, 0);
      return pedidoDate.getTime() === today.getTime();
    });

    const lojasAtivas = lojas.filter((l) => l.status === 'ativo');
    const produtosDisponiveis = produtos.filter((p) => p.status === 'disponivel');

    return {
      totalPedidos: pedidos.length,
      pedidosHoje: pedidosHoje.length,
      lojasAtivas: lojasAtivas.length,
      produtosDisponiveis: produtosDisponiveis.length,
    };
  }, [pedidos, lojas, produtos]);

  const produtosMaisPedidos = useMemo(() => {
    const contagem: Record<string, number> = {};
    
    pedidos.forEach((pedido) => {
      pedido.itens.forEach((item) => {
        contagem[item.produtoId] = (contagem[item.produtoId] || 0) + item.quantidade;
      });
    });

    return Object.entries(contagem)
      .map(([produtoId, quantidade]) => ({
        produto: produtos.find((p) => p.id === produtoId),
        quantidade,
      }))
      .filter((item) => item.produto)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }, [pedidos, produtos]);

  const pedidosPorLoja = useMemo(() => {
    const contagem: Record<string, number> = {};
    
    pedidos.forEach((pedido) => {
      contagem[pedido.lojaId] = (contagem[pedido.lojaId] || 0) + 1;
    });

    return Object.entries(contagem)
      .map(([lojaId, quantidade]) => ({
        loja: lojas.find((l) => l.id === lojaId),
        quantidade,
      }))
      .filter((item) => item.loja)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }, [pedidos, lojas]);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalPedidos}</p>
                  <p className="text-xs text-muted-foreground">Total Pedidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Store className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.lojasAtivas}</p>
                  <p className="text-xs text-muted-foreground">Lojas Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Package className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.produtosDisponiveis}</p>
                  <p className="text-xs text-muted-foreground">Produtos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                  <Clock className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.pedidosHoje}</p>
                  <p className="text-xs text-muted-foreground">Pedidos Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Produtos Mais Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {produtosMaisPedidos.length > 0 ? (
                <div className="space-y-3">
                  {produtosMaisPedidos.map((item, index) => (
                    <div key={item.produto?.id} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.produto?.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.produto?.codigo}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{item.quantidade}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum pedido registrado ainda.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Orders by Store */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-accent" />
                Pedidos por Loja
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pedidosPorLoja.length > 0 ? (
                <div className="space-y-3">
                  {pedidosPorLoja.map((item, index) => (
                    <div key={item.loja?.id} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.loja?.nome}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-accent">{item.quantidade} pedidos</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum pedido registrado ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
