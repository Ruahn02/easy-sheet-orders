

## Plano: Corrigir Exibicao e Exportacao de Pedidos para Produtos N:N

### Diagnostico do Problema

**Causa raiz identificada (linha 72-75 de Pedidos.tsx):**

```tsx
const produtosDaEntidade = useMemo(() => {
  if (!selectedEntidadeId) return [];
  return produtos.filter((p) => p.entidadeId === selectedEntidadeId);  // <-- PROBLEMA
}, [produtos, selectedEntidadeId]);
```

O filtro usa `p.entidadeId` (campo legado que guarda apenas UMA entidade) em vez de verificar se o produto pertence a entidade via relacionamento N:N (`p.entidadeIds`).

**Impacto:**
- Produtos que pertencem a multiplas entidades via tabela `produto_entidades` mas tem `entidade_id` diferente nao aparecem como colunas na grade
- Ao visualizar pedidos da Entidade B, produtos associados a ela (via N:N) mas com `entidade_id = Entidade A` ficam invisiveis
- Itens desses pedidos existem mas nao tem coluna correspondente na grade

**Exemplo concreto:**
- Produto "Caneta" tem `entidade_id = "Escritorio"` (legado)
- Produto "Caneta" tambem esta vinculado a "Uso e Consumo" via `produto_entidades`
- Pedido da entidade "Uso e Consumo" inclui "Caneta"
- Ao visualizar pedidos de "Uso e Consumo", coluna "Caneta" nao aparece
- Item fica "invisivel" na grade

---

### Analise dos Exports

**XLSX Export (linhas 342-359) - CORRETO:**
```tsx
const rows = filteredPedidos.flatMap(pedido => 
  pedido.itens
    .filter(item => item.quantidade > 0)
    .map(item => {
      const produto = produtos.find(p => p.id === item.produtoId);
      // ... usa array 'produtos' completo, busca por ID
    })
);
```
Este codigo itera diretamente sobre `pedido.itens` e busca produtos do array completo.

**PDF Export (linhas 402-437) - CORRETO:**
```tsx
const itensComQty = pedido.itens.filter(i => i.quantidade > 0);
const tableData = itensComQty.map(item => {
  const produto = produtos.find(p => p.id === item.produtoId);
  // ... usa array 'produtos' completo
});
```
Tambem itera diretamente sobre os itens do pedido.

**Conclusao dos Exports:** O codigo dos exports esta correto. Se ha problemas, devem estar na busca de dados.

---

### Problema Secundario: Limite de 1000 Pedidos

**Arquivo: useSupabaseData.ts (linhas 355-363)**
```tsx
const { data: pedidosData, error: pedidosError } = await supabase
  .from('pedidos')
  .select('*')
  .order('data', { ascending: false });
// Sem .limit(), mas PostgREST tem limite padrao de 1000
```

Se existirem mais de 1000 pedidos, os mais antigos nao serao buscados e seus itens consequentemente nao serao carregados.

---

### Solucao

**1. Corrigir filtro de produtos na grade (Pedidos.tsx linha 72-75):**

```tsx
// ANTES (incorreto)
const produtosDaEntidade = useMemo(() => {
  if (!selectedEntidadeId) return [];
  return produtos.filter((p) => p.entidadeId === selectedEntidadeId);
}, [produtos, selectedEntidadeId]);

// DEPOIS (correto - usa N:N)
const produtosDaEntidade = useMemo(() => {
  if (!selectedEntidadeId) return [];
  return produtos.filter((p) => p.entidadeIds.includes(selectedEntidadeId));
}, [produtos, selectedEntidadeId]);
```

**2. Adicionar paginacao na busca de pedidos (useSupabaseData.ts):**

```tsx
// Buscar pedidos em lotes para contornar limite de 1000
let allPedidos: any[] = [];
let pedidoOffset = 0;
const pedidoPageSize = 1000;
let pedidoHasMore = true;

while (pedidoHasMore) {
  const { data: batch, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('data', { ascending: false })
    .range(pedidoOffset, pedidoOffset + pedidoPageSize - 1);

  if (error) break;
  
  allPedidos = [...allPedidos, ...(batch || [])];
  pedidoHasMore = (batch?.length || 0) === pedidoPageSize;
  pedidoOffset += pedidoPageSize;
}

const pedidosData = allPedidos;
```

---

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/admin/Pedidos.tsx` | Corrigir filtro `produtosDaEntidade` para usar `entidadeIds.includes()` |
| `src/hooks/useSupabaseData.ts` | Adicionar paginacao na busca de pedidos em `usePedidos()` |

---

### Fluxo Corrigido

```
1. usePedidos() busca TODOS os pedidos (com paginacao)
2. Para cada pedido, busca seus itens de pedido_itens (ja paginado)
3. pedido.itens contem todos os produtos solicitados
4. produtosDaEntidade filtra produtos que INCLUEM a entidade selecionada (N:N)
5. Grade exibe colunas para todos os produtos relevantes
6. Export itera diretamente sobre pedido.itens (ja funciona)
```

---

### Validacoes a Fazer Apos Implementacao

| Cenario | Esperado |
|---------|----------|
| Pedido com multiplos produtos | Todos aparecem na grade e export |
| Produto vinculado a mais de um tipo | Aparece em ambas as entidades |
| Pedido recem-criado | Todos os itens visiveis |
| Pedido antigo (> 1000 pedidos atras) | Carregado e exibido corretamente |

---

### Secao Tecnica

**Por que `entidadeIds.includes()` resolve:**
- A propriedade `entidadeIds` e um array preenchido a partir da tabela `produto_entidades` (N:N)
- Contem TODAS as entidades as quais o produto pertence
- O filtro correto verifica se o produto esta associado a entidade selecionada

**Por que a paginacao de pedidos e necessaria:**
- PostgREST/Supabase tem limite padrao de 1000 linhas
- Pedidos sao ordenados por data decrescente
- Sem paginacao, apenas os 1000 mais recentes sao carregados
- Itens de pedidos antigos nunca seriam buscados

