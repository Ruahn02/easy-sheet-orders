

## Pintar Apenas o Header do Código (Não a Coluna Inteira)

### Mudança

Remover a aplicação de `backgroundColor` nas células de dados (`td`) da coluna do produto, mantendo a cor apenas no `th` (header do código).

### Arquivo: `src/pages/admin/Pedidos.tsx`

**Linha ~1059**: Remover a condição que aplica `produto.corCodigo` como backgroundColor no `td`. O style condicional que verifica `produto.corCodigo` será removido, deixando a cor apenas no quadradinho do header.

A linha 871 (header `th`) permanece inalterada — continua pintando o código.

