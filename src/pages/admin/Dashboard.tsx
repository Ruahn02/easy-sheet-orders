import { useState, useMemo } from 'react';
import { ClipboardList, Store, Package, Filter, TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { pedidos, lojas, produtos, entidades } = useAppStore();

  // Filtros
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined);
  const [lojaFiltro, setLojaFiltro] = useState<string>('todas');
  const [produtoFiltro, setProdutoFiltro] = useState<string>('todos');
  const [entidadeFiltro, setEntidadeFiltro] = useState<string>('todas');

  // Pedidos filtrados
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      // Filtro por entidade
      if (entidadeFiltro !== 'todas' && pedido.entidadeId !== entidadeFiltro) return false;

      // Filtro por data
      const dataPedido = new Date(pedido.data);
      if (dataInicio) {
        const inicio = new Date(dataInicio);
        inicio.setHours(0, 0, 0, 0);
        if (dataPedido < inicio) return false;
      }
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        if (dataPedido > fim) return false;
      }

      // Filtro por loja
      if (lojaFiltro !== 'todas' && pedido.lojaId !== lojaFiltro) return false;

      // Filtro por produto
      if (produtoFiltro !== 'todos') {
        const temProduto = pedido.itens.some((item) => item.produtoId === produtoFiltro);
        if (!temProduto) return false;
      }

      return true;
    });
  }, [pedidos, dataInicio, dataFim, lojaFiltro, produtoFiltro, entidadeFiltro]);

  // Estatísticas baseadas nos filtros
  const stats = useMemo(() => {
    const lojasQuePediram = new Set(pedidosFiltrados.map((p) => p.lojaId));
    const produtosAbertos = produtos.filter((p) => p.status === 'aberto');

    return {
      totalPedidos: pedidos.length,
      pedidosFiltrados: pedidosFiltrados.length,
      lojasQuePediram: lojasQuePediram.size,
      produtosAbertos: produtosAbertos.length,
    };
  }, [pedidos, pedidosFiltrados, produtos]);

  // Produtos mais pedidos (baseado nos filtros)
  const produtosMaisPedidos = useMemo(() => {
    const contagem: Record<string, number> = {};

    pedidosFiltrados.forEach((pedido) => {
      pedido.itens.forEach((item) => {
        // Se filtrando por produto, mostrar apenas esse
        if (produtoFiltro !== 'todos' && item.produtoId !== produtoFiltro) return;
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
  }, [pedidosFiltrados, produtos, produtoFiltro]);

  // Pedidos por loja (baseado nos filtros)
  const pedidosPorLoja = useMemo(() => {
    const contagem: Record<string, { pedidos: number; itens: number }> = {};

    pedidosFiltrados.forEach((pedido) => {
      // Se filtrando por loja, mostrar apenas essa
      if (lojaFiltro !== 'todas' && pedido.lojaId !== lojaFiltro) return;

      if (!contagem[pedido.lojaId]) {
        contagem[pedido.lojaId] = { pedidos: 0, itens: 0 };
      }
      contagem[pedido.lojaId].pedidos += 1;

      // Se filtrando por produto, contar apenas esse produto
      pedido.itens.forEach((item) => {
        if (produtoFiltro !== 'todos' && item.produtoId !== produtoFiltro) return;
        contagem[pedido.lojaId].itens += item.quantidade;
      });
    });

    return Object.entries(contagem)
      .map(([lojaId, dados]) => ({
        loja: lojas.find((l) => l.id === lojaId),
        ...dados,
      }))
      .filter((item) => item.loja)
      .sort((a, b) => b.itens - a.itens)
      .slice(0, 5);
  }, [pedidosFiltrados, lojas, lojaFiltro, produtoFiltro]);

  const limparFiltros = () => {
    setDataInicio(undefined);
    setDataFim(undefined);
    setLojaFiltro('todas');
    setProdutoFiltro('todos');
    setEntidadeFiltro('todas');
  };

  const temFiltrosAtivos = dataInicio || dataFim || lojaFiltro !== 'todas' || produtoFiltro !== 'todos' || entidadeFiltro !== 'todas';

  // Produtos filtrados por entidade para o select
  const produtosFiltradosParaSelect = entidadeFiltro !== 'todas' 
    ? produtos.filter(p => p.entidadeId === entidadeFiltro)
    : produtos;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Filtro Entidade */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Entidade</label>
                <Select value={entidadeFiltro} onValueChange={setEntidadeFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as entidades</SelectItem>
                    {entidades.map((ent) => (
                      <SelectItem key={ent.id} value={ent.id}>
                        {ent.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data Início */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Data Início</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataInicio && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataInicio}
                      onSelect={setDataInicio}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data Fim */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Data Fim</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataFim && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataFim ? format(dataFim, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataFim}
                      onSelect={setDataFim}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filtro Loja */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Loja / Setor</label>
                <Select value={lojaFiltro} onValueChange={setLojaFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as lojas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as lojas</SelectItem>
                    {lojas.map((loja) => (
                      <SelectItem key={loja.id} value={loja.id}>
                        {loja.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Produto */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Produto</label>
                <Select value={produtoFiltro} onValueChange={setProdutoFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os produtos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os produtos</SelectItem>
                    {produtosFiltradosParaSelect.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {temFiltrosAtivos && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={limparFiltros}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

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

          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                  <Filter className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.pedidosFiltrados}</p>
                  <p className="text-xs text-muted-foreground">Filtrados</p>
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
                  <p className="text-2xl font-bold text-foreground">{stats.lojasQuePediram}</p>
                  <p className="text-xs text-muted-foreground">Lojas Pedindo</p>
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
                  <p className="text-2xl font-bold text-foreground">{stats.produtosAbertos}</p>
                  <p className="text-xs text-muted-foreground">Produtos Abertos</p>
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
                {produtoFiltro !== 'todos' && (
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    (filtrado)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {produtosMaisPedidos.length > 0 ? (
                <div className="space-y-3">
                  {produtosMaisPedidos.map((item, index) => {
                    const maxQtd = produtosMaisPedidos[0]?.quantidade || 1;
                    const percentage = (item.quantidade / maxQtd) * 100;

                    return (
                      <div key={item.produto?.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                              {index + 1}
                            </span>
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.produto?.nome}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-primary ml-2">{item.quantidade}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden ml-8">
                          <div
                            className="h-full gradient-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum pedido encontrado com esses filtros.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Orders by Store */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-accent" />
                Consumo por Loja
                {lojaFiltro !== 'todas' && (
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    (filtrado)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pedidosPorLoja.length > 0 ? (
                <div className="space-y-3">
                  {pedidosPorLoja.map((item, index) => {
                    const maxItens = pedidosPorLoja[0]?.itens || 1;
                    const percentage = (item.itens / maxItens) * 100;

                    return (
                      <div key={item.loja?.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent shrink-0">
                              {index + 1}
                            </span>
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.loja?.nome}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <span className="text-sm font-bold text-accent">{item.itens} itens</span>
                            <span className="text-xs text-muted-foreground ml-1">({item.pedidos} ped.)</span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden ml-8">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum pedido encontrado com esses filtros.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
