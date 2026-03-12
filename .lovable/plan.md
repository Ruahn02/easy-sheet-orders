

## Plano: Estoque Estimado no Inventário

### O que faz

Após conferir um produto (ex: 50 un em 01/03), o sistema calcula automaticamente as saídas desse produto nos pedidos feitos **após** a data da conferência e mostra uma estimativa do estoque atual.

```text
Qtd Conferida: 50 un (conferido em 01/03)
Saídas desde conferência: 30 un (de pedidos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estoque Estimado: ~20 un
```

### Como funciona

1. Para cada produto com inventário conferido, buscar todos os `pedido_itens` cujo `pedido.data` seja **posterior** à `data_conferencia` do inventário, filtrando pela mesma entidade
2. Somar as quantidades desses itens de pedido
3. Subtrair do valor conferido → estoque estimado
4. O valor conferido original **nunca** é alterado

### Mudanças

**Arquivo: `src/hooks/useSupabaseData.ts`**
- Criar novo hook `useEstoqueEstimado` (ou adicionar ao `useInventario`) que:
  - Recebe a lista de inventário (produto_id, quantidade, data_conferencia, entidade_id)
  - Faz query nos `pedidos` + `pedido_itens` com `data > data_conferencia` e `entidade_id` correspondente
  - Retorna um Map de `produto_id → { saidas: number, estimado: number }`

**Arquivo: `src/pages/admin/Inventario.tsx`**
- Na coluna "Qtd Estoque", exibir abaixo do valor conferido uma linha menor com o estoque estimado (ex: `~20 un`) em cor diferenciada
- Só aparece quando há conferência registrada e houve saídas desde então
- Adicionar coluna ou info extra: "Saídas" mostrando o total de saídas desde a conferência

### Lógica da query

```typescript
// Para cada produto conferido, buscar pedidos após data_conferencia
const { data: pedidos } = await supabase
  .from('pedidos')
  .select('id, data')
  .eq('entidade_id', entidadeId)
  .gt('data', dataConferencia);

// Buscar itens desses pedidos para o produto
const { data: itens } = await supabase
  .from('pedido_itens')
  .select('quantidade')
  .in('pedido_id', pedidoIds)
  .eq('produto_id', produtoId);

const totalSaidas = itens.reduce((sum, i) => sum + i.quantidade, 0);
const estimado = quantidadeConferida - totalSaidas;
```

### Visual na tabela

A coluna "Qtd Estoque" ficará:

```text
50 un              ← valor conferido (bold, como hoje)
Est. ~20 un        ← estimativa em texto menor, cor cinza/azul
```

Se não houver saídas, não mostra a estimativa. Se estimativa for negativa, mostra em vermelho.

### Nenhuma mudança no banco de dados

Tudo é calculado no frontend a partir de dados já existentes (inventario + pedidos + pedido_itens).

