import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Store, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLojas, useEntidades, useLojaEntidades } from '@/hooks/useSupabaseData';
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
import { Loja } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';

export default function Lojas() {
  const { lojas, loading, addLoja, updateLoja, deleteLoja } = useLojas();
  const { entidades } = useEntidades();
  const { lojaEntidades, setPermissoes, getEntidadesPermitidas } = useLojaEntidades();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoja, setEditingLoja] = useState<Loja | null>(null);
  const [formData, setFormData] = useState({ 
    nome: '', 
    status: 'ativo' as 'ativo' | 'inativo',
    ordem: '' as string
  });
  const [isSaving, setIsSaving] = useState(false);

  // Confirmação
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleOpenModal = (loja?: Loja) => {
    if (loja) {
      setEditingLoja(loja);
      setFormData({ 
        nome: loja.nome, 
        status: loja.status,
        ordem: loja.ordem?.toString() || ''
      });
    } else {
      setEditingLoja(null);
      setFormData({ 
        nome: '', 
        status: 'ativo',
        ordem: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const ordemValue = formData.ordem.trim() ? parseInt(formData.ordem) : undefined;

    if (editingLoja) {
      const success = await updateLoja(editingLoja.id, { 
        nome: formData.nome, 
        status: formData.status, 
        ordem: ordemValue 
      });
      if (success) {
        toast({ title: 'Loja atualizada!' });
      }
    } else {
      const result = await addLoja(formData.nome, formData.status, ordemValue);
      if (result) {
        toast({ title: 'Loja criada!' });
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
      const success = await deleteLoja(deleteConfirm);
      if (success) {
        toast({ title: 'Loja excluída!' });
      }
      setDeleteConfirm(null);
    }
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
            <h1 className="text-2xl font-bold text-foreground">Lojas</h1>
            <p className="text-muted-foreground">Gerencie as lojas/setores do sistema</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Nova Loja
          </Button>
        </div>

        {/* List */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-foreground">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lojas.map((loja) => (
                <tr key={loja.id} className="border-b border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Store className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{loja.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={loja.status === 'ativo' ? 'default' : 'secondary'}
                      className={
                        loja.status === 'ativo'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {loja.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenModal(loja)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDeleteClick(loja.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {lojas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma loja cadastrada.
            </div>
          )}
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>{editingLoja ? 'Editar Loja' : 'Nova Loja'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Nome</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome da loja"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value as 'ativo' | 'inativo' }))
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
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingLoja ? 'Salvar' : 'Criar'}
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
                Esta ação não pode ser desfeita. A loja será excluída permanentemente.
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
      </div>
    </AdminLayout>
  );
}
