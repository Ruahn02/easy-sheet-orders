

## Problema

Todas as tabelas tem RLS ativado mas **nenhuma policy** foi criada. O Supabase bloqueia todo acesso por padrao quando RLS esta ativo sem policies. Por isso tudo retorna vazio.

## Solucao

Criar policies de acesso publico (SELECT, INSERT, UPDATE, DELETE) para todas as tabelas que o app precisa. Este app nao usa autenticacao — as lojas acessam por codigo de acesso — entao as policies precisam ser abertas para o role `anon`.

### Migration SQL

Criar policies para as 9 tabelas:

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| configuracoes | anon | anon | anon | - |
| entidades | anon | anon | anon | anon |
| lojas | anon | anon | anon | anon |
| produtos | anon | anon | anon | anon |
| produtos_entidades | anon | anon | anon | anon |
| loja_entidades | anon | anon | anon | anon |
| pedidos | anon | anon | anon | anon |
| pedidos_itens | anon | anon | anon | anon |
| pedido_separacao_itens | anon | anon | anon | anon |
| inventario | anon | anon | anon | anon |

Cada policy usa `USING (true)` para SELECT/UPDATE/DELETE e `WITH CHECK (true)` para INSERT/UPDATE.

### Tambem corrigir: tabela `configuracoes` vs `configuraçoes`

Nos network requests vejo que o codigo esta chamando `configuracoes` (sem cedilha) e a tabela real tambem se chama `configuracoes` (sem cedilha). Mas o codigo atual usa `configuraçoes` (com cedilha) por causa do fix anterior. Preciso verificar e corrigir para usar o nome correto.

### Bug do infinite loop na pagina Inventario

O console mostra "Maximum update depth exceeded" no componente Inventario. Preciso investigar e corrigir o useEffect com dependencias instáveis.

### Arquivos alterados

| Arquivo | Alteracao |
|---|---|
| Migration SQL | Criar RLS policies para todas as tabelas |
| `src/hooks/useMaintenanceMode.ts` | Verificar nome correto da tabela configuracoes |
| `src/hooks/useSupabaseData.ts` | Verificar nome correto da tabela configuracoes |
| `src/pages/admin/Inventario.tsx` | Corrigir infinite loop |

