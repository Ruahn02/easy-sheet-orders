import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Loader2, Info, Download, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAcesso } from '@/store/useLojaAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getQueue, PedidoOffline, updateQueueItem, removeFromQueue, markAsSent } from '@/lib/offlineQueue';
import { loadFromCache } from '@/lib/offlineCache';
import { exportarPedidoPDF } from '@/lib/exportPedidoPDF';
import { Produto, Loja, Entidade } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface PedidoEnviado {
  id: string;
  data: string;
  lojaNome: string;
  entidadeNome: string;
}

const PedidosEnviados = () => {
  const { ultimaLojaId } = useAcesso();
  const [pedidos, setPedidos] = useState<PedidoEnviado[]>([]);
  const [loading, setLoading] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<PedidoOffline[]>([]);
  const [retrying, setRetrying] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar dados de cache para resolver nomes
  const cachedLojas = useMemo(() => loadFromCache<Loja[]>('lojas') || [], []);
  const cachedEntidades = useMemo(() => loadFromCache<Entidade[]>('entidades') || [], []);
  const cachedProdutos = useMemo(() => loadFromCache<Produto[]>('produtos') || [], []);

  const getLojaName = (id: string) => cachedLojas.find(l => l.id === id)?.nome || 'Loja';
  const getEntidadeName = (id: string) => cachedEntidades.find(e => e.id === id)?.nome || 'Pedido';
  const getProdutoInfo = (id: string) => {
    const p = cachedProdutos.find(pr => pr.id === id);
    return { nome: p?.nome || 'Produto', codigo: p?.codigo || '' };
  };

  useEffect(() => {
    setOfflineQueue(getQueue());
  }, []);

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!ultimaLojaId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select(`
            id,
            data,
            lojas!pedidos_loja_id_fkey(nome),
            entidades!pedidos_entidade_id_fkey(nome)
          `)
          .eq('loja_id', ultimaLojaId)
          .order('data', { ascending: false });

        if (!error && data) {
          const pedidosFormatados = data.map((p: any) => ({
            id: p.id,
            data: p.data,
            lojaNome: p.lojas?.nome || 'Loja',
            entidadeNome: p.entidades?.nome || 'Pedido',
          }));
          setPedidos(pedidosFormatados);
        }
      } catch {}

      setLoading(false);
    };

    fetchPedidos();
  }, [ultimaLojaId]);

  const handleRetry = async (item: PedidoOffline) => {
    setRetrying(item.localId);
    try {
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          loja_id: item.pedidoData.lojaId,
          entidade_id: item.pedidoData.entidadeId,
          observacoes: item.pedidoData.observacoes || null,
          status: 'pendente',
          nome_solicitante: item.pedidoData.nomeSolicitante || null,
          email_solicitante: item.pedidoData.emailSolicitante || null,
          nome_colaborador: item.pedidoData.nomeColaborador || null,
          funcao_colaborador: item.pedidoData.funcaoColaborador || null,
          matricula_funcionario: item.pedidoData.matriculaFuncionario || null,
          motivo_solicitacao: item.pedidoData.motivoSolicitacao || null,
        } as any)
        .select()
        .single();

      if (pedidoError || !pedidoData) throw pedidoError;

      const itensInsert = item.pedidoData.itens.map((i) => ({
        pedido_id: pedidoData.id,
        produto_id: i.produtoId,
        quantidade: i.quantidade,
      }));

      const { error: itensError } = await supabase.from('pedido_itens' as any).insert(itensInsert);
      if (itensError) {
        await supabase.from('pedidos').delete().eq('id', pedidoData.id);
        throw itensError;
      }

      markAsSent(item.localId);
      removeFromQueue(item.localId);
      setOfflineQueue(getQueue());
      toast({ title: 'Pedido enviado com sucesso!' });
    } catch (err) {
      updateQueueItem(item.localId, { status: 'erro', tentativas: item.tentativas + 1 });
      setOfflineQueue(getQueue());
      toast({ title: 'Falha ao reenviar', description: 'Tente novamente mais tarde.', variant: 'destructive' });
    }
    setRetrying(null);
  };

  const handleExportPDF = (item: PedidoOffline) => {
    exportarPedidoPDF({
      lojaNome: getLojaName(item.pedidoData.lojaId),
      entidadeNome: getEntidadeName(item.pedidoData.entidadeId),
      data: item.criadoEm,
      observacoes: item.pedidoData.observacoes,
      emailSolicitante: item.pedidoData.emailSolicitante,
      nomeSolicitante: item.pedidoData.nomeSolicitante,
      nomeColaborador: item.pedidoData.nomeColaborador,
      funcaoColaborador: item.pedidoData.funcaoColaborador,
      matriculaFuncionario: item.pedidoData.matriculaFuncionario,
      motivoSolicitacao: item.pedidoData.motivoSolicitacao,
      itens: item.pedidoData.itens.map((i) => {
        const info = getProdutoInfo(i.produtoId);
        return { produtoNome: info.nome, produtoCodigo: info.codigo, quantidade: i.quantidade };
      }),
    });
  };

  const handleExportOnlinePDF = async (pedido: PedidoEnviado) => {
    // Buscar itens do pedido
    try {
      const { data: itensData } = await supabase
        .from('pedido_itens' as any)
        .select('produto_id, quantidade')
        .eq('pedido_id', pedido.id);

      exportarPedidoPDF({
        id: pedido.id,
        lojaNome: pedido.lojaNome,
        entidadeNome: pedido.entidadeNome,
        data: pedido.data,
        itens: (itensData || []).map((i: any) => {
          const info = getProdutoInfo(i.produto_id);
          return { produtoNome: info.nome, produtoCodigo: info.codigo, quantidade: i.quantidade };
        }),
      });
    } catch {
      toast({ title: 'Erro ao gerar PDF', variant: 'destructive' });
    }
  };

  const pendingItems = offlineQueue.filter(q => q.status === 'pendente_envio' || q.status === 'erro');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary text-primary-foreground">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        <div className="px-4 pb-4 text-center">
          <h1 className="text-xl font-bold">Pedidos Enviados</h1>
          <p className="text-sm text-primary-foreground/80">Comprovante de envio</p>
        </div>
      </div>

      {/* Pedidos em espera (offline queue) */}
      {pendingItems.length > 0 && (
        <div className="p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Pedidos Aguardando Envio ({pendingItems.length})
          </h2>
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div
                key={item.localId}
                className="bg-card border border-amber-300 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                    Aguardando envio
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.tentativas > 0 && `${item.tentativas} tentativa(s)`}
                  </span>
                </div>
                <div className="space-y-1 mb-3">
                  <p className="text-sm text-foreground">
                    {format(new Date(item.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {getLojaName(item.pedidoData.lojaId)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getEntidadeName(item.pedidoData.entidadeId)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.pedidoData.itens.length} produto(s) · {item.pedidoData.itens.reduce((s, i) => s + i.quantidade, 0)} itens
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRetry(item)}
                    disabled={retrying === item.localId}
                    className="flex-1"
                  >
                    {retrying === item.localId ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Reenviar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportPDF(item)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aviso sobre filtragem */}
      <div className="p-4">
        <Alert className="bg-muted/50 border-muted">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm text-muted-foreground">
            Esta tela mostra apenas pedidos enviados a partir deste computador.
            Pedidos feitos em outro computador não aparecem aqui.
          </AlertDescription>
        </Alert>
      </div>

      {/* Lista de Pedidos ou Estado Vazio */}
      <div className="px-4 pb-8">
        {pedidos.length === 0 && pendingItems.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Nenhum pedido enviado
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Nenhum pedido foi enviado a partir deste computador.
              Faça seu primeiro pedido para vê-lo aqui.
            </p>
            <Link to="/">
              <Button variant="outline" className="mt-6">
                Fazer um pedido
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    #{pedido.id.substring(0, 8).toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                      Enviado ao Almoxarifado
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExportOnlinePDF(pedido)}
                      className="h-7 w-7 p-0"
                      title="Baixar PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-foreground">
                    {format(new Date(pedido.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {pedido.lojaNome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pedido.entidadeNome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidosEnviados;
