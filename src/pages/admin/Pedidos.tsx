import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, Calendar, Download, Check, Palette, AlertCircle, Loader2, ChevronsUpDown } from 'lucide-react';
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
  const [lojaPopoverOpen, setLojaPopoverOpen] = useState(false);
  
  // Estado para navegação estilo planilha
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

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

  // Número total de colunas navegáveis (excluindo Ações)
  const totalCols = 5 + produtosDaEntidade.length; // Data, Hora, Loja, Obs, Status + produtos

  // Função para obter conteúdo da célula (suporta cabeçalho com row = -1)
  const getCellContent = useCallback((rowIndex: number, colIndex: number): string => {
    // CABEÇALHO (row = -1): retorna apenas o código do produto
    if (rowIndex === -1) {
      if (colIndex >= 5) {
        const produtoIndex = colIndex - 5;
        const produto = produtosDaEntidade[produtoIndex];
        return produto?.codigo || '';
      }
      // Colunas fixas do cabeçalho
      const headerLabels = ['Data', 'Hora', 'Loja', 'Observações', 'Status'];
      return headerLabels[colIndex] || '';
    }

    // CORPO DA TABELA (row >= 0)
    const pedido = filteredPedidos[rowIndex];
    if (!pedido) return '';
    
    const loja = lojas.find(l => l.id === pedido.lojaId);
    
    switch (colIndex) {
      case 0: return format(new Date(pedido.data), 'dd/MM/yyyy');
      case 1: return format(new Date(pedido.data), 'HH:mm');
      case 2: return loja?.nome || '-';
      case 3: return pedido.observacoes || '-';
      case 4: return pedido.status === 'feito' ? 'Feito' : 'Pendente';
      default: {
        // Colunas de produtos (índice 5 em diante)
        const produtoIndex = colIndex - 5;
        const produto = produtosDaEntidade[produtoIndex];
        if (produto) {
          const item = pedido.itens.find(i => i.produtoId === produto.id);
          return item?.quantidade?.toString() || '0';
        }
        return '';
      }
    }
  }, [filteredPedidos, lojas, produtosDaEntidade]);

  // Navegação por teclado e Ctrl+C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        return;
      }

      // Ctrl+C para copiar
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && focusedCell) {
        e.preventDefault();
        const content = getCellContent(focusedCell.row, focusedCell.col);
        
        // Função de fallback usando execCommand
        const fallbackCopy = (text: string) => {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.left = '-9999px';
          textarea.style.top = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          try {
            document.execCommand('copy');
            toast({ title: 'Copiado!', description: text.length > 50 ? text.slice(0, 50) + '...' : text });
          } catch (err) {
            toast({ title: 'Erro ao copiar', variant: 'destructive' });
          }
          document.body.removeChild(textarea);
        };
        
        // Tentar API moderna primeiro
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(content)
            .then(() => {
              toast({ title: 'Copiado!', description: content.length > 50 ? content.slice(0, 50) + '...' : content });
            })
            .catch(() => {
              // Fallback para execCommand
              fallbackCopy(content);
            });
        } else {
          // Fallback para navegadores antigos
          fallbackCopy(content);
        }
        return;
      }

      // Navegação por setas
      if (!focusedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Se não tem célula focada, começar na primeira célula do corpo
        setFocusedCell({ row: 0, col: 0 });
        e.preventDefault();
        return;
      }

      if (focusedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const { row, col } = focusedCell;
        const minRow = -1; // Cabeçalho
        const maxRow = filteredPedidos.length - 1;
        const maxCol = totalCols - 1;

        // Se estiver no cabeçalho (row = -1), navega entre TODAS as colunas
        if (row === -1) {
          switch (e.key) {
            case 'ArrowUp':
              // Já está no topo, não faz nada
              break;
            case 'ArrowDown':
              setFocusedCell({ row: 0, col });
              break;
            case 'ArrowLeft':
              setFocusedCell({ row, col: Math.max(0, col - 1) });
              break;
            case 'ArrowRight':
              setFocusedCell({ row, col: Math.min(maxCol, col + 1) });
              break;
          }
        } else {
          // Corpo da tabela
          switch (e.key) {
            case 'ArrowUp':
              // Se estiver na primeira linha, vai para o cabeçalho (todas as colunas)
              if (row === 0) {
                setFocusedCell({ row: -1, col });
              } else {
                setFocusedCell({ row: Math.max(0, row - 1), col });
              }
              break;
            case 'ArrowDown':
              setFocusedCell({ row: Math.min(maxRow, row + 1), col });
              break;
            case 'ArrowLeft':
              setFocusedCell({ row, col: Math.max(0, col - 1) });
              break;
            case 'ArrowRight':
              setFocusedCell({ row, col: Math.min(maxCol, col + 1) });
              break;
          }
        }
      }

      // Escape para desfocar
      if (e.key === 'Escape') {
        setFocusedCell(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, filteredPedidos.length, totalCols, getCellContent, toast]);

  // Scroll automático ao navegar por teclado
  useEffect(() => {
    if (focusedCell && tableRef.current) {
      const cell = tableRef.current.querySelector(
        `[data-row="${focusedCell.row}"][data-col="${focusedCell.col}"]`
      ) as HTMLElement;
      
      if (cell) {
        cell.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [focusedCell]);

  // Limpar foco quando muda a entidade
  useEffect(() => {
    setFocusedCell(null);
  }, [selectedEntidadeId]);

  const handleExportCSV = () => {
    if (!selectedEntidadeId || filteredPedidos.length === 0) {
      toast({ title: 'Nenhum pedido para exportar', variant: 'destructive' });
      return;
    }

    // Cabeçalhos: Data | Hora | Loja | Observações | Status | Produtos...
    const headers = [
      'Data',
      'Hora',
      'Loja',
      'Observações',
      'Status',
      ...produtosDaEntidade.map(p => `${p.codigo} - ${p.nome}`)
    ];

    // Linhas de dados
    const rows = filteredPedidos.map(pedido => {
      const loja = lojas.find(l => l.id === pedido.lojaId);
      return [
        format(new Date(pedido.data), 'dd/MM/yyyy'),
        format(new Date(pedido.data), 'HH:mm'),
        loja?.nome || '-',
        pedido.observacoes || '-',
        pedido.status === 'feito' ? 'Feito' : 'Pendente',
        ...produtosDaEntidade.map(p => {
          const item = pedido.itens.find(i => i.produtoId === p.id);
          return item?.quantidade?.toString() || '0';
        })
      ];
    });

    // Gerar CSV com escape correto
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    // Download com BOM para suporte UTF-8 no Excel
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_${entidadeSelecionada?.nome || 'export'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({ title: 'CSV exportado com sucesso!', description: `${filteredPedidos.length} pedidos exportados.` });
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
      <div className="flex flex-col h-full animate-fade-in overflow-hidden">
        {/* ÁREA FIXA - Filtros e ações (largura independente da tabela) */}
        <div className="flex-shrink-0 w-full max-w-full overflow-hidden space-y-4 pb-4">
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
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 w-32 text-sm"
              />
            </div>

            <Popover open={lojaPopoverOpen} onOpenChange={setLojaPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={lojaPopoverOpen}
                  className="bg-card h-8 w-40 justify-between text-sm font-normal"
                >
                  {selectedLojaId === 'all'
                    ? 'Todas as lojas'
                    : lojas.find(l => l.id === selectedLojaId)?.nome || 'Selecionar...'}
                  <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0" align="start">
                <Command filter={(value, search) => {
                  if (value === 'all') {
                    return 'todas as lojas'.includes(search.toLowerCase()) ? 1 : 0;
                  }
                  const loja = lojas.find(l => l.id === value);
                  if (!loja) return 0;
                  return loja.nome.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                }}>
                  <CommandInput placeholder="Buscar loja..." className="h-8" />
                  <CommandList>
                    <CommandEmpty>Nenhuma loja encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setSelectedLojaId('all');
                          setLojaPopoverOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedLojaId === 'all' ? "opacity-100" : "opacity-0")} />
                        Todas as lojas
                      </CommandItem>
                      {lojas.map((loja) => (
                        <CommandItem
                          key={loja.id}
                          value={loja.id}
                          onSelect={() => {
                            setSelectedLojaId(loja.id);
                            setLojaPopoverOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedLojaId === loja.id ? "opacity-100" : "opacity-0")} />
                          {loja.nome}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-card h-8 w-28 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="feito">Feitos</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 text-sm">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  {startDate ? format(startDate, 'dd/MM') : 'Início'}
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
                <Button variant="outline" size="sm" className="h-8 px-2 text-sm">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  {endDate ? format(endDate, 'dd/MM') : 'Fim'}
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
        </div>

        {/* ÁREA DA TABELA - Scroll horizontal independente */}
        {selectedEntidadeId && (
          <div className="flex-1 min-h-0 min-w-0 overflow-x-auto">
            <div className="inline-block min-w-full h-full rounded-lg border border-border bg-card overflow-hidden">
              <div className="overflow-y-auto h-full max-h-[calc(100vh-350px)]">
              <table ref={tableRef} className="w-full text-sm" tabIndex={0}>
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-secondary">
                    <th 
                      data-row={-1}
                      data-col={0}
                      className={cn(
                        "px-2 py-1.5 text-left text-xs font-medium text-foreground sticky left-0 bg-secondary z-20 cursor-pointer",
                        focusedCell?.row === -1 && focusedCell?.col === 0 && 
                          "ring-2 ring-primary ring-inset bg-primary/10"
                      )}
                      onClick={() => setFocusedCell({ row: -1, col: 0 })}
                    >
                      Data
                    </th>
                    <th 
                      data-row={-1}
                      data-col={1}
                      className={cn(
                        "px-2 py-1.5 text-left text-xs font-medium text-foreground cursor-pointer",
                        focusedCell?.row === -1 && focusedCell?.col === 1 && 
                          "ring-2 ring-primary ring-inset bg-primary/10"
                      )}
                      onClick={() => setFocusedCell({ row: -1, col: 1 })}
                    >
                      Hora
                    </th>
                    <th 
                      data-row={-1}
                      data-col={2}
                      className={cn(
                        "px-2 py-1.5 text-left text-xs font-medium text-foreground cursor-pointer",
                        focusedCell?.row === -1 && focusedCell?.col === 2 && 
                          "ring-2 ring-primary ring-inset bg-primary/10"
                      )}
                      onClick={() => setFocusedCell({ row: -1, col: 2 })}
                    >
                      Loja
                    </th>
                    <th 
                      data-row={-1}
                      data-col={3}
                      className={cn(
                        "px-2 py-1.5 text-left text-xs font-medium text-foreground cursor-pointer",
                        focusedCell?.row === -1 && focusedCell?.col === 3 && 
                          "ring-2 ring-primary ring-inset bg-primary/10"
                      )}
                      onClick={() => setFocusedCell({ row: -1, col: 3 })}
                    >
                      Obs
                    </th>
                    <th 
                      data-row={-1}
                      data-col={4}
                      className={cn(
                        "px-2 py-1.5 text-left text-xs font-medium text-foreground cursor-pointer",
                        focusedCell?.row === -1 && focusedCell?.col === 4 && 
                          "ring-2 ring-primary ring-inset bg-primary/10"
                      )}
                      onClick={() => setFocusedCell({ row: -1, col: 4 })}
                    >
                      Status
                    </th>
                    {produtosDaEntidade.map((produto, produtoIndex) => {
                      const colIndex = 5 + produtoIndex;
                      return (
                        <th 
                          key={produto.id} 
                          data-row={-1}
                          data-col={colIndex}
                          className={cn(
                            "px-2 py-1.5 text-center text-xs font-medium text-foreground whitespace-nowrap min-w-[60px] cursor-pointer select-text",
                            focusedCell?.row === -1 && focusedCell?.col === colIndex && 
                              "ring-2 ring-primary ring-inset bg-primary/10"
                          )}
                          onClick={() => setFocusedCell({ row: -1, col: colIndex })}
                        >
                          <span className="select-text">{produto.codigo}</span>
                          <div className="text-[10px] text-muted-foreground truncate max-w-[80px] select-text" title={produto.nome}>
                            {produto.nome}
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-2 py-1.5 text-center text-xs font-medium text-foreground sticky right-0 bg-secondary z-20">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPedidos.length > 0 ? (
                    filteredPedidos.map((pedido, rowIndex) => {
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
                          <td 
                            data-row={rowIndex}
                            data-col={0}
                            className={cn(
                              "px-2 py-1 text-xs text-foreground sticky left-0 bg-inherit cursor-pointer select-text",
                              focusedCell?.row === rowIndex && focusedCell?.col === 0 && 
                                "ring-2 ring-primary ring-inset bg-primary/10"
                            )}
                            onClick={() => setFocusedCell({ row: rowIndex, col: 0 })}
                          >
                            {format(new Date(pedido.data), 'dd/MM')}
                          </td>
                          <td 
                            data-row={rowIndex}
                            data-col={1}
                            className={cn(
                              "px-2 py-1 text-xs text-foreground cursor-pointer select-text",
                              focusedCell?.row === rowIndex && focusedCell?.col === 1 && 
                                "ring-2 ring-primary ring-inset bg-primary/10"
                            )}
                            onClick={() => setFocusedCell({ row: rowIndex, col: 1 })}
                          >
                            {format(new Date(pedido.data), 'HH:mm')}
                          </td>
                          <td 
                            data-row={rowIndex}
                            data-col={2}
                            className={cn(
                              "px-2 py-1 text-xs text-foreground cursor-pointer select-text",
                              focusedCell?.row === rowIndex && focusedCell?.col === 2 && 
                                "ring-2 ring-primary ring-inset bg-primary/10"
                            )}
                            onClick={() => setFocusedCell({ row: rowIndex, col: 2 })}
                          >
                            {loja?.nome || '-'}
                          </td>
                          <td 
                            data-row={rowIndex}
                            data-col={3}
                            className={cn(
                              "px-2 py-1 text-xs text-foreground min-w-[120px] max-w-[300px] cursor-pointer select-text",
                              focusedCell?.row === rowIndex && focusedCell?.col === 3 && 
                                "ring-2 ring-primary ring-inset bg-primary/10"
                            )}
                            onClick={() => setFocusedCell({ row: rowIndex, col: 3 })}
                          >
                            {pedido.observacoes ? (
                              <span className="whitespace-pre-wrap break-words">
                                {pedido.observacoes}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td 
                            data-row={rowIndex}
                            data-col={4}
                            className={cn(
                              "px-2 py-1 cursor-pointer select-text",
                              focusedCell?.row === rowIndex && focusedCell?.col === 4 && 
                                "ring-2 ring-primary ring-inset bg-primary/10"
                            )}
                            onClick={() => setFocusedCell({ row: rowIndex, col: 4 })}
                          >
                            <Badge
                              variant={pedido.status === 'feito' ? 'default' : 'secondary'}
                              className={cn(
                                "text-[10px] px-1.5 py-0",
                                pedido.status === 'feito'
                                  ? 'bg-accent text-accent-foreground'
                                  : 'bg-warning/20 text-warning-foreground'
                              )}
                            >
                              {pedido.status === 'feito' ? 'Feito' : 'Pendente'}
                            </Badge>
                          </td>
                          {produtosDaEntidade.map((produto, produtoIndex) => {
                            const qty = getQuantidadeProduto(pedido.id, produto.id);
                            const colIndex = 5 + produtoIndex;
                            return (
                              <td 
                                key={produto.id}
                                data-row={rowIndex}
                                data-col={colIndex}
                              className={cn(
                                  "px-2 py-1 text-xs text-center cursor-pointer select-text",
                                  focusedCell?.row === rowIndex && focusedCell?.col === colIndex && 
                                    "ring-2 ring-primary ring-inset bg-primary/10",
                                  qty === 0 && "bg-red-100 dark:bg-red-900/30"
                                )}
                                onClick={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                              >
                                {qty > 0 ? (
                                  <span className="font-medium text-primary select-text">{qty}</span>
                                ) : (
                                  <span className="text-muted-foreground select-text">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-2 py-1 sticky right-0 bg-inherit">
                            <div className="flex items-center justify-center gap-1">
                              {pedido.status === 'pendente' && (
                                <Button
                                  size="sm"
                                  onClick={() => setPedidoParaConcluir(pedido.id)}
                                  className="bg-accent text-accent-foreground hover:bg-accent/90 h-6 px-2 text-xs"
                                >
                                  <Check className="h-3 w-3 mr-0.5" />
                                  Feito
                                </Button>
                              )}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                                    <Palette className="h-3 w-3" />
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
