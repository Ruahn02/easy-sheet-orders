

## Plano: Corrigir erros de build (nomes de tabelas e tipos)

### Problema raiz

Ao reconectar o Supabase, os tipos gerados automaticamente em `src/integrations/supabase/types.ts` refletem os nomes reais das tabelas, que diferem do que o codigo usa:

| Codigo usa | Tabela real no banco |
|---|---|
| `configuracoes` | `configuraçoes` (com cedilha) |
| `produto_entidades` | `produtos_entidades` (plural) |
| `pedido_itens` | `pedidos_itens` (plural) |

O TypeScript rejeita os nomes incorretos porque nao existem nos tipos gerados. Alem disso, o campo `ordem` na tabela `produtos` e do tipo `text` no banco, mas o tipo `Produto` espera `number`.

### Solucao

Adicionar casts `as any` nas chamadas ao Supabase onde os nomes divergem, para contornar a tipagem sem alterar o banco nem o arquivo de tipos gerado.

**Arquivo: `src/hooks/useSupabaseData.ts`**
- Todas as chamadas `.from('configuracoes')` → `.from('configuraçoes' as any)`
- Todas as chamadas `.from('produto_entidades')` → `.from('produtos_entidades' as any)`
- Todas as chamadas `.from('pedido_itens')` → `.from('pedidos_itens' as any)`
- Na linha 334 do mapeamento de produtos, converter `ordem` para number: `ordem: p.ordem ? Number(p.ordem) : undefined`
- Na linha 441 do `reorderProdutos`, converter number para string: `ordem: String(index + 1)`

**Arquivo: `src/hooks/useMaintenanceMode.ts`**
- Todas as chamadas `.from('configuracoes')` → `.from('configuraçoes' as any)`
- Adicionar cast `(data as any).valor` onde acessa `.valor`

**Arquivo: `src/lib/connectionMonitor.ts`**
- Chamada `.from('pedido_itens')` → `.from('pedidos_itens' as any)`

### Sobre sua duvida

Nao, voce **nao precisara reorganizar** quando reconectar o banco anterior. O problema atual e apenas de tipagem (nomes de tabelas com cedilha e plural). Uma vez corrigido com os casts, vai funcionar com qualquer conexao a esse mesmo banco.

A chance de erro futuro e **muito baixa** — os casts `as any` ignoram a tipagem do SDK mas as queries continuam validas no PostgreSQL. O fluxo funcional permanece identico.

### Arquivos alterados

| Arquivo | Alteracao |
|---|---|
| `src/hooks/useSupabaseData.ts` | Corrigir nomes de tabelas + tipo `ordem` |
| `src/hooks/useMaintenanceMode.ts` | Corrigir nome `configuraçoes` |
| `src/lib/connectionMonitor.ts` | Corrigir nome `pedidos_itens` |

