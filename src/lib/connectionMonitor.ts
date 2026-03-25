// Monitor de conexão + reenvio automático de pedidos pendentes

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getPendingQueue, updateQueueItem, removeFromQueue, markAsSent, wasAlreadySent, PedidoOffline } from './offlineQueue';

// Tenta enviar um pedido da fila para o Supabase
async function sendPedidoToSupabase(item: PedidoOffline): Promise<boolean> {
  const { pedidoData } = item;

  // Controle de duplicidade
  if (wasAlreadySent(item.localId)) {
    removeFromQueue(item.localId);
    return true;
  }

  updateQueueItem(item.localId, { status: 'enviando' });

  try {
    const { data: pedidoResult, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        loja_id: pedidoData.lojaId,
        entidade_id: pedidoData.entidadeId,
        observacoes: pedidoData.observacoes || null,
        status: 'pendente',
        nome_solicitante: pedidoData.nomeSolicitante || null,
        email_solicitante: pedidoData.emailSolicitante || null,
        nome_colaborador: pedidoData.nomeColaborador || null,
        funcao_colaborador: pedidoData.funcaoColaborador || null,
        matricula_funcionario: pedidoData.matriculaFuncionario || null,
        motivo_solicitacao: pedidoData.motivoSolicitacao || null,
      } as any)
      .select()
      .single();

    if (pedidoError || !pedidoResult) {
      throw pedidoError || new Error('Sem resposta ao criar pedido');
    }

    const itensInsert = pedidoData.itens.map(i => ({
      pedido_id: pedidoResult.id,
      produto_id: i.produtoId,
      quantidade: i.quantidade,
    }));

    const { error: itensError } = await supabase
      .from('pedido_itens')
      .insert(itensInsert);

    if (itensError) {
      // Rollback
      await supabase.from('pedidos').delete().eq('id', pedidoResult.id);
      throw itensError;
    }

    // Sucesso
    markAsSent(item.localId);
    removeFromQueue(item.localId);
    console.log('[ConnectionMonitor] Pedido enviado com sucesso:', item.localId);
    return true;
  } catch (err: any) {
    const tentativas = item.tentativas + 1;
    updateQueueItem(item.localId, {
      status: 'erro',
      tentativas,
    });
    console.warn('[ConnectionMonitor] Falha ao enviar pedido:', item.localId, err?.message);
    return false;
  }
}

// Processa toda a fila de pendentes
async function processQueue(): Promise<number> {
  const pending = getPendingQueue();
  if (pending.length === 0) return 0;

  console.log(`[ConnectionMonitor] Processando ${pending.length} pedido(s) pendente(s)...`);
  let sent = 0;

  for (const item of pending) {
    if (item.tentativas >= 10) {
      console.warn('[ConnectionMonitor] Pedido excedeu tentativas máximas:', item.localId);
      continue;
    }
    const ok = await sendPedidoToSupabase(item);
    if (ok) sent++;
    else break; // Se falhou, para de tentar (provavelmente sem conexão)
  }

  return sent;
}

// Hook para monitorar conexão e disparar reenvio
export function useConnectionMonitor() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const backoffRef = useRef(0);

  const refreshPendingCount = useCallback(() => {
    setPendingCount(getPendingQueue().length);
  }, []);

  const trySync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const sent = await processQueue();
      if (sent > 0) {
        backoffRef.current = 0;
      }
      refreshPendingCount();
    } finally {
      setSyncing(false);
    }
  }, [syncing, refreshPendingCount]);

  // Escutar eventos online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[ConnectionMonitor] Conexão restaurada. Tentando sincronizar...');
      backoffRef.current = 0;
      trySync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[ConnectionMonitor] Sem conexão.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check inicial
    refreshPendingCount();

    // Tentar sincronizar a cada 30s se houver pendentes
    const interval = setInterval(() => {
      if (navigator.onLine && getPendingQueue().length > 0) {
        trySync();
      }
      refreshPendingCount();
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [trySync, refreshPendingCount]);

  return { isOnline, pendingCount, syncing, trySync, refreshPendingCount };
}

export { sendPedidoToSupabase, processQueue };
