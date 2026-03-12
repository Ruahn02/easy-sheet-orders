import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useEntidades, useProdutos, useInventario } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MultiSelectFilter } from '@/components/ui/multi-select-filter';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClipboardCheck, Loader2, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Produto } from '@/types';

export default function Inventario() {
  const { entidades, loading: loadingEntidades } = useEntidades();
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { inventario, loading: loadingInventario, conferirProduto } = useInventario();

  // Filtros
  const [entidadeFiltro, setEntidadeFiltro] = useState<string[]>([]);
  const [produtoFiltro, setProdutoFiltro] = useState<string[]>([]);
  const [statusFiltro, setStatusFiltro] = useState<string[]>([]);

  // Modal de conferência
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidadeConferida, setQuantidadeConferida] = useState<string>('');
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string>('un');
  const [salvando, setSalvando] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  // Opções de unidade de medida
  const UNIDADES = [
    { value: 'un', label: 'un (unidade)' },
    { value: 'fd', label: 'fd (fardo)' },
    { value: 'cx', label: 'cx (caixa)' },
    { value: 'pct', label: 'pct (pacote)' },
    { value: 'kg', label: 'kg (quilo)' },
  ];

  const loading = loadingEntidades || loadingProdutos || loadingInventario;

  // Seleciona primeira entidade automaticamente
  useMemo(() => {
    if (entidades.length > 0 && entidadeFiltro.length === 0) {
      setEntidadeFiltro([entidades[0].id]);
    }
  }, [entidades, entidadeFiltro]);

  // Produtos filtrados por entidade - usando N:N
  const produtosDaEntidade = useMemo(() => {
    if (entidadeFiltro.length === 0) return [];
    return produtos.filter(p => p.entidadeIds.some(id => entidadeFiltro.includes(id)));
  }, [produtos, entidadeFiltro]);

  // Lista final com status de inventário
  const listaInventario = useMemo(() => {
    return produtosDaEntidade.map(produto => {
      const registro = inventario.find(i => i.produtoId === produto.id);
      return {
        produto,
        quantidade: registro?.quantidade ?? null,
        unidadeMedida: registro?.unidadeMedida ?? 'un',
        dataConferencia: registro?.dataConferencia ?? null,
        status: registro?.status ?? 'pendente' as const,
      };
    });
  }, [produtosDaEntidade, inventario]);

  // Aplicar filtros de produto e status
  const listaFiltrada = useMemo(() => {
    let lista = listaInventario;

    // Filtro por produto
    if (produtoFiltro.length > 0) {
      lista = lista.filter(item => produtoFiltro.includes(item.produto.id));
    }

    // Filtro por status
    if (statusFiltro.length > 0) {
      lista = lista.filter(item => statusFiltro.includes(item.status));
    }

    return lista;
  }, [listaInventario, produtoFiltro, statusFiltro]);

  // Abrir modal de conferência
  const abrirConferencia = (produto: Produto) => {
    const registro = inventario.find(i => i.produtoId === produto.id);
    setProdutoSelecionado(produto);
    setQuantidadeConferida(registro?.quantidade?.toString() ?? '');
    setUnidadeSelecionada(registro?.unidadeMedida ?? 'un');
  };

  // Para conferência, usar a primeira entidade selecionada
  const entidadeFiltroId = entidadeFiltro.length > 0 ? entidadeFiltro[0] : '';

  // Pré-confirmar conferência (valida e abre confirmação)
  const preConfirmarConferencia = () => {
    const quantidade = parseInt(quantidadeConferida);
    if (isNaN(quantidade) || quantidade < 0) {
      toast.error('Quantidade inválida');
      return;
    }
    setMostrarConfirmacao(true);
  };

  // Confirmar conferência (salva no banco)
  const confirmarConferencia = async () => {
    if (!produtoSelecionado || !entidadeFiltroId) return;

    const quantidade = parseInt(quantidadeConferida);

    setSalvando(true);
    const sucesso = await conferirProduto(produtoSelecionado.id, entidadeFiltroId, quantidade, unidadeSelecionada);
    setSalvando(false);

    if (sucesso) {
      toast.success('Inventário atualizado');
      setMostrarConfirmacao(false);
      setProdutoSelecionado(null);
      setQuantidadeConferida('');
      setUnidadeSelecionada('un');
    } else {
      toast.error('Erro ao salvar');
      setMostrarConfirmacao(false);
    }
  };

  // Contadores
  const totalProdutos = listaInventario.length;
  const conferidos = listaInventario.filter(i => i.status === 'conferido').length;
  const pendentes = totalProdutos - conferidos;

  // Exportar CSV
  const exportarCSV = () => {
    const entidadeNome = entidadeFiltro.map(id => entidades.find(e => e.id === id)?.nome).filter(Boolean).join('_') || 'Inventario';
    const dataExport = format(new Date(), 'dd-MM-yyyy_HH-mm');
    
    const header = ['Código', 'Nome', 'Qtd Estoque', 'Status', 'Última Conferência'];
    
    const rows = listaFiltrada.map(item => [
      item.produto.codigo,
      item.produto.nome,
      item.quantidade !== null ? item.quantidade.toString() : '-',
      item.status === 'conferido' ? 'CONFERIDO' : 'PENDENTE',
      item.dataConferencia ? format(item.dataConferencia, "dd/MM/yyyy HH:mm") : '-',
    ]);
    
    const BOM = '\uFEFF';
    const csv = BOM + [header, ...rows].map(row => row.map(cell => `"${cell}"`).join(';')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventario_${entidadeNome.replace(/\s+/g, '_')}_${dataExport}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    toast.success('CSV exportado com sucesso');
  };

  // Exportar PDF
  const exportarPDF = () => {
    const entidadeNome = entidadeFiltro.map(id => entidades.find(e => e.id === id)?.nome).filter(Boolean).join(', ') || 'Inventário';
    const dataExport = format(new Date(), "dd/MM/yyyy 'às' HH:mm");
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inventário - ${entidadeNome}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { font-size: 18px; margin-bottom: 5px; }
          .info { color: #666; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; font-weight: bold; }
          .status-conferido { color: green; font-weight: bold; }
          .status-pendente { color: #b45309; font-weight: bold; }
          .center { text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>Inventário - ${entidadeNome}</h1>
        <p class="info">Exportado em ${dataExport} | ${listaFiltrada.length} produtos</p>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th class="center">Qtd Estoque</th>
              <th class="center">Status</th>
              <th class="center">Última Conferência</th>
            </tr>
          </thead>
          <tbody>
            ${listaFiltrada.map(item => `
              <tr>
                <td>${item.produto.codigo}</td>
                <td>${item.produto.nome}</td>
                <td class="center">${item.quantidade !== null ? item.quantidade : '-'}</td>
                <td class="center ${item.status === 'conferido' ? 'status-conferido' : 'status-pendente'}">
                  ${item.status === 'conferido' ? 'CONFERIDO' : 'PENDENTE'}
                </td>
                <td class="center">${item.dataConferencia ? format(item.dataConferencia, "dd/MM/yyyy HH:mm") : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
    
    toast.success('PDF gerado - use "Salvar como PDF" na impressora');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Inventário</h1>
              <p className="text-sm text-muted-foreground">
                Controle manual de estoque por conferência
              </p>
            </div>
          </div>

          {/* Botão Exportar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={loading || listaFiltrada.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportarPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportarCSV}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar Planilha (CSV)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Indicadores */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total de Produtos</p>
            <p className="text-2xl font-bold">{totalProdutos}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Conferidos</p>
            <p className="text-2xl font-bold text-green-600">{conferidos}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">{pendentes}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border border-border">
          {/* Filtro por Entidade */}
          <div className="space-y-2 min-w-[200px]">
            <label className="text-sm font-medium text-foreground">Entidade</label>
            <Select value={entidadeFiltro} onValueChange={setEntidadeFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a entidade" />
              </SelectTrigger>
              <SelectContent>
                {entidades.map((entidade) => (
                  <SelectItem key={entidade.id} value={entidade.id}>
                    {entidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Produto (Combobox) */}
          <div className="space-y-2 min-w-[250px]">
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
                    : produtosDaEntidade.find(p => p.id === produtoFiltro)?.nome || 'Selecionar...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command filter={(value, search) => {
                  const produto = produtosDaEntidade.find(p => p.id === value);
                  if (!produto) return value === 'todos' && 'todos os produtos'.includes(search.toLowerCase()) ? 1 : 0;
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
                      {produtosDaEntidade.map((produto) => (
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

          {/* Filtro por Status */}
          <div className="space-y-2 min-w-[150px]">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="conferido">Conferidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : listaFiltrada.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 mb-2 opacity-50" />
              <p>Nenhum produto encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-center w-[120px]">Qtd Estoque</TableHead>
                  <TableHead className="text-center w-[120px]">Status</TableHead>
                  <TableHead className="text-center w-[150px]">Última Conferência</TableHead>
                  <TableHead className="text-center w-[100px]">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listaFiltrada.map((item) => (
                  <TableRow key={item.produto.id}>
                    <TableCell className="font-mono text-sm">{item.produto.codigo}</TableCell>
                    <TableCell className="font-medium">{item.produto.nome}</TableCell>
                    <TableCell className="text-center">
                      {item.quantidade !== null ? `${item.quantidade} ${item.unidadeMedida}` : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.status === 'conferido' ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          CONFERIDO
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">
                          PENDENTE
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {item.dataConferencia
                        ? format(item.dataConferencia, "dd/MM/yy 'às' HH:mm", { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirConferencia(item.produto)}
                      >
                        Conferir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Modal de Conferência */}
      <Dialog open={!!produtoSelecionado} onOpenChange={(open) => !open && setProdutoSelecionado(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferir Estoque</DialogTitle>
            <DialogDescription>
              {produtoSelecionado && (
                <span>
                  <strong>{produtoSelecionado.codigo}</strong> - {produtoSelecionado.nome}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade em Estoque</label>
              <Input
                type="number"
                min="0"
                value={quantidadeConferida}
                onChange={(e) => setQuantidadeConferida(e.target.value)}
                placeholder="Digite a quantidade"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Unidade de Medida</label>
              <Select value={unidadeSelecionada} onValueChange={setUnidadeSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES.map((unidade) => (
                    <SelectItem key={unidade.value} value={unidade.value}>
                      {unidade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProdutoSelecionado(null)}>
              Cancelar
            </Button>
            <Button onClick={preConfirmarConferencia} disabled={salvando}>
              Confirmar Inventário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação */}
      <AlertDialog open={mostrarConfirmacao} onOpenChange={setMostrarConfirmacao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Conferência?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p><strong>Produto:</strong> {produtoSelecionado?.nome}</p>
                <p><strong>Quantidade:</strong> {quantidadeConferida} {unidadeSelecionada}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={salvando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarConferencia} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
