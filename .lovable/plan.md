

## Corrigir "Nenhum produto para reordenar"

### Problema

O componente `ReorderProducts` inicializa `items` como array vazio e tenta sincronizar os produtos no callback `handleOpenChange`. Porem, quando o dialog abre via prop controlada (`open={true}`), o Radix Dialog nao dispara `onOpenChange(true)` -- so dispara ao fechar. Resultado: `items` permanece vazio e aparece "Nenhum produto para reordenar".

### Correcao

**Arquivo:** `src/components/admin/ReorderProducts.tsx`

Trocar a logica de sincronizacao de `handleOpenChange` para um `useEffect` que observa `open` e `produtos`:

```typescript
// Remover handleOpenChange e usar useEffect
useEffect(() => {
  if (open) {
    setItems([...produtos]);
  }
}, [open, produtos]);
```

E no Dialog, voltar a usar `onOpenChange` diretamente:

```typescript
<Dialog open={open} onOpenChange={onOpenChange}>
```

### Impacto

- Corrige o bug sem alterar nenhuma outra logica
- Apenas 1 arquivo modificado
- Nenhuma mudanca no banco ou em outros componentes
