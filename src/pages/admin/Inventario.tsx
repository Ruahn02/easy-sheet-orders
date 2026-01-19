import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useEntidades, useProdutos, useInventario } from '@/hooks/useSupabaseData';
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
import { ClipboardCheck, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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
  const [entidadeFiltro, setEntidadeFiltro] = useState<string>('');
  const [produtoFiltro, setProdutoFiltro] = useState<string>('todos');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [produtoPopoverOpen, setProdutoPopoverOpen] = useState(false);

  // Modal de conferência
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidadeConferida, setQuantidadeConferida] = useState<string>('');
  const [salvando, setSalvando] = useState(false);

  const loading = loadingEntidades || loadingProdutos || loadingInventario;

  // Seleciona primeira entidade automaticamente
  useMemo(() => {
    if (entidades.length > 0 && !entidadeFiltro) {
      setEntidadeFiltro(entidades[0].id);
    }
  }, [entidades, entidadeFiltro]);

  // Produtos filtrados por entidade
  const produtosDaEntidade = useMemo(() => {
    if (!entidadeFiltro) return [];
    return produtos.filter(p => p.entidadeId === entidadeFiltro);
  }, [produtos, entidadeFiltro]);

  // Lista final com status de inventário
  const listaInventario = useMemo(() => {
    return produtosDaEntidade.map(produto => {
      const registro = inventario.find(i => i.produtoId === produto.id);
      return {
        produto,
        quantidade: registro?.quantidade ?? null,
        dataConferencia: registro?.dataConferencia ?? null,
        status: registro?.status ?? 'pendente' as const,
      };
    });
  }, [produtosDaEntidade, inventario]);

  // Aplicar filtros de produto e status
  const listaFiltrada = useMemo(() => {
    let lista = listaInventario;

    // Filtro por produto
    if (produtoFiltro !== 'todos') {
      lista = lista.filter(item => item.produto.id === produtoFiltro);
    }

    // Filtro por status
    if (statusFiltro === 'pendente') {
      lista = lista.filter(item => item.status === 'pendente');
    } else if (statusFiltro === 'conferido') {
      lista = lista.filter(item => item.status === 'conferido');
    }

    return lista;
  }, [listaInventario, produtoFiltro, statusFiltro]);

  // Abrir modal de conferência
  const abrirConferencia = (produto: Produto) => {
    const registro = inventario.find(i => i.produtoId === produto.id);
    setProdutoSelecionado(produto);
    setQuantidadeConferida(registro?.quantidade?.toString() ?? '');
  };

  // Confirmar conferência
  const confirmarConferencia = async () => {
    if (!produtoSelecionado || !entidadeFiltro) return;

    const quantidade = parseInt(quantidadeConferida);
    if (isNaN(quantidade) || quantidade < 0) {
      toast.error('Quantidade inválida');
      return;
    }

    setSalvando(true);
    const sucesso = await conferirProduto(produtoSelecionado.id, entidadeFiltro, quantidade);
    setSalvando(false);

    if (sucesso) {
      toast.success('Inventário atualizado');
      setProdutoSelecionado(null);
      setQuantidadeConferida('');
    } else {
      toast.error('Erro ao salvar');
    }
  };

  // Contadores
  const totalProdutos = listaInventario.length;
  const conferidos = listaInventario.filter(i => i.status === 'conferido').length;
  const pendentes = totalProdutos - conferidos;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
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
                      {item.quantidade !== null ? item.quantidade : '-'}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProdutoSelecionado(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarConferencia} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Inventário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
