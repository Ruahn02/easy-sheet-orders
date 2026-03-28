

## Plano: Otimizar requisicoes para buscar apenas dados necessarios

### Risco de quebrar algo

**Baixo.** As tabelas pequenas (entidades, lojas, produtos, loja_entidades, configuracoes) tem poucos registros — buscar tudo e o correto para elas. A otimizacao real esta nas tabelas grandes: **pedidos** e **pedido_itens**, que crescem com o tempo. A mudanca e adicionar filtros opcionais aos hooks existentes, sem alterar o comportamento padrao.

### Situacao atual

| Dados | Comportamento | Problema |
|---|---|---|
| Entidades (~5-20 registros) | Busca tudo | OK, tabela pequena |
| Lojas (~5-50 registros) | Busca tudo | OK, tabela pequena |
| Produtos (~50-200 registros) | Busca tudo + produto_entidades | OK, tabela pequena |
| Loja_entidades (~50 registros) | Busca tudo | OK, tabela pequena |
| **Pedidos** (cresce infinitamente) | Busca 30 dias inteiros | Carrega TODOS os pedidos de 30 dias mesmo filtrando por 1 loja |
| **Pedido_itens** (cresce infinitamente) | Busca todos os itens dos pedidos acima | Idem |
| **Inventario** | Busca tudo | Poderia filtrar por entidade selecionada |
| **Estoque estimado** | Busca pedidos novamente (duplicado) | Requisicao extra ao Supabase |

### O que sera otimizado

**1. `usePedidos` — aceitar filtros opcionais**

Adicionar parametros opcionais de `lojaId` e `entidadeId` para que a query ao Supabase ja retorne apenas os pedidos relevantes, em vez de trazer tudo e filtrar no frontend.

```text
ANTES:  SELECT * FROM pedidos WHERE data >= 30dias  (tudo)
DEPOIS: SELECT * FROM pedidos WHERE data >= 30dias AND loja_id = 'X'  (filtrado)
```

A pagina de Pedidos passa os filtros selecionados. Se nenhum filtro estiver ativo, busca tudo (comportamento atual preservado).

**2. `useInventario` — filtrar por entidade**

A tela de inventario ja exige selecao de entidade. O hook passara o `entidadeId` selecionado para o Supabase.

```text
ANTES:  SELECT * FROM inventario  (tudo)
DEPOIS: SELECT * FROM inventario WHERE entidade_id = 'X'
```

**3. `useEstoqueEstimado` — receber pedidos ja carregados**

Hoje ele faz uma query separada de pedidos. Pode receber os pedidos ja carregados pelo `usePedidos` da mesma pagina, eliminando a requisicao duplicada.

### O que NAO muda

- Entidades, lojas, produtos, loja_entidades continuam buscando tudo (sao pequenas e usadas como lookup em varias telas)
- Realtime continua funcionando normalmente
- Cache offline continua funcionando

### Arquivos alterados

| Arquivo | Alteracao |
|---|---|
| `src/hooks/useSupabaseData.ts` | Adicionar filtros opcionais a `usePedidos`, `useInventario`; refatorar `useEstoqueEstimado` para aceitar pedidos externos |
| `src/pages/admin/Pedidos.tsx` | Passar filtros de loja/entidade selecionados ao `usePedidos` |
| `src/pages/admin/Inventario.tsx` | Passar entidade selecionada ao `useInventario`; passar pedidos ao `useEstoqueEstimado` |

### Detalhes tecnicos

**usePedidos** recebera um objeto de filtros opcional:
```typescript
usePedidos(filtros?: { lojaId?: string; entidadeId?: string })
```
Quando `filtros.lojaId` estiver definido, adiciona `.eq("loja_id", filtros.lojaId)` a query. Quando o filtro muda, refaz o fetch automaticamente via `useEffect`.

**useInventario** recebera entidadeId opcional:
```typescript
useInventario(entidadeId?: string)
```

**useEstoqueEstimado** recebera pedidos ja carregados em vez de buscar novamente:
```typescript
useEstoqueEstimado(inventarioList, entidadeIds, pedidosCarregados?)
```

