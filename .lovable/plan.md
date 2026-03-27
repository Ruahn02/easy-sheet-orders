

## Plano: Remover polling de 30s de todos os hooks

### O que muda

Remover os `setInterval` de 30 segundos dos 4 hooks que fazem polling. O Realtime (que ja existe) continuara funcionando normalmente para receber atualizacoes em tempo real.

### Hooks afetados em `src/hooks/useSupabaseData.ts`

| Hook | Polling atual | Realtime | Acao |
|---|---|---|---|
| useEntidades | 30s interval | Sim | Remover interval |
| useLojas | 30s interval | Sim | Remover interval |
| useProdutos | 30s interval | Sim | Remover interval |
| useLojaEntidades | 30s interval | Sim | Remover interval |
| usePedidos | Nenhum | Sim | Ja esta correto |

### connectionMonitor.ts

O interval de 30s no connectionMonitor e **diferente** — ele so roda quando ha pedidos offline pendentes na fila. Esse sera mantido pois serve para sincronizar pedidos feitos offline.

### Tambem remover

- A flag `supabaseRestricted` e a funcao `checkRestricted` que pausavam polling (nao serao mais necessarias sem polling)

### Resultado

- Zero requisicoes periodicas ao Supabase
- Dados continuam atualizando via Realtime (instantaneo)
- Dados carregam no mount (fetch inicial)
- Economia significativa de banda

### Arquivo alterado

| Arquivo | Alteracao |
|---|---|
| `src/hooks/useSupabaseData.ts` | Remover 4 setIntervals + flag supabaseRestricted |

