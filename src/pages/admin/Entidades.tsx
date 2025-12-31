import { useState } from 'react';
import { Plus, Pencil, Trash2, Link2, Copy, ExternalLink } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAppStore } from '@/store/useAppStore';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Entidade } from '@/types';

export default function Entidades() {
  const { entidades, addEntidade, updateEntidade, deleteEntidade, produtos } = useAppStore();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntidade, setEditingEntidade] = useState<Entidade | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    status: 'ativo' as 'ativo' | 'inativo',
  });

  const baseUrl = window.location.origin;

  const handleOpenModal = (entidade?: Entidade) => {
    if (entidade) {
      setEditingEntidade(entidade);
      setFormData({
        nome: entidade.nome,
        status: entidade.status,
      });
    } else {
      setEditingEntidade(null);
      setFormData({ nome: '', status: 'ativo' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.nome.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    if (editingEntidade) {
      updateEntidade(editingEntidade.id, formData);
      toast({ title: 'Entidade atualizada!' });
    } else {
      const novaEntidade: Entidade = {
        id: 'ent' + Date.now().toString(),
        nome: formData.nome,
        status: formData.status,
        criadoEm: new Date(),
      };
      addEntidade(novaEntidade);
      toast({ title: 'Entidade criada!' });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const produtosVinculados = produtos.filter(p => p.entidadeId === id);
    if (produtosVinculados.length > 0) {
      toast({ 
        title: 'Não é possível excluir', 
        description: `Existem ${produtosVinculados.length} produto(s) vinculados a esta entidade.`,
        variant: 'destructive' 
      });
      return;
    }
    deleteEntidade(id);
    toast({ title: 'Entidade excluída!' });
  };

  const copyLink = (entidadeId: string) => {
    const link = `${baseUrl}/pedido/${entidadeId}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link copiado!' });
  };

  const openLink = (entidadeId: string) => {
    const link = `${baseUrl}/pedido/${entidadeId}`;
    window.open(link, '_blank');
  };

  const getProdutosCount = (entidadeId: string) => {
    return produtos.filter(p => p.entidadeId === entidadeId).length;
  };

  const getProdutosAbertosCount = (entidadeId: string) => {
    return produtos.filter(p => p.entidadeId === entidadeId && p.status === 'aberto').length;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Entidades de Pedido</h1>
            <p className="text-muted-foreground">Cada entidade gera um link público próprio</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Nova Entidade
          </Button>
        </div>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entidades.map((entidade) => (
            <div
              key={entidade.id}
              className="rounded-lg border border-border bg-card p-4 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{entidade.nome}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getProdutosCount(entidade.id)} produtos ({getProdutosAbertosCount(entidade.id)} abertos)
                  </p>
                </div>
                <Badge
                  variant={entidade.status === 'ativo' ? 'default' : 'secondary'}
                  className={
                    entidade.status === 'ativo'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  }
                >
                  {entidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              {/* Link público */}
              <div className="flex items-center gap-2 p-2 rounded-md bg-secondary text-xs">
                <Link2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate text-foreground">/pedido/{entidade.id}</span>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyLink(entidade.id)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => openLink(entidade.id)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Abrir
                </Button>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button size="sm" variant="ghost" onClick={() => handleOpenModal(entidade)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleDelete(entidade.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>

        {entidades.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma entidade cadastrada. Crie a primeira!
          </div>
        )}

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>{editingEntidade ? 'Editar Entidade' : 'Nova Entidade'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Nome *</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Material de Escritório"
                />
              </div>
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
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground">
                {editingEntidade ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
