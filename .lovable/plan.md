

## Plano: Polling de 5 segundos + Realtime como complemento

### Situação atual
- Não existe nenhum realtime configurado no projeto
- Cada hook (`useEntidades`, `useLojas`, `useProdutos`, `usePedidos`, etc.) faz fetch apenas uma vez no mount
- Não há polling

### Solução
Adicionar um `setInterval` de 5 segundos nos hooks principais para re-buscar dados automaticamente, **sem alterar nada da lógica existente**. Também adicionar Supabase Realtime como complemento (dispara fetch imediato ao receber notificação de mudança).

### Alterações em `src/hooks/useSupabaseData.ts`

**Para cada hook principal** (`useEntidades`, `useLojas`, `useProdutos`, `usePedidos`):

1. Adicionar um `useEffect` com `setInterval` de 5 segundos que chama a função `fetch` existente (silenciosamente, sem alterar `loading`)
2. Adicionar um `useEffect` com Supabase Realtime que escuta mudanças na tabela correspondente e dispara o `fetch` ao receber evento

Exemplo para `useEntidades`:
```typescript
// Polling de 5 segundos
useEffect(() => {
  const interval = setInterval(fetchEntidades, 5000);
  return () => clearInterval(interval);
}, [fetchEntidades]);

// Realtime
useEffect(() => {
  const channel = supabase
    .channel('entidades-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'entidades' }, () => {
      fetchEntidades();
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [fetchEntidades]);
```

Mesma abordagem para `useLojas` (tabela `lojas`), `useProdutos` (tabela `produtos` + `produto_entidades`), e `usePedidos` (tabela `pedidos` + `pedido_itens`).

### Cuidado com performance
- O `fetchEntidades`, `fetchLojas` são leves (poucas linhas)
- O `fetchPedidos` é mais pesado (busca paginada) — para evitar sobrecarga, o polling dele só re-busca se a aba estiver visível (`document.hidden === false`)
- Nenhuma mudança na lógica de submissão, optimistic updates, ou UI

### Risco
**Mínimo.** Apenas adiciona intervals e listeners. Não muda nenhuma lógica existente. Se o realtime falhar, o polling garante atualização. Se o polling falhar, o realtime garante.

