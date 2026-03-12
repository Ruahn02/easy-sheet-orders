

## Plano: Comportamento Duplo no MultiSelectFilter

### O que muda

No componente `MultiSelectFilter`, o clique terá dois comportamentos distintos:

- **Clicar no checkbox (quadradinho)** → adiciona/remove da seleção múltipla (comportamento atual)
- **Clicar no nome/texto do item** → seleciona **somente** aquele item (seleção única, substitui tudo) e fecha o popover

### Mudanças

**Arquivo: `src/components/ui/multi-select-filter.tsx`**

1. Remover `pointer-events-none` do Checkbox para torná-lo clicável independentemente
2. Separar o layout de cada `CommandItem` em duas áreas clicáveis:
   - **Checkbox**: ao clicar, chama `toggleOption(value)` (multi-select, mantém popover aberto)
   - **Label/texto**: ao clicar, chama `selectSingle(value)` que faz `onSelectionChange([value])` e fecha o popover
3. O `onSelect` do `CommandItem` (ativado por teclado/Enter) continuará como seleção única
4. Nova função `selectSingle`:
   ```typescript
   const selectSingle = (value: string) => {
     onSelectionChange([value]);
     setOpen(false);
   };
   ```

### Estrutura do item

```text
┌─────────────────────────────┐
│ [☐]  Nome do Produto        │
│  ↑         ↑                │
│ toggle   selectSingle       │
│ (multi)  (single + fecha)   │
└─────────────────────────────┘
```

O item "Todos" mantém o comportamento atual (limpa a seleção).

