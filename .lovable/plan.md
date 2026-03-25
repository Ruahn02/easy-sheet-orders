

## Plano: Sistema de Resiliência Offline com Fila de Pedidos

### Arquitetura

Criar 3 novos módulos no frontend, sem alterar o banco de dados:

```text
src/
  lib/
    offlineCache.ts      ← Cache de dados (localStorage)
    offlineQueue.ts      ← Fila de pedidos pendentes (localStorage)
    connectionMonitor.ts ← Monitor de conexão + reenvio automático
  components/
    OfflineIndicator.tsx  ← Banner de status de conexão
```

### 1. Cache Local de Dados (`src/lib/offlineCache.ts`)

- Funções `saveToCache(key, data)` e `loadFromCache(key)` usando localStorage
- Chaves: `cache_entidades`, `cache_lojas`, `cache_produtos`, `cache_loja_entidades`
- Cada entrada inclui timestamp para saber quando foi atualizada
- Nos hooks `useEntidades`, `useLojas`, `useProdutos`, `useLojaEntidades`:
  - Após fetch com sucesso → salvar no cache
  - Se fetch falhar (erro de rede ou 402) → carregar do cache e usar como fallback
  - O `setLoading(false)` acontece mesmo usando cache

### 2. Fila de Pedidos Offline (`src/lib/offlineQueue.ts`)

- Estrutura de cada pedido na fila:
  ```typescript
  interface PedidoOffline {
    localId: string;        // UUID gerado no frontend (crypto.randomUUID)
    pedidoData: { ... };    // Dados completos do pedido
    status: 'pendente_envio' | 'enviando' | 'enviado' | 'erro';
    criadoEm: string;       // ISO timestamp
    tentativas: number;
  }
  ```
- Funções: `addToQueue()`, `getQueue()`, `removeFromQueue()`, `updateQueueItem()`
- Armazenamento em `localStorage` com chave `pedidos_offline_queue`

### 3. Modificação do `addPedido` em `useSupabaseData.ts`

- Antes de tentar enviar ao Supabase:
  - Gerar `localId` via `crypto.randomUUID()`
  - Salvar na fila offline com status `pendente_envio`
- Tentar enviar normalmente
- Se sucesso → remover da fila, retornar resultado
- Se falha (rede ou 402) → manter na fila, retornar objeto local com flag `offline: true` para que o toast mostre "Pedido salvo localmente"
- O `FormularioPedido.tsx` ajusta o toast baseado no resultado

### 4. Monitor de Conexão (`src/lib/connectionMonitor.ts`)

- Escutar eventos `online`/`offline` do navegador
- Quando voltar online, tentar reenviar todos os pedidos da fila
- Retry com backoff: 5s, 15s, 30s, 60s
- Máximo de 5 tentativas automáticas por pedido
- Hook `useConnectionMonitor()` para uso nos componentes

### 5. Controle de Duplicidade

- Adicionar coluna virtual: não. Usar abordagem client-side.
- Antes de reenviar, verificar no localStorage se o `localId` já foi marcado como `enviado`
- Após envio com sucesso, guardar o `localId` em `pedidos_enviados_ids` no localStorage por 7 dias

### 6. Componente de Feedback (`src/components/OfflineIndicator.tsx`)

- Banner fixo no topo quando offline: "Sem conexão — pedidos serão salvos localmente"
- Badge no `OrderFooter` quando há pedidos pendentes na fila: "X pedido(s) aguardando envio"
- No `FormularioPedido`, toast diferenciado:
  - Sucesso online: "Pedido enviado com sucesso!"
  - Sucesso offline: "Pedido salvo localmente. Será enviado automaticamente."

### 7. Alterações por arquivo

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/offlineCache.ts` | **Novo** — cache localStorage |
| `src/lib/offlineQueue.ts` | **Novo** — fila de pedidos offline |
| `src/lib/connectionMonitor.ts` | **Novo** — monitor + reenvio automático |
| `src/components/OfflineIndicator.tsx` | **Novo** — banner de status |
| `src/hooks/useSupabaseData.ts` | Modificar `fetchEntidades/Lojas/Produtos/LojaEntidades` para salvar/ler cache. Modificar `addPedido` para usar fila offline |
| `src/pages/FormularioPedido.tsx` | Adicionar `OfflineIndicator`, ajustar toast baseado em resultado offline |
| `src/components/order/OrderFooter.tsx` | Adicionar badge de pedidos pendentes |
| `src/App.tsx` | Montar `useConnectionMonitor` no nível raiz |

### Riscos

- localStorage tem limite de ~5MB. Para este caso de uso (cache de ~150KB + fila de pedidos) é mais que suficiente.
- Não altera nenhuma tabela no Supabase.
- Fluxo atual continua idêntico quando online.

