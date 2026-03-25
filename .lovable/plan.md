

## Calculo de Consumo de Egress do Supabase

### Dados reais do banco

| Tabela | Linhas | Tamanho JSON estimado |
|--------|--------|-----------------------|
| entidades | 6 | ~2 KB |
| lojas | 68 | ~15 KB |
| produtos | 252 | ~90 KB |
| pedidos | 809 | ~280 KB |
| pedido_itens | 10.859 | ~2.100 KB |
| loja_entidades | 188 | ~38 KB |
| **Total por ciclo** | | **~2,5 MB** |

O **grande vilao** e a tabela `pedido_itens` (10.859 linhas) que sozinha representa ~85% do egress por ciclo. E ela e buscada inteira a cada polling do `usePedidos`.

### Limite do Supabase Free Tier: **5 GB/mes**

### Cenarios (por aba aberta)

| Intervalo | Ciclos/min | Egress/hora | Horas pra estourar 5GB |
|-----------|-----------|-------------|------------------------|
| **30s** | 2 | ~300 MB/h | **~16 horas** |
| **1 min** | 1 | ~150 MB/h | **~33 horas** |
| **5 min** | 0.2 | ~30 MB/h | **~167 horas (~7 dias)** |

### Conclusao

- **30 segundos**: Estoura em menos de 1 dia de uso continuo. **Nao resolve.**
- **1 minuto**: Estoura em ~1.5 dias. **Nao resolve.**
- **5 minutos**: Aguenta ~7 dias de uso continuo. **Ainda pode estourar** se tiver multiplas abas ou varios usuarios.

### A solucao real: nao buscar `pedido_itens` no polling

O problema nao e o intervalo — e buscar 10.859 linhas de `pedido_itens` a cada ciclo. A solucao correta e:

1. **Remover o polling do hook `usePedidos`** e confiar apenas no **Realtime** (que ja esta configurado) para atualizacoes em tempo real — o Realtime nao consome egress significativo pois so envia os registros que mudaram.

2. **Manter polling apenas nos hooks leves** (entidades, lojas, produtos, loja_entidades) que juntos somam ~145 KB por ciclo — a cada 30s isso daria apenas ~7 MB/hora, totalmente seguro.

3. **Alternativa**: no `usePedidos`, buscar apenas pedidos recentes (ultimos 7 dias) em vez de todos, reduzindo drasticamente o volume.

### Plano de implementacao

**Arquivo**: `src/hooks/useSupabaseData.ts`

1. No `usePedidos` (~linha 547): remover o `setInterval` do polling e manter apenas o canal Realtime para atualizacoes
2. Nos outros 4 hooks: manter polling a cada 30s (145 KB/ciclo = seguro)
3. Adicionar filtro de data no `fetchPedidos`: buscar apenas pedidos dos ultimos 30 dias em vez de todos, reduzindo o volume de `pedido_itens` de 2MB para uma fracao

### Resultado esperado
- Egress dos 4 hooks leves: ~7 MB/hora → ~5 GB em 700+ horas (~29 dias). Cabe no mes.
- Pedidos atualizados via Realtime sem consumo de polling
- Dados historicos acessiveis sob demanda (pagina admin)

