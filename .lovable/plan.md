

## Correção: Ctrl+C mais confiável na tela de Pedidos

### Mudança

**Arquivo: `src/pages/admin/Pedidos.tsx`** (linhas 296-334)

Inverter a ordem: tentar `execCommand('copy')` primeiro (mais confiável em iframes/após refresh), e usar `navigator.clipboard` como fallback. Adicionar toast de erro em todos os caminhos de falha.

```typescript
// Ctrl+C para copiar
if ((e.ctrlKey || e.metaKey) && e.key === 'c' && focusedCell) {
  e.preventDefault();
  const content = getCellContent(focusedCell.row, focusedCell.col);
  
  const showSuccess = (text: string) => {
    toast({ title: 'Copiado!', description: text.length > 50 ? text.slice(0, 50) + '...' : text });
  };

  const copyWithExecCommand = (): boolean => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch { return false; }
  };

  if (copyWithExecCommand()) {
    showSuccess(content);
  } else if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(content)
      .then(() => showSuccess(content))
      .catch(() => toast({ title: 'Erro ao copiar', description: 'Clique na página e tente novamente', variant: 'destructive' }));
  } else {
    toast({ title: 'Erro ao copiar', description: 'Clique na página e tente novamente', variant: 'destructive' });
  }
  return;
}
```

Apenas 1 trecho alterado, sem impacto em nenhuma outra funcionalidade.

