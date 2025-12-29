import { useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
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
import { Produto } from '@/types';

export default function Produtos() {
  const { produtos, addProduto, updateProduto, deleteProduto } = useAppStore();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    qtdMaxima: 100,
    fotoUrl: '',
    status: 'disponivel' as 'disponivel' | 'indisponivel',
  });

  const handleOpenModal = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto);
      setFormData({
        codigo: produto.codigo,
        nome: produto.nome,
        qtdMaxima: produto.qtdMaxima,
        fotoUrl: produto.fotoUrl || '',
        status: produto.status,
      });
    } else {
      setEditingProduto(null);
      setFormData({ codigo: '', nome: '', qtdMaxima: 100, fotoUrl: '', status: 'disponivel' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.codigo.trim() || !formData.nome.trim()) {
      toast({ title: 'Código e nome são obrigatórios', variant: 'destructive' });
      return;
    }

    if (editingProduto) {
      updateProduto(editingProduto.id, {
        ...formData,
        fotoUrl: formData.fotoUrl || undefined,
      });
      toast({ title: 'Produto atualizado!' });
    } else {
      const novoProduto: Produto = {
        id: Date.now().toString(),
        codigo: formData.codigo,
        nome: formData.nome,
        qtdMaxima: formData.qtdMaxima,
        fotoUrl: formData.fotoUrl || undefined,
        status: formData.status,
        criadoEm: new Date(),
      };
      addProduto(novoProduto);
      toast({ title: 'Produto criado!' });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteProduto(id);
    toast({ title: 'Produto excluído!' });
  };

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

        {/* List */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-foreground">Código</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Qtd. Máx.</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
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
                  <td className="px-4 py-3 text-foreground">{produto.qtdMaxima}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={produto.status === 'disponivel' ? 'default' : 'secondary'}
                      className={
                        produto.status === 'disponivel'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {produto.status === 'disponivel' ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenModal(produto)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDelete(produto.id)}
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

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Código</label>
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
                <label className="text-sm font-medium text-foreground mb-2 block">Nome</label>
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
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value as 'disponivel' | 'indisponivel',
                    }))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="indisponivel">Indisponível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground">
                {editingProduto ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
