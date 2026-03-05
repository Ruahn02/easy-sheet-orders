

## Trocar Clique Esquerdo por Clique Direito para Pintar Código

### Problema
O Popover atual abre com clique esquerdo no header do produto, interferindo com a navegação normal (clicar nos códigos).

### Solução
Substituir o `Popover` por `ContextMenu` (botão direito do mouse) que já existe no projeto (`src/components/ui/context-menu.tsx`). O clique esquerdo volta a funcionar normalmente, e o seletor de cores só aparece com botão direito.

### Arquivo: `src/pages/admin/Pedidos.tsx`

- Importar `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent` no lugar do Popover
- Envolver cada `th` de produto com `ContextMenu` + `ContextMenuTrigger` ao invés de `Popover` + `PopoverTrigger`
- O conteúdo do seletor de cores vai dentro de `ContextMenuContent`
- O `th` volta a ser um elemento normal clicável sem abrir popover

