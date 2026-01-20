import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Package, Eye, EyeOff, Search, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useEntidades, useProdutos } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Produto } from '@/types';

export default function Produtos() {
  const { produtos, loading, addProduto, updateProduto, deleteProduto } = useProdutos();
  const { entidades } = useEntidades();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    qtdMaxima: 100,
    fotoUrl: '',
    status: 'ativo' as 'ativo' | 'inativo',
    entidadeId: '',
    ordem: '' as string,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Filtros
  const [entidadeFiltro, setEntidadeFiltro] = useState<string>('');
  const [busca, setBusca] = useState('');

  // Confirmações
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [inativarConfirm, setInativarConfirm] = useState<Produto | null>(null);

  // Produtos filtrados
  const produtosFiltrados = useMemo(() => {
    let lista = produtos;
    
    if (entidadeFiltro && entidadeFiltro !== 'all') {
      lista = lista.filter(p => p.entidadeId === entidadeFiltro);
    }
    
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(p => 
        p.codigo.toLowerCase().includes(q) || 
        p.nome.toLowerCase().includes(q)
      );
    }
    
    return lista;
  }, [produtos, entidadeFiltro, busca]);

  const handleOpenModal = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto);
      setFormData({
        codigo: produto.codigo,
        nome: produto.nome,
        qtdMaxima: produto.qtdMaxima,
        fotoUrl: produto.fotoUrl || '',
        status: produto.status,
        entidadeId: produto.entidadeId,
        ordem: produto.ordem?.toString() || '',
      });
    } else {
      setEditingProduto(null);
      setFormData({
        codigo: '',
        nome: '',
        qtdMaxima: 100,
        fotoUrl: '',
        status: 'ativo',
        entidadeId: entidadeFiltro && entidadeFiltro !== 'all' ? entidadeFiltro : (entidades.length > 0 ? entidades[0].id : ''),
        ordem: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.codigo.trim() || !formData.nome.trim()) {
      toast({ title: 'Código e nome são obrigatórios', variant: 'destructive' });
      return;
    }
    if (!formData.entidadeId) {
      toast({ title: 'Selecione uma entidade de pedido', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const ordemValue = formData.ordem.trim() ? parseInt(formData.ordem) : undefined;

    if (editingProduto) {
      const success = await updateProduto(editingProduto.id, {
        codigo: formData.codigo,
        nome: formData.nome,
        qtdMaxima: formData.qtdMaxima,
        status: formData.status,
        entidadeId: formData.entidadeId,
        ordem: ordemValue,
      });
      if (success) {
        toast({ title: 'Produto atualizado!' });
      }
    } else {
      const result = await addProduto({
        codigo: formData.codigo,
        nome: formData.nome,
        qtdMaxima: formData.qtdMaxima,
        status: formData.status,
        entidadeId: formData.entidadeId,
        ordem: ordemValue,
      });
      if (result) {
        toast({ title: 'Produto criado!' });
      }
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      const success = await deleteProduto(deleteConfirm);
      if (success) {
        toast({ title: 'Produto excluído!' });
      }
      setDeleteConfirm(null);
    }
  };

  const handleToggleStatus = (produto: Produto) => {
    if (produto.status === 'ativo') {
      // Vai inativar - pedir confirmação
      setInativarConfirm(produto);
    } else {
      // Vai ativar - pode fazer direto
      handleAtivar(produto);
    }
  };

  const handleAtivar = async (produto: Produto) => {
    const success = await updateProduto(produto.id, { status: 'ativo' });
    if (success) {
      toast({ title: 'Produto ativado!' });
    }
  };

  const handleInativarConfirm = async () => {
    if (inativarConfirm) {
      const success = await updateProduto(inativarConfirm.id, { status: 'inativo' });
      if (success) {
        toast({ title: 'Produto inativado!' });
      }
      setInativarConfirm(null);
    }
  };

  const getEntidadeNome = (entidadeId: string) => {
    return entidades.find(e => e.id === entidadeId)?.nome || '-';
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
            <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground">Gerencie os produtos do catálogo</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-secondary/30 border border-border">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-1 block">Filtrar por Entidade</label>
            <Select value={entidadeFiltro} onValueChange={setEntidadeFiltro}>
              <SelectTrigger className="bg-background">
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
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-1 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Código ou nome..."
                className="pl-10 bg-background"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium text-foreground">Código</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Nome</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Entidade</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Qtd. Máx.</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((produto) => (
                  <tr key={produto.id} className="border-b border-border">
                    <td className="px-4 py-3">
                      <span className="font-mono text-primary">{produto.codigo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                          {produto.fotoUrl ? (
                            <img src={produto.fotoUrl} alt={produto.nome} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-foreground">{produto.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {getEntidadeNome(produto.entidadeId)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-foreground">{produto.qtdMaxima}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={produto.status === 'ativo' ? 'default' : 'secondary'}
                        className={
                          produto.status === 'ativo'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {produto.status === 'ativo' ? '🟢 Ativo' : '🔴 Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(produto)}
                          className={produto.status === 'ativo' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}
                          title={produto.status === 'ativo' ? 'Inativar' : 'Ativar'}
                        >
                          {produto.status === 'ativo' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(produto)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDeleteClick(produto.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {produtosFiltrados.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {produtos.length === 0 
                ? 'Nenhum produto cadastrado.' 
                : 'Nenhum produto encontrado com os filtros aplicados.'}
            </div>
          )}
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Entidade de Pedido */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Entidade de Pedido *</label>
                <Select
                  value={formData.entidadeId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, entidadeId: value }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione..." />
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Código *</label>
                  <Input
                    value={formData.codigo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, codigo: e.target.value }))}
                    placeholder="P001"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Qtd. Máxima</label>
                  <Input
                    type="number"
                    value={formData.qtdMaxima}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, qtdMaxima: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Nome *</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome do produto"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">URL da Foto (opcional)</label>
                <Input
                  value={formData.fotoUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fotoUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>


              {/* Status */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value as 'ativo' | 'inativo',
                    }))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="ativo">🟢 Ativo</SelectItem>
                    <SelectItem value="inativo">🔴 Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ordem */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Ordem (opcional)</label>
                <Input
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ordem: e.target.value }))}
                  placeholder="Ex: 1, 2, 3..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Menor número = aparece primeiro. Vazio = final da lista.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingProduto ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmação de Exclusão */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O produto será excluído permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
                Sim, excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmação de Inativar */}
        <AlertDialog open={!!inativarConfirm} onOpenChange={() => setInativarConfirm(null)}>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Inativar produto?</AlertDialogTitle>
              <AlertDialogDescription>
                Ao inativar, o produto "{inativarConfirm?.nome}" NÃO aparecerá mais no formulário de pedidos.
                <br />
                Você poderá ativar novamente quando quiser.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleInativarConfirm} className="bg-amber-500 text-white hover:bg-amber-600">
                Sim, inativar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
