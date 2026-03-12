

## Diagnóstico: Query `.in()` com muitos IDs quebrando

O problema principal está no `fetchPedidos()` em `src/hooks/useSupabaseData.ts`. Após buscar todos os 643 pedidos via paginação, o código faz:

```typescript
.in('pedido_id', pedidoIds) // 643 UUIDs = ~25.000 caracteres na URL
```

O PostgREST do Supabase tem limite de tamanho de URL (~8-16KB). Com 643 UUIDs (36 chars cada), a URL excede esse limite e a query **falha silenciosamente** -- os itens não são retornados, resultando em pedidos vazios ou dados incompletos nas telas.

### Correção

**Arquivo: `src/hooks/useSupabaseData.ts`** -- função `fetchPedidos()` (linhas ~411-433)

Dividir a busca de `pedido_itens` em **chunks de 200 IDs** para manter a URL dentro do limite:

```typescript
// Em vez de .in('pedido_id', pedidoIds) com todos os IDs de uma vez:
const chunkSize = 200;
let allItens: any[] = [];

for (let i = 0; i < pedidoIds.length; i += chunkSize) {
  const chunk = pedidoIds.slice(i, i + chunkSize);
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('pedido_itens')
      .select('*')
      .in('pedido_id', chunk)
      .range(offset, offset + 999);
    
    if (error) break;
    allItens = [...allItens, ...(batch || [])];
    hasMore = (batch?.length || 0) === 1000;
    offset += 1000;
  }
}
```

Isso resolve o problema sem alterar nenhuma outra lógica. Apenas 1 trecho de código modificado.

### Impacto

- Corrige a falha silenciosa de carregamento em Pedidos e qualquer tela que dependa de `usePedidos()`
- Mantém a paginação existente
- Mantém as atualizações otimistas já implementadas

