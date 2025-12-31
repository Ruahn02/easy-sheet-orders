import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Calendar, Download, Check, Palette } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAppStore } from '@/store/useAppStore';
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

const CORES_DISPONIVEIS = [
  { value: undefined, label: 'Sem cor' },
  { value: '#dcfce7', label: 'Verde claro' },
  { value: '#fef3c7', label: 'Amarelo claro' },
  { value: '#fce7f3', label: 'Rosa claro' },
  { value: '#dbeafe', label: 'Azul claro' },
  { value: '#f3e8ff', label: 'Roxo claro' },
];

export default function Pedidos() {
  const { pedidos, lojas, produtos, entidades, updatePedidoStatus, updatePedidoCor } = useAppStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLojaId, setSelectedLojaId] = useState<string>('all');
  const [selectedEntidadeId, setSelectedEntidadeId] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Filtra produtos por entidade selecionada
  const produtosFiltrados = useMemo(() => {
    if (selectedEntidadeId === 'all') return produtos;
    return produtos.filter((p) => p.entidadeId === selectedEntidadeId);
  }, [produtos, selectedEntidadeId]);

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((pedido) => {
      // Filter by entity
      if (selectedEntidadeId !== 'all' && pedido.entidadeId !== selectedEntidadeId) return false;

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
  }, [pedidos, selectedLojaId, selectedEntidadeId, startDate, endDate, searchQuery, produtos]);

  const handleMarcarFeito = (pedidoId: string) => {
    updatePedidoStatus(pedidoId, 'feito');
    toast({ title: 'Pedido marcado como feito!' });
  };

  const handleExportCSV = () => {
    toast({
      title: 'Exportação',
      description: 'Funcionalidade será implementada com Lovable Cloud.',
    });
  };

  const getQuantidadeProduto = (pedidoId: string, produtoId: string) => {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    const item = pedido?.itens.find((i) => i.produtoId === produtoId);
    return item?.quantidade || 0;
  };

  const getEntidadeNome = (entidadeId: string) => {
    return entidades.find((e) => e.id === entidadeId)?.nome || '-';
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
            <p className="text-muted-foreground">Visualize e gerencie todos os pedidos</p>
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Filtro por Entidade */}
          <Select value={selectedEntidadeId} onValueChange={setSelectedEntidadeId}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Todas as entidades" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">Todas as entidades</SelectItem>
              {entidades.map((ent) => (
                <SelectItem key={ent.id} value={ent.id}>
                  {ent.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

        {/* Table */}
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-foreground">Data</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Hora</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Loja</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Entidade</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Observações</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                {produtosFiltrados.map((produto) => (
                  <th key={produto.id} className="px-3 py-3 text-center font-medium text-foreground whitespace-nowrap">
                    {produto.codigo}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-medium text-foreground">Ações</th>
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
                      <td className="px-4 py-3 text-foreground">
                        {format(new Date(pedido.data), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {format(new Date(pedido.data), 'HH:mm')}
                      </td>
                      <td className="px-4 py-3 text-foreground">{loja?.nome || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {getEntidadeNome(pedido.entidadeId)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-foreground max-w-[150px] truncate">
                        {pedido.observacoes || '-'}
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
                      {produtosFiltrados.map((produto) => {
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
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {pedido.status === 'pendente' && (
                            <Button
                              size="sm"
                              onClick={() => handleMarcarFeito(pedido.id)}
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
                                    onClick={() => updatePedidoCor(pedido.id, cor.value)}
                                    className={cn(
                                      'w-full px-3 py-2 text-left text-sm rounded-md transition-colors hover:bg-secondary',
                                      pedido.corLinha === cor.value && 'bg-secondary'
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
                  <td colSpan={produtosFiltrados.length + 7} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
