## Plano: Script SQL para recriar o banco do zero

### Risco: ZERO
Nada e alterado no projeto atual. Apenas gero um arquivo `.sql` em `/mnt/documents/` que voce pode baixar e rodar em outro projeto Supabase.

### O que o script vai conter

**1. Tabelas (10 no total)**
- `configuracoes` (chave/valor — guarda codigos de acesso, manutencao, etc.)
- `entidades` (tipos de pedido, com agendamento)
- `lojas` (com codigo de acesso e ordem)
- `loja_entidades` (N:N permissoes loja x entidade)
- `produtos` (com cor, imagem, ordem)
- `produto_entidades` (N:N produto x entidade)
- `pedidos` (incluindo `data_conclusao`, rastreabilidade de Controle)
- `pedido_itens`
- `pedido_separacao_itens`
- `inventario`

Cada `CREATE TABLE` com:
- Tipos exatos (uuid, text, integer, boolean, timestamp with time zone)
- Defaults (`gen_random_uuid()`, `now()`, `'pendente'`, etc.)
- Constraints NOT NULL identicas a producao

**2. Indices recomendados**
- `pedidos(data)`, `pedidos(loja_id)`, `pedidos(entidade_id)`, `pedidos(status)`, `pedidos(data_conclusao)`
- `pedido_itens(pedido_id)`, `pedido_itens(produto_id)`
- `inventario(produto_id)`, `inventario(entidade_id)`, `inventario(data_conferencia)`
- `produto_entidades(produto_id)`, `produto_entidades(entidade_id)`
- `loja_entidades(loja_id)`, `loja_entidades(entidade_id)`

(o banco atual nao tem todos — vou incluir como bonus pois melhora performance e nao quebra nada)

**3. RLS**
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` em todas
- Policies publicas identicas as atuais (SELECT/INSERT/UPDATE/DELETE para `public`), respeitando que algumas tabelas nao tem todas as operacoes (ex.: `pedido_itens` sem UPDATE/DELETE, `configuracoes` sem INSERT/DELETE)

**4. Storage**
- Comando para criar o bucket `produtos-imagens` como publico
- Policies de storage para upload/leitura/delete publicos (necessarias para o upload de imagens funcionar)

**5. Seed minimo (opcional, comentado)**
- INSERT em `configuracoes` com chaves padrao: `codigo_admin`, `codigo_acesso`, `manutencao_ativa` — comentado, voce descomenta se quiser

### Entrega
- Arquivo: `/mnt/documents/schema_easy_sheet_orders.sql`
- Pronto para colar no SQL Editor de qualquer projeto Supabase novo
- Incluo comentarios explicando cada secao

### Arquivos do projeto
Nenhum arquivo do projeto sera alterado. So gero o `.sql` para download.