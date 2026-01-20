import { useState, useMemo } from 'react';
import { ClipboardList, Store, Package, Filter, TrendingUp, BarChart3, Calendar, Loader2, Clock, CheckCircle, ShoppingCart, PackageX, ExternalLink, Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ProdutosAnalytics } from '@/components/admin/ProdutosAnalytics';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useEntidades, useLojas, useProdutos, usePedidos } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { pedidos, loading: loadingPedidos } = usePedidos();
  const { lojas, loading: loadingLojas } = useLojas();
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { entidades, loading: loadingEntidades } = useEntidades();

  // Filtros
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined);
  const [lojaFiltro, setLojaFiltro] = useState<string>('todas');
  const [produtoFiltro, setProdutoFiltro] = useState<string>('todos');
  const [entidadeFiltro, setEntidadeFiltro] = useState<string>('todas');
  const [showProdutosAnalytics, setShowProdutosAnalytics] = useState(false);
  const [produtoPopoverOpen, setProdutoPopoverOpen] = useState(false);
  const [lojaPopoverOpen, setLojaPopoverOpen] = useState(false);

  const isLoading = loadingPedidos || loadingLojas || loadingProdutos || loadingEntidades;

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
    
    // Produtos filtrados por entidade
    const produtosDaEntidade = entidadeFiltro !== 'todas' 
      ? produtos.filter((p) => p.entidadeId === entidadeFiltro)
      : produtos;
    
    const produtosAtivos = produtosDaEntidade.filter((p) => p.status === 'ativo');
    const produtosInativos = produtosDaEntidade.filter((p) => p.status === 'inativo');
    
    // Total de itens nos pedidos filtrados
    const totalItens = pedidosFiltrados.reduce((acc, pedido) => {
      return acc + pedido.itens.reduce((sum, item) => {
        // Se tem filtro de produto, contar apenas esse
        if (produtoFiltro !== 'todos' && item.produtoId !== produtoFiltro) return sum;
        return sum + item.quantidade;
      }, 0);
    }, 0);
    
    // Status dos pedidos filtrados
    const pedidosPendentes = pedidosFiltrados.filter(p => p.status === 'pendente').length;
    const pedidosFeitos = pedidosFiltrados.filter(p => p.status === 'feito').length;

    return {
      totalPedidos: pedidos.length,
      pedidosFiltrados: pedidosFiltrados.length,
      lojasQuePediram: lojasQuePediram.size,
      produtosAtivos: produtosAtivos.length,
      produtosInativos: produtosInativos.length,
      totalItens,
      pedidosPendentes,
      pedidosFeitos,
    };
  }, [pedidos, pedidosFiltrados, produtos, entidadeFiltro, produtoFiltro]);

  // Métricas detalhadas do produto selecionado
  const metricasProduto = useMemo(() => {
    if (produtoFiltro === 'todos') return null;

    const produto = produtos.find(p => p.id === produtoFiltro);
    if (!produto) return null;

    let totalQuantidade = 0;
    let pedidosComProduto = 0;
    let quantidadePendente = 0;
    let quantidadeConcluida = 0;

    pedidosFiltrados.forEach(pedido => {
      const item = pedido.itens.find(i => i.produtoId === produtoFiltro);
      if (item) {
        pedidosComProduto++;
        totalQuantidade += item.quantidade;
        if (pedido.status === 'pendente') {
          quantidadePendente += item.quantidade;
        } else {
          quantidadeConcluida += item.quantidade;
        }
      }
    });

    return {
      produto,
      totalQuantidade,
      pedidosComProduto,
      quantidadePendente,
      quantidadeConcluida,
    };
  }, [produtoFiltro, produtos, pedidosFiltrados]);

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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do sistema</p>
          </div>
          {entidadeFiltro !== 'todas' && (
            <Badge variant="secondary" className="flex items-center gap-2 w-fit">
              <Filter className="h-3 w-3" />
              Contexto: {entidades.find(e => e.id === entidadeFiltro)?.nome}
            </Badge>
          )}
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
                <Popover open={lojaPopoverOpen} onOpenChange={setLojaPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={lojaPopoverOpen}
                      className="w-full justify-between font-normal"
                    >
                      {lojaFiltro === 'todas'
                        ? 'Todas as lojas'
                        : lojas.find(l => l.id === lojaFiltro)?.nome || 'Selecionar...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command filter={(value, search) => {
                      if (value === 'todas') {
                        return 'todas as lojas'.includes(search.toLowerCase()) ? 1 : 0;
                      }
                      const loja = lojas.find(l => l.id === value);
                      if (!loja) return 0;
                      return loja.nome.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                    }}>
                      <CommandInput placeholder="Buscar loja..." />
                      <CommandList>
                        <CommandEmpty>Nenhuma loja encontrada.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="todas"
                            onSelect={() => {
                              setLojaFiltro('todas');
                              setLojaPopoverOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", lojaFiltro === 'todas' ? "opacity-100" : "opacity-0")} />
                            Todas as lojas
                          </CommandItem>
                          {lojas.map((loja) => (
                            <CommandItem
                              key={loja.id}
                              value={loja.id}
                              onSelect={() => {
                                setLojaFiltro(loja.id);
                                setLojaPopoverOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", lojaFiltro === loja.id ? "opacity-100" : "opacity-0")} />
                              {loja.nome}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filtro Produto com busca */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Produto</label>
                <Popover open={produtoPopoverOpen} onOpenChange={setProdutoPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={produtoPopoverOpen}
                      className="w-full justify-between font-normal"
                    >
                      {produtoFiltro === 'todos'
                        ? 'Todos os produtos'
                        : produtosFiltradosParaSelect.find(p => p.id === produtoFiltro)?.nome || 'Selecionar...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command filter={(value, search) => {
                      if (value === 'todos') {
                        return 'todos os produtos'.includes(search.toLowerCase()) ? 1 : 0;
                      }
                      const produto = produtosFiltradosParaSelect.find(p => p.id === value);
                      if (!produto) return 0;
                      const searchLower = search.toLowerCase();
                      return (produto.nome.toLowerCase().includes(searchLower) || produto.codigo.toLowerCase().includes(searchLower)) ? 1 : 0;
                    }}>
                      <CommandInput placeholder="Buscar por nome ou código..." />
                      <CommandList>
                        <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="todos"
                            onSelect={() => {
                              setProdutoFiltro('todos');
                              setProdutoPopoverOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", produtoFiltro === 'todos' ? "opacity-100" : "opacity-0")} />
                            Todos os produtos
                          </CommandItem>
                          {produtosFiltradosParaSelect.map((produto) => (
                            <CommandItem
                              key={produto.id}
                              value={produto.id}
                              onSelect={() => {
                                setProdutoFiltro(produto.id);
                                setProdutoPopoverOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", produtoFiltro === produto.id ? "opacity-100" : "opacity-0")} />
                              <span className="flex-1">{produto.nome}</span>
                              <span className="text-xs text-muted-foreground ml-2">{produto.codigo}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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

        {/* Stats Cards - Linha 1: Pedidos e Totais */}
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalItens}</p>
                  <p className="text-xs text-muted-foreground">Total de Itens</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards - Linha 2: Produtos e Status */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.produtosAtivos}</p>
                  <p className="text-xs text-muted-foreground">
                    Produtos Ativos
                    {entidadeFiltro !== 'todas' && <span className="text-primary"> (entidade)</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <PackageX className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.produtosInativos}</p>
                  <p className="text-xs text-muted-foreground">
                    Produtos Inativos
                    {entidadeFiltro !== 'todas' && <span className="text-primary"> (entidade)</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pedidosPendentes}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.pedidosFeitos}</p>
                  <p className="text-xs text-muted-foreground">Concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card de Métricas do Produto (quando filtrado) */}
        {metricasProduto && (
          <Card className="border-primary bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                Detalhes do Produto: {metricasProduto.produto.nome}
                <Badge variant="outline" className="ml-2">
                  {metricasProduto.produto.codigo}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-background rounded-lg border">
                  <p className="text-2xl font-bold text-primary">{metricasProduto.totalQuantidade}</p>
                  <p className="text-xs text-muted-foreground">Total Solicitado</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg border">
                  <p className="text-2xl font-bold text-foreground">{metricasProduto.pedidosComProduto}</p>
                  <p className="text-xs text-muted-foreground">Pedidos</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg border">
                  <p className="text-2xl font-bold text-yellow-600">{metricasProduto.quantidadePendente}</p>
                  <p className="text-xs text-muted-foreground">Qtd Pendente</p>
                </div>
                <div className="text-center p-3 bg-background rounded-lg border">
                  <p className="text-2xl font-bold text-green-600">{metricasProduto.quantidadeConcluida}</p>
                  <p className="text-xs text-muted-foreground">Qtd Concluída</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Produtos Mais Pedidos
                  {produtoFiltro !== 'todos' && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      (filtrado)
                    </span>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProdutosAnalytics(true)}
                  className="text-primary hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver todos
                </Button>
              </div>
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
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {item.produto?.nome}
                              </p>
                              {item.produto?.codigo && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {item.produto.codigo}
                                </p>
                              )}
                            </div>
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
        {/* Modal de Análise de Produtos */}
        <ProdutosAnalytics
          pedidos={pedidos}
          produtos={produtos}
          entidadeFiltro={entidadeFiltro}
          open={showProdutosAnalytics}
          onOpenChange={setShowProdutosAnalytics}
        />
      </div>
    </AdminLayout>
  );
}
