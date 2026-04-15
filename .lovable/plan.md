

## Plano: Coluna de data de conclusao + grafico de produtividade

### Risco: MUITO BAIXO
- Apenas adiciona uma coluna nullable a tabela `pedidos` (nao quebra nada existente)
- Atualiza o hook `updatePedidoStatus` para gravar a data quando status = 'feito'
- O grafico e uma feature nova aditiva

### Alteracoes

**1. Migration: adicionar coluna `data_conclusao` na tabela `pedidos`**

```sql
ALTER TABLE pedidos ADD COLUMN data_conclusao timestamp with time zone DEFAULT NULL;
```

Coluna nullable — pedidos existentes ficam com NULL (nao quebra nada). Quando um pedido for marcado como "feito", grava `now()`. Se voltar para "pendente", limpa o campo.

**2. `src/hooks/useSupabaseData.ts`**

No `updatePedidoStatus`: quando `status === 'feito'`, incluir `data_conclusao: new Date().toISOString()` no update. Quando voltar para outro status, enviar `data_conclusao: null`.

No mapeamento de pedidos do fetch, ler `data_conclusao` e mapear para o tipo.

**3. `src/types/index.ts`**

Adicionar `dataConclusao?: Date` ao tipo `Pedido`.

**4. Novo componente: `src/components/admin/ProdutividadeChart.tsx`**

- Grafico de barras mostrando pedidos concluidos por dia
- Usa dados dos pedidos que tem `dataConclusao` preenchido
- Filtros: entidade, loja, periodo (data inicio/fim)
- Usar recharts (ja disponivel via shadcn/chart)

**5. `src/pages/admin/Dashboard.tsx`**

- Adicionar botao/secao para abrir o grafico de produtividade
- Passar pedidos e filtros ao componente

### Arquivos

| Arquivo | Tipo | Alteracao |
|---|---|---|
| Migration SQL | Novo | Adicionar coluna `data_conclusao` |
| `src/types/index.ts` | Editar | Adicionar `dataConclusao?: Date` |
| `src/hooks/useSupabaseData.ts` | Editar | Gravar/limpar `data_conclusao` no update de status |
| `src/components/admin/ProdutividadeChart.tsx` | Novo | Grafico de barras com filtros |
| `src/pages/admin/Dashboard.tsx` | Editar | Integrar grafico |

