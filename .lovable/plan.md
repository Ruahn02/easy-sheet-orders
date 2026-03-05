

## Pintar Código do Produto na Planilha

### O que muda

Adicionar a opção de colorir individualmente cada coluna de código de produto no cabeçalho da planilha de Pedidos. Ao clicar com botão direito ou via um botão no header do código, abre um popover com as mesmas cores disponíveis para linhas. A cor aplicada pinta o header e toda a coluna daquele produto.

### 1. Migração no Banco

**Tabela `produtos`** - adicionar coluna:
- `cor_codigo` (text, nullable) -- armazena o valor hex da cor

### 2. Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/types/index.ts` | Adicionar `corCodigo?: string` em Produto |
| `src/hooks/useSupabaseData.ts` | Mapear `cor_codigo` no fetch/update de produtos |
| `src/pages/admin/Pedidos.tsx` | Adicionar Popover de cores no header de cada produto (th) + aplicar cor no header e nas células da coluna |

### 3. Detalhes

**Header do produto (Pedidos.tsx, linhas 850-882):**
- Envolver o `th` do produto com um Popover (ao clicar no código)
- Mostrar as mesmas `CORES_DISPONIVEIS` já usadas para linhas
- Ao selecionar cor, chamar `updateProduto` salvando `cor_codigo` no banco
- Aplicar `style={{ backgroundColor: produto.corCodigo }}` no `th` e nos `td` da coluna correspondente

**Hook (useSupabaseData.ts):**
- Adicionar função `updateProdutoCor(produtoId, cor)` ou reutilizar update existente

