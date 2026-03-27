

## Plano: Restaurar conexao com banco antigo

### Problema
O arquivo `src/integrations/supabase/client.ts` esta hardcoded para o projeto errado (`erinfehlgalaibuyzgcl`). Precisa usar as variaveis de ambiente que apontam para `iblwavjssbjxgormmppg`.

### Correcoes

**1. `src/integrations/supabase/client.ts`** — Usar variaveis de ambiente
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

**2. `src/hooks/useSupabaseData.ts`** — Corrigir nomes de tabelas
- `"produtos_entidades" as any` → `"produto_entidades" as any` (4 ocorrencias: linhas 326, 407, 445, 454)
- `"pedidos_itens" as any` → `"pedido_itens" as any` (3 ocorrencias: linhas 566, 693, 924 aproximadamente)
- `String(index + 1)` → `index + 1` na funcao reorderProdutos (linha 476)

**3. `src/lib/connectionMonitor.ts`** — Corrigir nome da tabela
- `"pedidos_itens" as any` → `"pedido_itens" as any`

### Resultado
- App volta a se conectar ao banco correto (ALMOXARIFADO01)
- Produtos, entidades, lojas, pedidos e itens carregam normalmente
- Vinculacao de produtos a multiplas entidades funciona
- Reordenacao de produtos funciona

### Risco
Muito baixo. Sao apenas 3 arquivos com correcoes pontuais. O banco antigo ja esta com RLS policies configuradas e dados intactos.

