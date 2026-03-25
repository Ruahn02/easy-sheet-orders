// Fila de pedidos offline — salva no localStorage para resiliência

import { PedidoItem } from '@/types';

export interface PedidoOfflineData {
  lojaId: string;
  entidadeId: string;
  observacoes?: string;
  emailSolicitante?: string;
  itens: PedidoItem[];
  nomeSolicitante?: string;
  nomeColaborador?: string;
  funcaoColaborador?: string;
  matriculaFuncionario?: string;
  motivoSolicitacao?: string;
}

export interface PedidoOffline {
  localId: string;
  pedidoData: PedidoOfflineData;
  status: 'pendente_envio' | 'enviando' | 'enviado' | 'erro';
  criadoEm: string;
  tentativas: number;
}

const QUEUE_KEY = 'pedidos_offline_queue';
const SENT_IDS_KEY = 'pedidos_enviados_ids';

function readQueue(): PedidoOffline[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: PedidoOffline[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('[OfflineQueue] Erro ao salvar fila:', e);
  }
}

export function addToQueue(pedidoData: PedidoOfflineData): string {
  const localId = crypto.randomUUID();
  const item: PedidoOffline = {
    localId,
    pedidoData,
    status: 'pendente_envio',
    criadoEm: new Date().toISOString(),
    tentativas: 0,
  };
  const queue = readQueue();
  queue.push(item);
  writeQueue(queue);
  return localId;
}

export function getQueue(): PedidoOffline[] {
  return readQueue();
}

export function getPendingQueue(): PedidoOffline[] {
  return readQueue().filter(p => p.status === 'pendente_envio' || p.status === 'erro');
}

export function updateQueueItem(localId: string, updates: Partial<PedidoOffline>): void {
  const queue = readQueue();
  const idx = queue.findIndex(p => p.localId === localId);
  if (idx >= 0) {
    queue[idx] = { ...queue[idx], ...updates };
    writeQueue(queue);
  }
}

export function removeFromQueue(localId: string): void {
  const queue = readQueue().filter(p => p.localId !== localId);
  writeQueue(queue);
}

export function getPendingCount(): number {
  return readQueue().filter(p => p.status === 'pendente_envio' || p.status === 'erro').length;
}

// Controle de duplicidade
export function markAsSent(localId: string): void {
  try {
    const raw = localStorage.getItem(SENT_IDS_KEY);
    const sent: { id: string; at: string }[] = raw ? JSON.parse(raw) : [];
    sent.push({ id: localId, at: new Date().toISOString() });
    // Manter apenas últimos 7 dias
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const filtered = sent.filter(s => new Date(s.at) > cutoff);
    localStorage.setItem(SENT_IDS_KEY, JSON.stringify(filtered));
  } catch {}
}

export function wasAlreadySent(localId: string): boolean {
  try {
    const raw = localStorage.getItem(SENT_IDS_KEY);
    if (!raw) return false;
    const sent: { id: string }[] = JSON.parse(raw);
    return sent.some(s => s.id === localId);
  } catch {
    return false;
  }
}
