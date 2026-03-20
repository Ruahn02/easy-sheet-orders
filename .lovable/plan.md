

## Implementação: Error Boundary + StoreSelect Leve + Lazy-render

Todas as mudanças são aditivas e não alteram nenhuma lógica existente de pedidos, banco, ou submissão.

### 1. Criar `src/components/ErrorBoundary.tsx` (novo arquivo)
- Componente React class com `getDerivedStateFromError` e `componentDidCatch`
- Exibe tela de recuperação com botões "Tentar novamente" e "Recarregar página" em vez de tela branca
- Props opcionais para customizar título e descrição do erro

### 2. Simplificar `src/components/order/StoreSelect.tsx`
- Substituir `Command` + `Popover` (pesado, causa crash em PCs lentos) por `Select` do Radix UI (já usado no projeto)
- Manter mesma interface (`lojas`, `selectedId`, `onSelect`)
- Resultado: componente muito mais leve, sem portal complexo

**De:**
```tsx
<Popover><Command><CommandInput>...
```
**Para:**
```tsx
<Select value={selectedId} onValueChange={onSelect}>
  <SelectTrigger>...</SelectTrigger>
  <SelectContent>
    {lojasAtivas.map(loja => <SelectItem .../>)}
  </SelectContent>
</Select>
```

### 3. Atualizar `src/pages/FormularioPedido.tsx`
- Envolver o retorno principal com `<ErrorBoundary>`
- Adicionar lazy-render: mostrar os primeiros 50 produtos inicialmente, com botão "Mostrar mais" para carregar +50
- Isso reduz a carga inicial em computadores com pouca memória

```tsx
const [limiteExibicao, setLimiteExibicao] = useState(50);
const produtosVisiveis = filteredProdutos.slice(0, limiteExibicao);

// No JSX:
<ErrorBoundary>
  ...
  {produtosVisiveis.map(p => <ProductCard .../>)}
  {filteredProdutos.length > limiteExibicao && (
    <Button onClick={() => setLimiteExibicao(prev => prev + 50)}>
      Mostrar mais produtos
    </Button>
  )}
  ...
</ErrorBoundary>
```

### Arquivos alterados
1. `src/components/ErrorBoundary.tsx` — novo
2. `src/components/order/StoreSelect.tsx` — simplificar para Select nativo
3. `src/pages/FormularioPedido.tsx` — envolver com ErrorBoundary + lazy-render

### Risco
**Zero risco para pedidos existentes.** Nenhuma mudança em banco, lógica de submissão, ou rotas. Apenas melhorias de UI para evitar crashes.

