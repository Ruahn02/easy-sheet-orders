import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Link2, Copy, ExternalLink, ToggleLeft, ToggleRight, Key, Loader2, Clock } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CriticalModeBanner } from '@/components/admin/CriticalModeBanner';
import { useEntidades, useProdutos, usePedidos, useCodigoAdmin } from '@/hooks/useSupabaseData';
import { useCriticalMode } from '@/store/useCriticalMode';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Entidade } from '@/types';

export default function Entidades() {
  const { entidades, loading, addEntidade, updateEntidade, deleteEntidade } = useEntidades();
  const { produtos } = useProdutos();
  const { pedidos } = usePedidos();
  const { codigoAdmin } = useCodigoAdmin();
  const { criticalMode } = useCriticalMode();
  const { toast } = useToast();

  const baseUrl = window.location.origin;

  // Contagem de pedidos pendentes por entidade
  const pendentesCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    pedidos.filter(p => p.status === 'pendente').forEach(p => {
      map[p.entidadeId] = (map[p.entidadeId] || 0) + 1;
    });
    return map;
  }, [pedidos]);
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência.`,
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntidade, setEditingEntidade] = useState<Entidade | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    aceitandoPedidos: true,
    tipoPedido: 'padrao' as 'padrao' | 'controle',
    agendamentoAtivo: false,
    horarioAberturaDia: 1,
    horarioAberturaHora: '08:00',
    horarioFechamentoDia: 5,
    horarioFechamentoHora: '18:00',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Confirmações
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<Entidade | null>(null);

  const DIAS_SEMANA = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda' },
    { value: 2, label: 'Terça' },
    { value: 3, label: 'Quarta' },
    { value: 4, label: 'Quinta' },
    { value: 5, label: 'Sexta' },
    { value: 6, label: 'Sábado' },
  ];

  const getDiaNome = (dia?: number) => DIAS_SEMANA.find(d => d.value === dia)?.label || '—';

  const handleOpenModal = (entidade?: Entidade) => {
    if (entidade) {
      setEditingEntidade(entidade);
      setFormData({
        nome: entidade.nome,
        aceitandoPedidos: entidade.aceitandoPedidos,
        tipoPedido: entidade.tipoPedido,
        agendamentoAtivo: entidade.agendamentoAtivo,
        horarioAberturaDia: entidade.horarioAberturaDia ?? 1,
        horarioAberturaHora: entidade.horarioAberturaHora ?? '08:00',
        horarioFechamentoDia: entidade.horarioFechamentoDia ?? 5,
        horarioFechamentoHora: entidade.horarioFechamentoHora ?? '18:00',
      });
    } else {
      setEditingEntidade(null);
      setFormData({
        nome: '',
        aceitandoPedidos: true,
        tipoPedido: 'padrao',
        agendamentoAtivo: false,
        horarioAberturaDia: 1,
        horarioAberturaHora: '08:00',
        horarioFechamentoDia: 5,
        horarioFechamentoHora: '18:00',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    if (editingEntidade) {
      const success = await updateEntidade(editingEntidade.id, {
        ...formData,
        horarioAberturaDia: formData.agendamentoAtivo ? formData.horarioAberturaDia : null,
        horarioAberturaHora: formData.agendamentoAtivo ? formData.horarioAberturaHora : null,
        horarioFechamentoDia: formData.agendamentoAtivo ? formData.horarioFechamentoDia : null,
        horarioFechamentoHora: formData.agendamentoAtivo ? formData.horarioFechamentoHora : null,
      });
      if (success) {
        toast({ title: 'Entidade atualizada!' });
      }
    } else {
      const result = await addEntidade(formData.nome, formData.aceitandoPedidos, formData.tipoPedido);
      if (result) {
        toast({ title: 'Entidade criada!' });
      }
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const getDeleteInfo = (id: string) => {
    const produtosVinculados = produtos.filter(p => p.entidadeId === id).length;
    const pedidosVinculados = pedidos.filter(p => p.entidadeId === id).length;
    return { produtosVinculados, pedidosVinculados };
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      const success = await deleteEntidade(deleteConfirm);
      if (success) {
        toast({ title: 'Entidade excluída!', description: 'Todos os produtos e pedidos vinculados foram removidos.' });
      }
      setDeleteConfirm(null);
    }
  };

  const handleToggleClick = (entidade: Entidade) => {
    if (entidade.aceitandoPedidos) {
      // Vai fechar - pedir confirmação
      setToggleConfirm(entidade);
    } else {
      // Vai abrir - pode fazer direto
      handleToggleOpen(entidade);
    }
  };

  const handleToggleOpen = async (entidade: Entidade) => {
    const success = await updateEntidade(entidade.id, { aceitandoPedidos: true, agendamentoAtivo: false });
    if (success) {
      toast({ title: 'Pedidos abertos!', description: entidade.agendamentoAtivo ? 'Agendamento automático foi desativado.' : undefined });
    }
  };

  const handleToggleConfirm = async () => {
    if (toggleConfirm) {
      const success = await updateEntidade(toggleConfirm.id, { aceitandoPedidos: false, agendamentoAtivo: false });
      if (success) {
        toast({ title: 'Pedidos fechados!', description: toggleConfirm.agendamentoAtivo ? 'Agendamento automático foi desativado.' : undefined });
      }
      setToggleConfirm(null);
    }
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

  const getProdutosAtivosCount = (entidadeId: string) => {
    return produtos.filter(p => p.entidadeId === entidadeId && p.status === 'ativo').length;
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
        <CriticalModeBanner />
        {/* Seção de Acessos do Sistema */}
        <div className="rounded-lg border border-primary bg-card p-4 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Acessos do Sistema
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Link Público */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Link Público (Formulário)</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm truncate">
                  {baseUrl}/pedido
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(`${baseUrl}/pedido`, 'Link público')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Link Admin */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Link Admin</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm truncate">
                  {baseUrl}/admin
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(`${baseUrl}/admin`, 'Link admin')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Código Admin */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Key className="h-3 w-3" />
                Código de Admin
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                  {codigoAdmin || '...'}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(codigoAdmin, 'Código admin')}
                  disabled={!codigoAdmin}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tipos de Pedido</h1>
            <p className="text-muted-foreground">Controle central do sistema - cada tipo gera um link público próprio</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gradient-primary text-primary-foreground" disabled={criticalMode}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Tipo
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{entidade.nome}</h3>
                    {(pendentesCountMap[entidade.id] || 0) > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {pendentesCountMap[entidade.id]} pendente{pendentesCountMap[entidade.id] > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getProdutosCount(entidade.id)} produtos ({getProdutosAtivosCount(entidade.id)} ativos)
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {entidade.tipoPedido === 'controle' ? '🔒 Controle' : '📋 Padrão'}
                  </Badge>
                </div>
              </div>

              {/* Botão Aceitando Pedidos */}
              <button
                onClick={() => handleToggleClick(entidade)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  entidade.aceitandoPedidos
                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                    : 'bg-red-50 border-red-200 hover:bg-red-100'
                }`}
              >
                <span className={`font-medium ${entidade.aceitandoPedidos ? 'text-green-700' : 'text-red-700'}`}>
                  {entidade.aceitandoPedidos ? '🟢 Aceitando pedidos' : '🔴 Pedidos fechados'}
                </span>
                {entidade.aceitandoPedidos ? (
                  <ToggleRight className="h-6 w-6 text-green-600" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-red-600" />
                )}
              </button>

              {/* Info de Agendamento */}
              {entidade.agendamentoAtivo && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span>
                    Abre: {getDiaNome(entidade.horarioAberturaDia)} {entidade.horarioAberturaHora || '—'} · Fecha: {getDiaNome(entidade.horarioFechamentoDia)} {entidade.horarioFechamentoHora || '—'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 p-2 rounded-md bg-secondary text-xs">
                <Link2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate text-foreground">/pedido/{entidade.id}</span>
              </div>

              {/* Ações de Link */}
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
                  onClick={() => handleDeleteClick(entidade.id)}
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

        {/* Modal Criar/Editar */}
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
                <label className="text-sm font-medium text-foreground mb-2 block">Tipo de Pedido *</label>
                <Select
                  value={formData.tipoPedido}
                  onValueChange={(value: 'padrao' | 'controle') => setFormData((prev) => ({ ...prev, tipoPedido: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="padrao">📋 Padrão - Sem rastreabilidade</SelectItem>
                    <SelectItem value="controle">🔒 Controle - Exige dados do solicitante/colaborador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.tipoPedido === 'controle' 
                    ? 'O formulário exigirá nome do solicitante, colaborador, matrícula e motivo.' 
                    : 'Formulário padrão, sem campos extras obrigatórios.'}
                </p>
              </div>

              {/* Agendamento */}
              <div className="space-y-3 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="agendamento" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Agendamento automático
                  </Label>
                  <Switch
                    id="agendamento"
                    checked={formData.agendamentoAtivo}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agendamentoAtivo: checked }))}
                  />
                </div>
                {formData.agendamentoAtivo && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Define quando os pedidos abrem e fecham automaticamente na semana.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Abre — Dia</label>
                        <Select
                          value={String(formData.horarioAberturaDia)}
                          onValueChange={(v) => setFormData((prev) => ({ ...prev, horarioAberturaDia: Number(v) }))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {DIAS_SEMANA.map(d => (
                              <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Abre — Hora</label>
                        <Input
                          type="time"
                          value={formData.horarioAberturaHora}
                          onChange={(e) => setFormData((prev) => ({ ...prev, horarioAberturaHora: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Fecha — Dia</label>
                        <Select
                          value={String(formData.horarioFechamentoDia)}
                          onValueChange={(v) => setFormData((prev) => ({ ...prev, horarioFechamentoDia: Number(v) }))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {DIAS_SEMANA.map(d => (
                              <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Fecha — Hora</label>
                        <Input
                          type="time"
                          value={formData.horarioFechamentoHora}
                          onChange={(e) => setFormData((prev) => ({ ...prev, horarioFechamentoHora: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingEntidade ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmação de Exclusão */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>⚠️ Excluir tipo de pedido?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  <p>Esta ação <strong>NÃO pode ser desfeita</strong>.</p>
                  {deleteConfirm && (
                    <>
                      <p className="text-destructive font-medium">
                        Serão excluídos PERMANENTEMENTE:
                      </p>
                      <ul className="list-disc list-inside text-sm">
                        <li>O tipo de pedido</li>
                        <li>{getDeleteInfo(deleteConfirm).produtosVinculados} produto(s) vinculado(s)</li>
                        <li>{getDeleteInfo(deleteConfirm).pedidosVinculados} pedido(s) vinculado(s)</li>
                      </ul>
                    </>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
                Sim, excluir TUDO
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmação de Fechar Pedidos */}
        <AlertDialog open={!!toggleConfirm} onOpenChange={() => setToggleConfirm(null)}>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Fechar pedidos?</AlertDialogTitle>
              <AlertDialogDescription>
                Ao fechar, as lojas NÃO poderão mais fazer pedidos para "{toggleConfirm?.nome}".
                <br />
                Você poderá abrir novamente quando quiser.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleToggleConfirm} className="bg-amber-500 text-white hover:bg-amber-600">
                Sim, fechar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
