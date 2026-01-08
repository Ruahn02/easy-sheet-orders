import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Calendar, Download, Check, Palette, AlertCircle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useEntidades, useLojas, useProdutos, usePedidos } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CORES_DISPONIVEIS = [
  { value: undefined, label: 'Sem cor' },
  { value: '#dcfce7', label: 'Verde claro' },
  { value: '#fef3c7', label: 'Amarelo claro' },
  { value: '#fce7f3', label: 'Rosa claro' },
  { value: '#dbeafe', label: 'Azul claro' },
  { value: '#f3e8ff', label: 'Roxo claro' },
];

export default function Pedidos() {
  const { pedidos, loading, updatePedidoStatus, updatePedidoCor } = usePedidos();
  const { lojas } = useLojas();
  const { produtos } = useProdutos();
  const { entidades } = useEntidades();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLojaId, setSelectedLojaId] = useState<string>('all');
  const [selectedEntidadeId, setSelectedEntidadeId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [pedidoParaConcluir, setPedidoParaConcluir] = useState<string | null>(null);

  // Entidade selecionada
  const entidadeSelecionada = entidades.find(e => e.id === selectedEntidadeId);

  // Produtos APENAS da entidade selecionada
  const produtosDaEntidade = useMemo(() => {
    if (!selectedEntidadeId) return [];
    return produtos.filter((p) => p.entidadeId === selectedEntidadeId);
  }, [produtos, selectedEntidadeId]);

  // Pedidos APENAS da entidade selecionada
  const filteredPedidos = useMemo(() => {
    if (!selectedEntidadeId) return [];
    
    return pedidos.filter((pedido) => {
      // OBRIGATÓRIO: filtrar por entidade
      if (pedido.entidadeId !== selectedEntidadeId) return false;

      // Filtro por status
      if (statusFilter !== 'all') {
        if (statusFilter === 'pendente' && pedido.status !== 'pendente') return false;
        if (statusFilter === 'feito' && pedido.status !== 'feito') return false;
      }

      // Filter by store
      if (selectedLojaId !== 'all' && pedido.lojaId !== selectedLojaId) return false;

      // Filter by date range
      if (startDate) {
        const pedidoDate = new Date(pedido.data);
        pedidoDate.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (pedidoDate < start) return false;
      }
      if (endDate) {
        const pedidoDate = new Date(pedido.data);
        pedidoDate.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (pedidoDate > end) return false;
      }

      // Filter by search (product name or code)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const hasMatchingProduct = pedido.itens.some((item) => {
          const produto = produtos.find((p) => p.id === item.produtoId);
          return (
            produto?.nome.toLowerCase().includes(query) ||
            produto?.codigo.toLowerCase().includes(query)
          );
        });
        if (!hasMatchingProduct) return false;
      }

      return true;
    });
  }, [pedidos, selectedLojaId, selectedEntidadeId, statusFilter, startDate, endDate, searchQuery, produtos]);

  const handleMarcarFeito = async (pedidoId: string) => {
    const success = await updatePedidoStatus(pedidoId, 'feito');
    if (success) {
      toast({ title: 'Pedido marcado como feito!' });
    }
  };

  const handleUpdateCor = async (pedidoId: string, cor: string | undefined) => {
    await updatePedidoCor(pedidoId, cor);
  };

  const handleExportCSV = () => {
    toast({
      title: 'Exportação',
      description: 'Funcionalidade de exportação disponível.',
    });
  };

  const getQuantidadeProduto = (pedidoId: string, produtoId: string) => {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    const item = pedido?.itens.find((i) => i.produtoId === produtoId);
    return item?.quantidade || 0;
  };

  if (loading) {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
            <p className="text-muted-foreground">
              {entidadeSelecionada 
                ? `Planilha: ${entidadeSelecionada.nome}` 
                : 'Selecione um tipo de pedido para ver a planilha'}
            </p>
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2" disabled={!selectedEntidadeId}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Seletor de Tipo de Pedido - OBRIGATÓRIO */}
        <div className="p-4 rounded-lg border-2 border-primary/50 bg-primary/5">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Selecione o Tipo de Pedido para ver a planilha:
          </label>
          <Select value={selectedEntidadeId} onValueChange={setSelectedEntidadeId}>
            <SelectTrigger className="bg-card text-lg font-medium">
              <SelectValue placeholder="👉 Escolha o tipo de pedido..." />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {entidades.map((ent) => (
                <SelectItem key={ent.id} value={ent.id}>
                  {ent.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aviso se não selecionou entidade */}
        {!selectedEntidadeId && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Selecione um tipo de pedido acima para visualizar a planilha correspondente.
              <br />
              <strong>Cada tipo de pedido tem sua própria planilha.</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters - só aparecem se selecionou entidade */}
        {selectedEntidadeId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedLojaId} onValueChange={setSelectedLojaId}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Todas as lojas" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">Todas as lojas</SelectItem>
                {lojas.map((loja) => (
                  <SelectItem key={loja.id} value={loja.id}>
                    {loja.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="feito">Feitos</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'dd/MM/yyyy') : 'Data inicial'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover z-50">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'dd/MM/yyyy') : 'Data final'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover z-50">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Table - só aparece se selecionou entidade */}
        {selectedEntidadeId && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-secondary">
                    <th className="px-4 py-3 text-left font-medium text-foreground sticky left-0 bg-secondary z-20">Data</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Hora</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Loja</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Observações</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                    {produtosDaEntidade.map((produto) => (
                      <th key={produto.id} className="px-3 py-3 text-center font-medium text-foreground whitespace-nowrap min-w-[80px]">
                        <div className="text-xs">{produto.codigo}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[100px]" title={produto.nome}>
                          {produto.nome}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-medium text-foreground sticky right-0 bg-secondary z-20">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPedidos.length > 0 ? (
                    filteredPedidos.map((pedido) => {
                      const loja = lojas.find((l) => l.id === pedido.lojaId);
                      return (
                        <tr
                          key={pedido.id}
                          className={cn(
                            'border-b border-border transition-colors',
                            pedido.status === 'feito' && 'opacity-60'
                          )}
                          style={{ backgroundColor: pedido.corLinha }}
                        >
                          <td className="px-4 py-3 text-foreground sticky left-0 bg-inherit">
                            {format(new Date(pedido.data), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {format(new Date(pedido.data), 'HH:mm')}
                          </td>
                          <td className="px-4 py-3 text-foreground">{loja?.nome || '-'}</td>
                          <td className="px-4 py-3 text-foreground max-w-[200px]">
                            {pedido.observacoes ? (
                              <span className="truncate block" title={pedido.observacoes}>
                                {pedido.observacoes}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={pedido.status === 'feito' ? 'default' : 'secondary'}
                              className={cn(
                                pedido.status === 'feito'
                                  ? 'bg-accent text-accent-foreground'
                                  : 'bg-warning/20 text-warning-foreground'
                              )}
                            >
                              {pedido.status === 'feito' ? 'Feito' : 'Pendente'}
                            </Badge>
                          </td>
                          {produtosDaEntidade.map((produto) => {
                            const qty = getQuantidadeProduto(pedido.id, produto.id);
                            return (
                              <td key={produto.id} className="px-3 py-3 text-center">
                                {qty > 0 ? (
                                  <span className="font-medium text-primary">{qty}</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 sticky right-0 bg-inherit">
                            <div className="flex items-center justify-center gap-2">
                              {pedido.status === 'pendente' && (
                                <Button
                                  size="sm"
                                  onClick={() => setPedidoParaConcluir(pedido.id)}
                                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Feito
                                </Button>
                              )}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Palette className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-40 p-2 bg-popover z-50">
                                  <div className="space-y-1">
                                    {CORES_DISPONIVEIS.map((cor) => (
                                      <button
                                        key={cor.label}
                                        onClick={() => handleUpdateCor(pedido.id, cor.value)}
                                        className={cn(
                                          'w-full px-3 py-2 text-left text-sm rounded-md transition-colors hover:bg-secondary',
                                          pedido.corLinha === cor.value && 'ring-2 ring-primary'
                                        )}
                                        style={{ backgroundColor: cor.value }}
                                      >
                                        {cor.label}
                                      </button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={produtosDaEntidade.length + 6} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhum pedido encontrado para este tipo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AlertDialog 
        open={!!pedidoParaConcluir} 
        onOpenChange={(open) => !open && setPedidoParaConcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar conclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja marcar este pedido como concluído?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (pedidoParaConcluir) {
                handleMarcarFeito(pedidoParaConcluir);
                setPedidoParaConcluir(null);
              }
            }}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
