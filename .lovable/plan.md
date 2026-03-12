

## Plano: Corrigir Lentidão do Sistema

### Diagnóstico

O problema principal: **cada ação (marcar feito, mudar cor, adicionar pedido) dispara um `fetchPedidos()` que re-busca TODOS os pedidos + TODOS os itens do banco**, com loops de paginação. Conforme o volume de dados cresce, isso fica cada vez mais lento.

Pontos críticos encontrados no código:

1. **`updatePedidoStatus`** (linha 525) -- chama `await fetchPedidos()` após cada mudança de status
2. **`updatePedidoCor`** (linha 541) -- chama `await fetchPedidos()` após cada mudança de cor
3. **`addPedido`** (linha 521) -- chama `await fetchPedidos()` após adicionar pedido
4. **`fetchSeparacoesMultiplos`** (Pedidos.tsx linha 191) -- dispara toda vez que `filteredPedidos` muda, causando queries extras

### Solução: Atualizações Otimistas (sem re-fetch)

**Arquivo: `src/hooks/useSupabaseData.ts`**

Nas 3 funções do hook `usePedidos()`, substituir `await fetchPedidos()` por atualização local do estado:

| Função | Antes | Depois |
|--------|-------|--------|
| `updatePedidoStatus` | `await fetchPedidos()` | `setPedidos(prev => prev.map(p => p.id === id ? { ...p, status, observacoes } : p))` |
| `updatePedidoCor` | `await fetchPedidos()` | `setPedidos(prev => prev.map(p => p.id === id ? { ...p, corLinha: cor } : p))` |
| `addPedido` | `await fetchPedidos()` | Construir o objeto Pedido localmente e fazer `setPedidos(prev => [novoPedido, ...prev])` |

**Arquivo: `src/pages/admin/Pedidos.tsx`**

- Estabilizar o `useEffect` do `fetchSeparacoesMultiplos` para não disparar em cascata. Usar uma referência estável dos IDs dos pedidos (comparar string serializada) para evitar re-fetch desnecessário.

### Resultado esperado

- Marcar pedido como "feito" / mudar cor: **instantâneo** (sem ida ao banco para re-buscar)
- Navegar para tela de Pedidos: carrega 1x só, sem recarregamentos em cascata
- Adicionar pedido: aparece na lista imediatamente sem re-fetch

