import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Package, Eye, EyeOff, Search, Loader2, X, Upload, ArrowUpDown } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useEntidades, useProdutos } from '@/hooks/useSupabaseData';
import { useImageUpload } from '@/hooks/useImageUpload';
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
import { ReorderProducts } from '@/components/admin/ReorderProducts';

export default function Produtos() {
  const { produtos, loading, addProduto, updateProduto, deleteProduto, reorderProdutos } = useProdutos();
  const { entidades } = useEntidades();
  const { uploadImage } = useImageUpload();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    qtdMaxima: 100,
    fotoUrl: '',
    status: 'ativo' as 'ativo' | 'inativo',
    entidadeIds: [] as string[],
    ordem: '' as string,
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para upload de imagem
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Filtros
  const [entidadesFiltro, setEntidadesFiltro] = useState<string[]>([]);
  const [busca, setBusca] = useState('');

  // Confirmações
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [inativarConfirm, setInativarConfirm] = useState<Produto | null>(null);
  const [isReorderOpen, setIsReorderOpen] = useState(false);

  // Produtos filtrados - usando N:N
  const produtosFiltrados = useMemo(() => {
    let lista = produtos;
    
    if (entidadesFiltro.length > 0) {
      lista = lista.filter(p => p.entidadeIds.some(id => entidadesFiltro.includes(id)));
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

  // Handlers de imagem
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validação de tamanho
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Imagem muito grande. Máximo 2MB.', variant: 'destructive' });
      return;
    }
    
    // Validação de tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Formato inválido. Use JPG, PNG ou WEBP.', variant: 'destructive' });
      return;
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, fotoUrl: '' }));
  };

  const handleOpenModal = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto);
      setFormData({
        codigo: produto.codigo,
        nome: produto.nome,
        qtdMaxima: produto.qtdMaxima,
        fotoUrl: produto.fotoUrl || '',
        status: produto.status,
        entidadeIds: produto.entidadeIds,
        ordem: produto.ordem?.toString() || '',
      });
      setImagePreview(produto.fotoUrl || null);
      setImageFile(null);
    } else {
      setEditingProduto(null);
      setFormData({
        codigo: '',
        nome: '',
        qtdMaxima: 100,
        fotoUrl: '',
        status: 'ativo',
        entidadeIds: entidadeFiltro && entidadeFiltro !== 'all' ? [entidadeFiltro] : (entidades.length > 0 ? [entidades[0].id] : []),
        ordem: '',
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.codigo.trim() || !formData.nome.trim()) {
      toast({ title: 'Código e nome são obrigatórios', variant: 'destructive' });
      return;
    }
    if (formData.entidadeIds.length === 0) {
      toast({ title: 'Selecione pelo menos uma entidade de pedido', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const ordemValue = formData.ordem.trim() ? parseInt(formData.ordem) : undefined;

    // Fazer upload da imagem se houver arquivo novo
    let finalImageUrl = formData.fotoUrl;
    
    if (imageFile) {
      setIsUploading(true);
      try {
        finalImageUrl = await uploadImage(imageFile) || '';
      } catch (err: any) {
        toast({ title: err.message || 'Erro ao enviar imagem', variant: 'destructive' });
        setIsUploading(false);
        setIsSaving(false);
        return;
      }
      setIsUploading(false);
    } else if (!imagePreview) {
      // Se removeu a imagem (preview está null mas não tem arquivo novo)
      finalImageUrl = '';
    }

    if (editingProduto) {
      const success = await updateProduto(editingProduto.id, {
        codigo: formData.codigo,
        nome: formData.nome,
        qtdMaxima: formData.qtdMaxima,
        status: formData.status,
        entidadeIds: formData.entidadeIds,
        ordem: ordemValue,
        fotoUrl: finalImageUrl || undefined,
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
        entidadeIds: formData.entidadeIds,
        ordem: ordemValue,
        fotoUrl: finalImageUrl || undefined,
      });
      if (result) {
        toast({ title: 'Produto criado!' });
      }
    }

    setIsSaving(false);
    setImageFile(null);
    setImagePreview(null);
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

  const getEntidadeNomes = (entidadeIds: string[]) => {
    if (entidadeIds.length === 0) return '-';
    const nomes = entidadeIds.map(id => entidades.find(e => e.id === id)?.nome).filter(Boolean);
    return nomes.length > 0 ? nomes.join(', ') : '-';
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
          <div className="flex gap-2">
            {entidadeFiltro && entidadeFiltro !== 'all' && (
              <Button variant="outline" onClick={() => setIsReorderOpen(true)}>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Reordenar Catálogo
              </Button>
            )}
            <Button onClick={() => handleOpenModal()} className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
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
                      <div className="flex flex-wrap gap-1">
                        {produto.entidadeIds.map(entId => (
                          <Badge key={entId} variant="outline" className="text-xs">
                            {entidades.find(e => e.id === entId)?.nome || '-'}
                          </Badge>
                        ))}
                      </div>
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
          <DialogContent className="bg-card max-h-[90vh] flex flex-col overflow-hidden">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 py-4 px-1">
              {/* Entidades de Pedido - Multi-select */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Entidades de Pedido *</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-background">
                  {entidades.map((ent) => (
                    <label key={ent.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={formData.entidadeIds.includes(ent.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, entidadeIds: [...prev.entidadeIds, ent.id] }));
                          } else {
                            setFormData(prev => ({ ...prev, entidadeIds: prev.entidadeIds.filter(id => id !== ent.id) }));
                          }
                        }}
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm">{ent.nome}</span>
                    </label>
                  ))}
                </div>
                {formData.entidadeIds.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.entidadeIds.length} entidade(s) selecionada(s)
                  </p>
                )}
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
              {/* Upload de Imagem */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Imagem do Produto (opcional)
                </label>
                
                {/* Preview */}
                {imagePreview ? (
                  <div className="relative w-32 h-32 mb-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 mb-2 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                {/* Input de arquivo */}
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors">
                      <Upload className="h-4 w-4" />
                      {imagePreview ? 'Trocar imagem' : 'Escolher imagem'}
                    </div>
                  </label>
                  {isUploading && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG ou WEBP. Máximo 2MB.
                </p>
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
            <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
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

        {/* Reorder Modal */}
        <ReorderProducts
          open={isReorderOpen}
          onOpenChange={setIsReorderOpen}
          produtos={produtosFiltrados.filter(p => p.status === 'ativo')}
          onSave={reorderProdutos}
        />
      </div>
    </AdminLayout>
  );
}
