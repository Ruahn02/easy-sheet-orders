

## Plano: Eliminar re-renders desnecessários do polling

### Problema
O polling a cada 5 segundos chama `setEntidades()`, `setLojas()`, `setProdutos()`, `setPedidos()` **mesmo quando os dados não mudaram**. Isso causa re-renders desnecessários a cada 5 segundos em todos os componentes, gerando o "delay" que você está sentindo.

### Solução
Adicionar uma comparação simples antes de chamar `setState`: só atualizar o estado se os dados realmente mudaram. Isso evita re-renders quando o polling retorna os mesmos dados.

### Alteração em `src/hooks/useSupabaseData.ts`

Em cada função `fetch` (`fetchEntidades`, `fetchLojas`, `fetchProdutos`, `fetchPedidos`), trocar o `setState` direto por uma comparação:

```typescript
// De:
setEntidades(mappedData);

// Para:
setEntidades(prev => {
  const next = JSON.stringify(mappedData);
  return JSON.stringify(prev) === next ? prev : mappedData;
});
```

Mesma lógica para `setLojas`, `setProdutos` e `setPedidos`.

### Resultado
- Polling continua a cada 5 segundos (mantém a segurança)
- Realtime continua funcionando
- Re-renders só acontecem quando dados realmente mudam
- Zero delay na interface

### Risco
Nenhum. Apenas evita setState quando desnecessário.

